#!/usr/bin/env node

/**
 * NAM Fitness — Garmin Sync Recovery Tool
 *
 * Recovers missing rows in the "NAM Fitness — Garmin Daily Log" Google Sheet
 * after a NAS/backup failure by:
 * 1. Scanning the sheet for missing date ranges
 * 2. Importing from Garmin CSV export (downloaded from Garmin Connect → Health Stats)
 * 3. Populating missing rows back to the sheet
 *
 * Usage:
 *   node garmin-sync-recovery.js <csv-file> [--sheet-id=...] [--sheets-key=...]
 *
 * To get your sheet ID & API key:
 *   - Sheet ID: from the URL (https://docs.google.com/spreadsheets/d/SHEET_ID/edit)
 *   - Sheets API key: Set up at console.cloud.google.com, create an API key (public/unrestricted)
 *   - Or pass via env vars: SHEET_ID, SHEETS_KEY
 */

const fs = require('fs');
const readline = require('readline');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════════════════════════════════════

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✓ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  section: (msg) => console.log(`\n━━━ ${msg} ━━━`),
};

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { csvFile: null, sheetId: null, sheetsKey: null };

  args.forEach(arg => {
    if (arg.startsWith('--sheet-id=')) {
      result.sheetId = arg.split('=')[1];
    } else if (arg.startsWith('--sheets-key=')) {
      result.sheetsKey = arg.split('=')[1];
    } else if (!arg.startsWith('--')) {
      result.csvFile = arg;
    }
  });

  // Fall back to environment variables
  result.sheetId = result.sheetId || process.env.SHEET_ID;
  result.sheetsKey = result.sheetsKey || process.env.SHEETS_KEY;

  return result;
}

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CSV Parsing
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse Garmin Health Stats CSV export.
 * Expected columns: Date, VO2 Max, SpO2, Sleep, Heart Rate, Training Load, etc.
 */
function parseGarminCsv(csvPath) {
  log.section('Parsing Garmin CSV');

  if (!fs.existsSync(csvPath)) {
    log.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  if (lines.length < 2) {
    log.error('CSV appears empty');
    process.exit(1);
  }

  const headers = lines[0].split(',').map(h =>
    h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  );

  log.info(`Found ${headers.length} columns: ${headers.slice(0, 5).join(', ')}...`);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });

    // Normalize date field (try common names)
    const dateField = headers.find(h => h.includes('date'));
    if (dateField && row[dateField]) {
      row.date = normalizeDateString(row[dateField]);
      if (row.date) {
        rows.push(row);
      }
    }
  }

  log.success(`Parsed ${rows.length} rows from CSV`);
  if (rows.length > 0) {
    log.info(`Date range: ${rows[0].date} to ${rows[rows.length - 1].date}`);
  }

  return rows;
}

/**
 * Convert various date formats to ISO 8601 (YYYY-MM-DD)
 */
function normalizeDateString(dateStr) {
  if (!dateStr) return null;

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // MM/DD/YYYY or M/D/YYYY
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [_, m, d, y] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Try parsing as Date
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Google Sheets API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch the current Garmin Daily Log sheet data
 */
async function fetchSheetData(sheetId, sheetsKey, tabName = 'NAM Fitness — Garmin Daily Log') {
  log.section(`Fetching ${tabName}`);

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tabName)}?key=${sheetsKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const values = data.values || [];

    if (values.length < 2) {
      log.warn('Sheet is empty or only has headers');
      return { headers: [], rows: [] };
    }

    const headers = values[0].map(h =>
      h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    );

    const rows = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = (row[i] ?? '').toString().trim();
      });
      return obj;
    });

    log.success(`Fetched ${rows.length} rows (headers: ${headers.slice(0, 5).join(', ')}...)`);

    return { headers, rows };
  } catch (error) {
    log.error(`Failed to fetch sheet: ${error.message}`);
    log.info('Possible causes:');
    log.info('  - Invalid sheet ID or API key');
    log.info('  - Sheet is not publicly accessible (set to "Anyone with link can view")');
    log.info('  - Sheets API is not enabled on your Google Cloud project');
    process.exit(1);
  }
}

/**
 * Append rows to the Google Sheet
 */
