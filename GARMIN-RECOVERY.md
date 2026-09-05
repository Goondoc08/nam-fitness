# Garmin Sync Recovery Guide

When the NAS backup fails, the "NAM Fitness — Garmin Daily Log" Google Sheet can have missing rows. This guide walks through recovering those missing days using a Garmin CSV export.

## Quick Start

```bash
# 1. Export your Garmin data (see "Get Garmin CSV" below)
# 2. Run the recovery script
node garmin-sync-recovery.js ~/Downloads/garmin-export.csv

# 3. When prompted, provide your sheet ID and API key
# The script will:
#   - Scan the sheet for missing dates
#   - Compare with your CSV export
#   - Ask for confirmation before inserting
#   - Populate the missing rows
```

---

## Step 1: Get Your Garmin CSV Export

Garmin doesn't have a built-in "export all stats" feature, but you can use the **Health Stats** download:

### Option A: Export Activities to CSV (Most Reliable)

1. Go to [connect.garmin.com](https://connect.garmin.com)
2. Click **Activities** (left sidebar)
3. Use filters to select date range with missing data
4. Select all activities (checkbox at top)
5. Click **⋮ (More)** → **Export to CSV**
6. Save as `~/Downloads/garmin-export.csv`

**Note:** This exports your activity list (runs, swims, rides). For daily stats like VO₂ Max & SpO₂, see Option B.

### Option B: Health Stats via Downloads (Newer Interface)

1. Go to [connect.garmin.com](https://connect.garmin.com)
2. Click **Menu (☰) → Downloads** or **Settings → Downloads**
3. Look for **Health Statistics** or **Daily Summary**
4. Select your date range
5. Click **Download**
6. Unzip and use the CSV file

**Note:** Not all Garmin accounts have this option visible. If you don't see it, use Option A.

### Option C: Manual Garmin Health Stats (Best for Missing Days)

If automatic exports don't work:

1. Go to [connect.garmin.com](https://connect.garmin.com)
2. Click **Health Stats** (left sidebar)
3. Scroll through your calendar and note the missing dates
4. For each missing date, manually check:
   - VO₂ Max (if available)
   - Blood Oxygen / SpO₂
   - Sleep data
5. Use the script in **Read-Only Mode** (see below) to manually create a CSV with just those dates

### Option D: Garmin API (Advanced)

If you have a Garmin developer account with API access, you can pull historical data directly. For most users, Options A-C are simpler.

---

## Creating a Manual CSV (If You Can't Export)

If Garmin doesn't give you a download option, create a simple CSV yourself:

1. Open a text editor or Excel
2. Create columns: `Date`, `VO2 Max`, `SpO2`, `Sleep`
3. Fill in the missing dates and values you can find in Garmin Connect:
   - **Date:** YYYY-MM-DD format (e.g., `2026-08-15`)
   - **VO₂ Max:** Your VO₂ reading (e.g., `38.2`)
   - **SpO₂:** Blood oxygen % (e.g., `96`)
   - **Sleep:** Hours or minutes (e.g., `6.5` or `390`)
4. Save as `recovery-data.csv`
5. Run the script with that file

Example CSV:
```
Date,VO2 Max,SpO2,Sleep
2026-08-15,38.2,96,6.5
2026-08-16,38.0,97,7.0
2026-08-17,,96,6.8
```

**Note:** Leave fields blank if you don't have the data — the script only fills in what's there.

---

## Step 2: Get Your Credentials

### Google Sheet ID

1. Open your "NAM Fitness — Garmin Daily Log" sheet in Google Sheets
2. Look at the URL: `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`
3. Copy the `<SHEET_ID>` part (it's a long alphanumeric string)

### Sheets API Key

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing "nam-fitness" project)
3. Enable the **Google Sheets API**:
   - Click **Enable APIs and Services**
   - Search for "Google Sheets API"
   - Click **Enable**
4. Create an API key:
   - Go to **Credentials** (left sidebar)
   - Click **Create Credentials → API Key**
   - Copy the key (looks like `AIza...`)

5. **Make your sheet accessible:**
   - In Google Sheets, click **Share** (top right)
   - Change sharing to **"Anyone with the link can view"**
   - This allows the script to read and write to your sheet using the public API key

---

## Step 3: Run the Recovery Script

### With environment variables (easiest):

```bash
export SHEET_ID="your-sheet-id-here"
export SHEETS_KEY="your-api-key-here"

node garmin-sync-recovery.js ~/Downloads/garmin-export.csv
```

### With command-line arguments:

```bash
node garmin-sync-recovery.js ~/Downloads/garmin-export.csv \
  --sheet-id="your-sheet-id-here" \
  --sheets-key="your-api-key-here"
```

### Interactive (if you don't provide credentials):

```bash
node garmin-sync-recovery.js ~/Downloads/garmin-export.csv
# Then enter sheet ID and API key when prompted
```

---

## What the Script Does

1. **Parses your Garmin CSV** — reads dates and health metrics
2. **Fetches your current sheet** — gets existing rows and headers
3. **Identifies missing dates** — compares CSV dates against sheet dates
4. **Shows a preview** — displays which date ranges will be filled in
5. **Asks for confirmation** — you approve before any writes
6. **Inserts the rows** — appends missing data back to the sheet

### Example Output

```
ℹ️  Found 47 missing dates

Missing date ranges:
  2026-08-15 to 2026-08-20 (6 days)
  2026-08-22 to 2026-09-05 (15 days)

Will insert 47 rows:
  Row 1: [2026-08-15, 38.2, 96...]
  Row 2: [2026-08-16, 38.0, 97...]
  ... and 45 more

Proceed with insertion? (yes/no):
```

---

## Column Mapping

The script automatically maps Garmin column names to your sheet structure. Common fields:

| Sheet Column | CSV Aliases | What It Is |
|---|---|---|
| `date` | `datestr` | YYYY-MM-DD format |
| `vo2_max` | `vo2`, `maxvo2` | VO₂ Max reading (mL/kg/min) |
| `spo2` | `sp02`, `bloodoxygen` | Blood oxygen % |
| `sleep` | `sleep_minutes`, `sleepduration` | Sleep duration (minutes) |
| `heart_rate` | `hr`, `avghr` | Average heart rate (bpm) |
| `training` | `trainingload`, `training_load` | Training load |
| `recovery` | `recovery_time`, `recovery_minutes` | Recovery time |
| `stress` | `stresslevel` | Stress level |
| `calories` | `kcal`, `energy` | Calories burned |
| `steps` | `step_count` | Step count |
| `distance` | `total_distance` | Distance traveled |
| `duration` | `time_recorded`, `duration_minutes` | Activity duration |

If your CSV uses different column names, rename them to match the aliases above before running the script.

---

## Troubleshooting

### "Sheet is not publicly accessible"

**Error:** `HTTP 403: Access Denied`

**Fix:** Make sure your sheet is shared with **"Anyone with the link can view"**:
1. Open the sheet in Google Sheets
2. Click **Share** (top right)
3. Change **Restricted** to **Anyone with the link**
4. Click **Done**

### "API key is not valid"

**Error:** `HTTP 400: Bad Request` or `Invalid API key`

**Fix:** 
1. Double-check you copied the full API key
2. Make sure the **Google Sheets API** is enabled in your project
3. Wait a few minutes (sometimes there's a slight propagation delay)

### "Sheet ID not found"

**Error:** `HTTP 404: Not Found`

**Fix:**
1. Verify the sheet ID from the URL
2. Make sure you're using the **Daily Log** sheet ID, not the spreadsheet ID
3. Check that the sheet name exactly matches `NAM Fitness — Garmin Daily Log`

### CSV parsing fails

**Error:** `CSV appears empty` or `No valid rows found`

**Fix:**
1. Verify the CSV file is not corrupted
2. Make sure it has a `Date` column
3. Try opening it in Excel to check the format
4. If Garmin's export format changed, manually add a `Date` column with YYYY-MM-DD format

### Script runs but doesn't insert anything

**Possible reasons:**
- All dates are already in the sheet (nothing missing)
- The CSV dates don't match existing sheet format (different column names)
- The script couldn't map CSV columns to sheet columns

**Fix:** Check the console output for clues, and manually verify:
1. What dates are missing in your sheet
2. What dates are in your CSV
3. That column names match between CSV and sheet

---

## Manual Recovery (if script fails)

If the script can't help, you can manually recover using the sheet:

1. Open your CSV in Excel or Google Sheets
2. Copy the missing date rows
3. Go to "NAM Fitness — Garmin Daily Log"
4. Paste at the end of the sheet
5. The app will pick up the data on next load

---

## After Recovery

Once the script completes:

1. **Reload the app** — navigate to it or refresh your browser
2. **Verify the data** — check a few of the recovered dates to make sure they appear correctly
3. **Check Garmin connection** — future data should sync normally now

If something looks wrong, you can:
- Manually delete the inserted rows in Google Sheets
- Run the script again with corrected data

---

## Preventing Future Losses

Since NAS failures can happen:

1. **Export data regularly** — download your Garmin CSV monthly as a backup
2. **Enable Google Drive backup** — consider syncing your Garmin data to Drive automatically
3. **Set up versioning** — Google Sheets keeps a version history (File → Version History)

---

## Questions?

This tool is specific to nam-fitness. If you hit issues:

1. Check the error message in the script output
2. Verify your sheet ID and API key
3. Look at the **Troubleshooting** section above
4. Review your CSV export for data issues

Good luck! 🏃‍♂️
