#   ManageBac / OpenApply to Gsheets

Interacts with the ManageBac and OpenApply APIs, downloading data into a Google Spreadsheet.

Particularly useful for using as a data source with Google Data Studio.

## Getting started

Note that you need access to API manager for this to work. Simplest way is to:

- Make a [copy of this spreadsheet](https://docs.google.com/spreadsheets/d/1Uc___fcVkp_QURp_9sMq3vFJSVncv2-ENwiZmVzz4bg/copy)
- Click on "Tools" and go to "Script Editor"
- Fill out the global variables in `Globals.gs` as appropriate
- Go to "Services" and add `Google Sheets API`
- Run the functions for `ManageBac.gs` and `OpenApply.gs` as appropriate
  - A function that runs "incremental" means that it only updates since last run (either full or incremental run)
  - A function that runs "full" is the opposite of "incremental" -- it downloads without any date filtering
- Wait for them to finish

## Usage

Once you have the data in a spreadsheet, you can rearrange the columns, add header row, or add columns. Subsequent updates (either full or incremental) will track to the new location. 

You can also use it as a source for Google Data Studio, see [example](https://github.com/classroomtechtools/managebac_openapply_to_gsheets/blob/main/examples/DataStudio.md) for further details.

You can set up triggers to run. The author suggests having the full updates run once a week, and the incremental ones run once per hour. (Incremental updates are not available on every endpoint, but where available take up far less than bandwidth and do not overwhelm servers with requests.)

For a detailed examples, see the examples folder in the code listing.

### Changelog

#### Version 2

- May 1st, 2021: Added caching support and handling for occassional 504 errors
  - To update, bump library to latest version. No further action required.

- April 26th, 2021: Attendance added (version 21)
  - Downloads all attendance info for students who are *not* archived.
  - The resulting sheet columns differ from what's on the endpoint in the following ways:
    - The `student_id` is what the endpoint provides as `id`, and `id` in the sheet is just a serial counter
    - The `grade` column is the grade ("year") the student was in at the *time the attendance was taken*. This is calculated from the term information and the class name
    - It also includes term data attendance can be calculated in aggregate
  - To update, bump library to version 21, and follow instructions under Version 21 header below

- April 15th, 2021: **Version 2**
  - Any updates in the API information is tracked by metadata, so cell positions may change and still remains in sync
  - Option to download on the latest (`since_date` in OA and `modifiedSince` in MB)
  - Adds `protectData` option so student data can be protected (for demonstration or presentation purposes)

#### Deprecated: Version 1

See below for change log on version 1

## Limitations

This library uses developer metadata API, which is subject to (at the time of writing) `30,000` characters per sheet. Each row uses `6` characters and each column about `15`, so rounding up a row with ten columns count for `1000 / 30000` or about `3%` against the quota. Datasets that have more columns will use up the quota faster.

If this limitation is hit, you will get an error output with "cannot write as this would exceed quota limitations."

## Notes

### Authentication

- The ManageBac auth token is available from the Develop -> API Manager agrea.
- The OpenApply client ID and client secret can retrieved from the API Manager

The ManageBac tokens have permissions associated with them; be sure that the ones you need are enabled. If the token your using doesn't have permission to do something, it'll tell you!


### Data privacy

Remember, the data you are downloading should be **restricted** to only those individuals on your domain who need it. Don't turn on link sharing, for example. 

### Privacy Policy of this library

While you are providing authentication credentials to the library, these items are not saved in any way. They are simply passed through to the API requests themselves.

This library does not save any user data on any server or database. It only passes the information obtained from the API and stores it onto the attached spreadsheet.

### How is this so fast?

Anyone who works with APIs and appscripts may have found it to be slow. 

The code is written for concurrently obtaining results from the API at a rate limit of 200 per second. It uses a batch mode that very efficiently downloads as much as it can, whle at the same time respecting the rate limitations.

### Version 21 (and above)

Instructions for downloading class attendance:

Add the following code to `ManageBac.gs`:
```js
function runMBAttendance() {
  const {manageBacUpdater, dl_mb_attendance: downloader} = MB_OA_Gsheets.module();  
  manageBacUpdater(MB_Auth, {
    id: SS_ID, 
    syncKey: SYNC_KEYS.mb_attendance,   <---- add mb_attendance property in Globals.gs
    downloader
  }, {
    priorityHeaders: ['id', 'student_id', 'grade'],
    protectData: PROTECT_DATA
  });
}
```

And add `mb_attendance` to `SYNCKEYS` in `Globals.gs`.

## Change log for Version 1

- March 27th, 2021: Added `terms` and `term_grades` endpoints
  - The `term_grades` is blended with `terms` and `classes` for easy visualization
  - Executing may significant amount of time (A school of ~400 with 7 years of history took ~5 minutes to execute)

- March 24th, 2021: Added `memberships` endpoint (class enrollments)
  - This data is not "blended" with user or class info, you'll have to use `VLOOKUP` formula to match class IDs with class info in the `mb_classes` sheet
  - It is not blended because the script needs more than 6 minutes to complete

- March 22nd, 2021: Added `classes` endpoint
  - Teachers with `show_on_reports` field `true` are available in `teachers_reporting`
  - The field `teachers_reporting[0].email` column is prioritized to show justified left in the spreadsheet

- March 21st, 2021: Properites are added and augmented to `behavior/notes`.
  - `incident_date` as native date 
  - `count` serial id-like
  - `notes` now stripped of html
  - Written to spreadsheet by descending `incident_date`