async function appendToSheet(sheetId, sheetsKey, tabName, values) {
  log.section(`Appending ${values.length} rows to sheet`);

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(tabName)}:append?valueInputOption=RAW&key=${sheetsKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    log.success(`Appended ${values.length} rows`);
    return true;
  } catch (error) {
    log.error(`Failed to append: ${error.message}`);
    log.info('Note: The Sheets API key must have write permissions');
    log.info('Or use: --read-only to see what would be added without writing');
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Recovery Logic
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Find date ranges missing from the current sheet
 */
function findMissingDateRanges(currentDates, csvDates) {
  const current = new Set(currentDates.filter(d => d));
  const available = new Set(csvDates);

  const missing = Array.from(available).filter(d => !current.has(d)).sort();

  if (missing.length === 0) {
    log.info('No missing dates found!');
    return [];
  }

  log.info(`Found ${missing.length} missing dates`);

  // Group into ranges for display
  const ranges = [];
  let rangeStart = missing[0];
  let rangeEnd = missing[0];

  for (let i = 1; i < missing.length; i++) {
    const curr = parseISO(missing[i]);
    const prev = parseISO(missing[i - 1]);
    const dayDiff = (curr - prev) / (1000 * 60 * 60 * 24);

    if (dayDiff === 1) {
      rangeEnd = missing[i];
    } else {
      ranges.push({ start: rangeStart, end: rangeEnd, count: getRangeCount(rangeStart, rangeEnd) });
      rangeStart = missing[i];
      rangeEnd = missing[i];
    }
  }
  ranges.push({ start: rangeStart, end: rangeEnd, count: getRangeCount(rangeStart, rangeEnd) });

  return { missing, ranges };
}

function parseISO(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getRangeCount(start, end) {
  const s = parseISO(start);
  const e = parseISO(end);
  return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Build rows to insert based on CSV data and current sheet structure
 */
function buildRowsToInsert(csvRows, currentHeaders, missingDates) {
  log.section('Building rows for insertion');

  const missingSet = new Set(missingDates);
  const csvMap = {};
  csvRows.forEach(row => {
    if (row.date && missingSet.has(row.date)) {
      csvMap[row.date] = row;
    }
  });

  const rowsToInsert = [];
  missingDates.forEach(date => {
    const csvRow = csvMap[date];
    if (!csvRow) return;

    const newRow = [];
    currentHeaders.forEach(header => {
      // Map CSV column names to sheet column names
      const csvValue = csvRow[header] || csvRow[getMappedColumnName(header)] || '';
      newRow.push(csvValue);
    });

    rowsToInsert.push(newRow);
  });

  log.success(`Built ${rowsToInsert.length} rows for insertion`);
  return rowsToInsert;
}

/**
 * Map sheet column names to possible CSV column names
 */
function getMappedColumnName(sheetColumn) {
  const mappings = {
    'date': ['date', 'datestr'],
    'vo2_max': ['vo2', 'vo2max', 'vo2_max', 'maxvo2'],
    'spo2': ['spo2', 'sp02', 'bloodoxygen', 'blood_oxygen'],
    'sleep': ['sleep', 'sleep_minutes', 'sleepduration'],
    'heart_rate': ['heart_rate', 'hr', 'avghr', 'averageheartrate'],
    'training': ['training', 'trainingload', 'training_load'],
    'recovery': ['recovery', 'recovery_time', 'recovery_minutes'],
    'stress': ['stress', 'stresslevel'],
    'calories': ['calories', 'kcal', 'energy'],
    'steps': ['steps', 'step_count'],
    'distance': ['distance', 'total_distance'],
    'duration': ['duration', 'time_recorded', 'duration_minutes']
  };

  const targets = mappings[sheetColumn] || [sheetColumn];
  return targets[0];
}

// ═══════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const args = parseArgs();

  if (!args.csvFile) {
    log.error('No CSV file provided');
    console.log(`\nUsage: node garmin-sync-recovery.js <csv-file> [--sheet-id=...] [--sheets-key=...]\n`);
    console.log('Example:');
    console.log('  node garmin-sync-recovery.js ~/Downloads/garmin-export.csv');
    console.log('\nOr with credentials:');
    console.log('  SHEET_ID=xxx SHEETS_KEY=yyy node garmin-sync-recovery.js ~/Downloads/garmin-export.csv');
    process.exit(1);
  }

  log.section('NAM Fitness — Garmin Sync Recovery');

  // Get credentials
  let sheetId = args.sheetId;
  let sheetsKey = args.sheetsKey;

  if (!sheetId) {
    sheetId = await prompt('Enter Google Sheet ID: ');
  }
  if (!sheetsKey) {
    sheetsKey = await prompt('Enter Sheets API key: ');
  }

  if (!sheetId || !sheetsKey) {
    log.error('Sheet ID and API key are required');
    process.exit(1);
  }

  // Parse CSV
  const csvRows = parseGarminCsv(args.csvFile);
  if (csvRows.length === 0) {
    log.error('No valid rows found in CSV');
    process.exit(1);
  }

  // Fetch current sheet
  const { headers, rows } = await fetchSheetData(sheetId, sheetsKey);

  if (headers.length === 0) {
    log.error('Could not determine sheet structure');
    process.exit(1);
  }

  const currentDates = rows.map(r => r.date || r.datestr || '').filter(Boolean);
  const csvDates = csvRows.map(r => r.date).filter(Boolean);

  // Find missing dates
  const { missing, ranges } = findMissingDateRanges(currentDates, csvDates);

  if (missing.length === 0) {
    log.success('All dates are covered!');
    process.exit(0);
  }

  console.log('\nMissing date ranges:');
  ranges.forEach(r => {
    console.log(`  ${r.start} to ${r.end} (${r.count} days)`);
  });

  // Preview what we'll insert
  const rowsToInsert = buildRowsToInsert(csvRows, headers, missing);

  console.log(`\nWill insert ${rowsToInsert.length} rows:`);
  rowsToInsert.slice(0, 3).forEach((row, i) => {
    console.log(`  Row ${i + 1}: [${row.slice(0, 3).join(', ')}...]`);
  });
  if (rowsToInsert.length > 3) {
    console.log(`  ... and ${rowsToInsert.length - 3} more`);
  }

  // Confirm
  const confirm = await prompt('\nProceed with insertion? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes') {
    log.warn('Cancelled');
    process.exit(0);
  }

  // Append to sheet
  const success = await appendToSheet(sheetId, sheetsKey, 'NAM Fitness — Garmin Daily Log', rowsToInsert);

  if (success) {
    log.section('Recovery Complete!');
    log.success(`Inserted ${rowsToInsert.length} rows`);
    log.info('Sheet will sync the next time NAM Fitness loads');
  }
}

main().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
