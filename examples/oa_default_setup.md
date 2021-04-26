# Default Setup for OpenApply

This simple example demonstrates how the library works in its most basic setup. It also seeks to illustrate the various default options.

These two following function are given in the `OpenApply.gs` file. 

```js
// make a function that can run as "full" run 
function run_Full_Main_OA() {
  // call main function with parameter false
  run_Main_OA_({isIncremental: false});
}

// make a function that can run as "incremental"
// (since_date) run 
function run_Incremental_Main_OA() {
  // call main function with parameter true
  run_Main_OA_({isIncremental: true});
}
```

All they do is call the main function with different parameters, given below. The function that is imported `openApplyUpdater`, is the function that ultimately accepts the parameters and does the actual work.

## openApplyUpdater

With default values, the processing that this function does is use the students endpoint to download all of the students and accompanying data points (excepted `custom_fields`, see below for why), with linked parent information.

One student, one row for both data about the student (except `custom_fields`) and default data about the parent. Note that by default the parent information does not include `email`.

## Parameters to openApplyUpdater

```js
// this is the main function that the above two call, 
// with parameters according to the kind of run desired
function run_Main_OA_({isIncremental}) {

  // this imports the updater function provided by the library
  const {openApplyUpdater} = MB_OA_Gsheets.module();

  // call the function with parameters, the only one different is the
  //   
  openApplyUpdater(OA_Auth, {
    id: '<id>',
    syncKey: 'key'
  }, {
    isIncremental,   // <--- true if incremental run
    activeOnly: false,
    protectData: false,
    includeCustomFields: [],
    includeParentFields: [],
    priorityHeaders: ['id']
  });
}
```

This is a breakdown of the parameters that `openApplyUpdater` takes, what they do, and their default values. 

The first parameter that `openApplyUpdater` accepts is an authentication object, `OA_Auth` which is defined in `Globals.gs`. It holds the authentication tokens, and also a `count` property which you can, if desired, modify. The maximum meaningful value is `1000`. (The default is `30`.) All these values are carried over into every single API request made during the execution of `openApplyUpdater`, which is why it's the first parameter and managed in `Globals.gs`.

The second group of parameters (after `OA_Auth`), which you need to be aware, are required:

```js
openApplyUpdater(OA_Auth, {
  id: '<id>',
  syncKey: 'key'
});
```

The `id` is the spreadsheet ID of the Google Spreadsheet. Normally, you can set it to the following function which will get you the attached spreadsheet:

```js
  openApplyUpdater(OA_Auth, {
    id: SpreadsheetApp.getActiveSpreadsheet().getId(),
    syncKey: 'key'
  });
```

The `syncKey` parameter is a string that you give it, and should remain constant across executions. Together, the `id` and `syncKey` point to a particular tab on a particular spreadsheet. 

Changing either the `id` or `syncKey` value indicates to the library that you are starting over with a new spreadsheet and/or tab. If it is the first time you are running with those combination of values for `id` and `syncKey` it will create a new tab with the default name same as the value of `syncKey`.

Let's take a look at the lastm, optional, parameters and their default values:

```js
  openApplyUpdater(..., {
    ...
  }, {
    isIncremental: false,
    activeOnly: false,
    protectData: false,
    includeCustomFields: [],
    includeParentFields: [],
    priorityHeaders: ['id'],
    statuses: null
  });
```

These parameters are explained below:

- If `isIncremental` is `true`, it will read in from its internal data structures when was the last time a run (either full or incremental) occurred. It then calls the API with this date, and and only updates those items that have been modified since then. If a new row is required, it creates it, but will not add columns.

- If `isIncremental` is `false`, it will seek to get all the information, respecting the next paramters. It will also add rows and columns to the spreadsheet, as needed.

- If `activeOnly` is `true`, it will filter out any students whose `status` field is not `"enrolled"`.

- If `activeOnly` is `false`, it will do no filtering. Please see `statuses` below for more information on how to filter.

- If `protectData` is `true`, it will replace personally identifiying information (such as names, emails, phone numbers, etc) using a faker library. Note that IDs are not protected so that the database remains consistent, although `custom_id` is protected by being replaced with a random string. The spreadsheet itself will then have those replaced values (so you can share broadly in conferences, etc).

- If `protectData` is `false`, the library will not process as above.

- If `includeCustomFields` is an array of strings (`String[]`), then the library will engage in the additional processing required to add the indicated fields as columns in the spreadsheet. See below for more details.

- If `includeParentFields` is an array of stings, then the libary will engage in the additional processing required to add fields to the linked parent. A list of the available fields can be found at the `parents` endpoint in OA reference documentation.

- If `includeCustomFields` is `null`, then no custom fields will be present in the spreadsheet.  

- If `priorityHeaders` is an array of strings (`Strings[]`), then it will flush left the indicated headers in the spreadsheet on the first run. 

### includeCustomFields

By default, the library does not attempt to download any of the custom fields, the user has to specify which ones they want. This is because schools may have an enormous amount of data contained in custom fields, and would make the spreadsheet unwieldly.

If the custom field in the database is, say, `nationality`, then you only need to include the word `"nationality"` in the settings. The starting `custom_fields.` is already added as a prefix for you:

```js
  openApplyUpdater(..., {
    ...
  }, {
    ...,
    includeCustomFields: ['nationality', 'emergency_contact[0].phone']
  });
```

So the spreadsheet will include a column for each student at the paths `custom_fields.nationality` and `custom_fields.emergency_contact[0].phone` in the OA database.

While `nationality` is a straight forward data point, the `emergency_contact` is an array, a list of items, where it has a `phone` property. In that case, use dot notation to specify the path of the data point. In the example above, the spreadsheet will have a column containing the first emergency contact phone number.

You can observe what fields are available in your domain by using sample requests, for example with curl as given in the reference documentation.

**Data protection**: Note that including custom fields is not subject to protection by `protectData`.

### includeParentFields

The following will add `email` column to each linked parent for each student, which by default is not present:

```js
  openApplyUpdater(..., {
    ...
  }, {
    ...,
    includeParentFields: ['email']
  });
```

The extra processing required is significant; it needs to download all of the parents before proceeding as normal.

### statuses

You can specify to have an alumnus spreadsheet containing only students whose status who "graduated" or who have "withdrawn" with the following:

```js
  openApplyUpdater(..., {
    ...
  }, {
    ...,
    statuses: ['graduated', 'withdrawn']
  });
```
