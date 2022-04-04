#   ManageBac / OpenApply to Gsheets

Interacts with the ManageBac and OpenApply APIs, downloading data into a Google Spreadsheet. This software is not officiallly supported by Faria, and is provided "as is."


## Getting started

Note that you'll need access to API manager:

- Make a [copy of this spreadsheet](https://docs.google.com/spreadsheets/d/1Uc___fcVkp_QURp_9sMq3vFJSVncv2-ENwiZmVzz4bg/copy)
- Click on "Tools" and go to "Script Editor"
- Fill out the global variables in `Globals.gs` as appropriate
- For OpenApply, in addition to the subdomain filled in `Globals`, also need to go to `manifest.json`, find the `urlFetchWhitelist` and edit the "subdomain" part of the string: `"https://subdomain.openapply.com/"` to your school's subdomain.

Please note that you have entered a sensitive password, and will be consumed by code in order to download data from your school's platform. Please take the appropriate security measures. See Privacy Statement below.

Once you've set the keys, you are now able to run functions that stores to the spreadsheet tabs:

- Run the functions for `ManageBac.gs` as appropriate:
  - The `run_MB_StudentsParentsFull` function downloads all student and parent data to one tab
  - The `run_MB_StudentsParents_Incremental` means that it only downloads students and parents since last run
  - The first time you run it, you have to run a full download
  - You can set up a trigger to run the incremental function every now and then
  - There are other functions to download other data points

- Run the functions for `OpenApply.gs` as appropriate:
  - The `run_OA_StudentsParentsFull` function downloads all student and parent data to one tab
  - The `run_OA_StudentsParents_Incremental` means that it only downloads students and parents since last run
  - The first time you run it, you have to run a full download
  - You can set up a trigger to run the incremental function every now and then
  - Custom fields are not by default downloaded (as this would quickly result in too much data). Instead, you can specify which ones; see `includeCustomFields`
  - There are other functions, such as `one_student_with_id` to view example responses

Note that a full update is doing quite a lot of work. While steps are taken to ensure it doesn't overwhelm servers, constantly running a full update of all your data may not be the nicest thing to do to the servers on the other side. :)

## How it works

It reads the data from the API, and puts an individual in each column, the fields across the top in columns. Since these APIs (or really any APIs) can have a nested structure, we have to flatten the field names with dot notation. 

Brackets are used to indicate which number in the list it appears. So students with `parent_ids`, the column names will be `parent_ids[0]` for the first, `parent_ids[1]` for the second, and so on.

If a new row appears in the data, it'll add to the bottom. If additional columns are needed, they will be tacked on to the right of the existing columns. 

When it saves the data to the spreadsheet, it uses Google's very cool "Developer Metadata" API so that the project can track the location of each cell. Moving columns or rows around will track, even after being updated.

## Usage

Once you have the data in a spreadsheet, you can rearrange the columns, add header row, or add your own custom columns (for "notes" for example). Subsequent updates (either full or incremental) will track. 

You can also use it as a source for Google Data Studio, see [example](https://github.com/classroomtechtools/managebac_openapply_to_gsheets/blob/main/examples/DataStudio.md) for further details.

You can set up triggers to run. The author suggests having the full updates run once a week, and the incremental ones run once every few hours. (Incremental updates are not available on every endpoint, but where available take up far less than bandwidth and do not overwhelm servers with requests.)

For a detailed examples, see the examples folder in the code listing.

### Term Grades

Instructions for finding term grades are as follows:

1. Run the function `run_MB_TermGradesForDate`, which will output the terms into a new tab
1. The tab will only have term IDs that are "current" for the date provided in the script
1. If you didn't provide a date, then "today" is used (You can change the default date (today) in the `run_MB_TermGradesForDate` function, by editing the line `const date = new Date('2021/12/01')`)
2. Inspect the new tab and find the term IDs you want to download the term grades for
3. Edit the lines after `run_MB_TermGradesForTerms`, for example:

```js
  const term_ids = [
    [94773, 'August 2021 – August 2022'],  // [raw ID, name for sheet]
  ];
```
4. Run the `run_MB_TermGradesForTerms` function. It may take a several minutes to complete

## Update to latest version

Instructions for updating to the latest version of the codebase from an old spreadsheet. In the attached project:

1. Go to Extensions and click on "AppsScripts" to bring up the project
2. In the sidebar "Libraries" click on  `MB_OA_Gsheets` library and choose the latest version.
3. Except for `Globals.gs`, copy the code in `shell/*` and replace it with the files and code. For example, copy the contents of `shell/Managebac.js` to the `ManageBac.gs` file in the project.
4. You should now be able to use the latest functionality

## On Developer Metadata

The incremental updates are possible, thanks to Developer Metadata, which is subject to a quota. Exactly where you will see this limitation, however, depends on how much data you ask it to download. If you need all of the custom fields of OpenApply, for example, you will reach it much faster. However, if you are only getting enrolled students, and not withdrawn / declined students, you'll not likely approach the quota … unless the number of enrolled students is high. 

How high? Hard to tell without being more specific:

Developer Metadata is subject to (at the time of writing) `30,000` characters per sheet. Each row uses `6` characters (for the ID) and each column about `15` (depending on how many character the name of the header is), so 100 rows with 100 columns per entry will count for `(15 * 100 * 100 + 6 * 100) / 30000` or about `~50%` against the quota. Datasets that have more columns with large number of entries will use up the quota faster.

If this limitation is hit, you will get an error output with "cannot write as this would exceed quota limitations."

## Privacy Policy of this library

No authentication credentials are saved or stored, neither in the cloud or in any database or external storage system. They are simply passed through to the API requests themselves. Data from the responses are also not stored in anything except for the target spreadsheet. 

Please view the `manifest.json` file for a list of whitelisted domains to which this library communicates.

### Share responsibly

Remember, the data you are downloading to the spreadsheet should be **restricted** to only those individuals on your domain who need it. Don't turn on link sharing, for example. 

There is a feature `protectData` in case you need it. Perhaps you want to show a colleague how you built it? Don't share the real data, run a full update with `protectData: true` and safely share.

