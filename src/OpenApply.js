/**
 * openApplyAutoUpdater. Updates the spreadsheet with metadata
 * @param {Object} settings
 * @param {String} settings.clientId - The client ID in the API manager
 * @param {String} settings.clientSecret - The client ID in the API manager
 * @param {String} settings.subdomain - Your schools subdomain, i.e. 'demo' for 'demo.openapply.com'
 * @param {Number} [settings.count=30]
 * @param {Object} ss
 * @param {String} ss.id - The id of the target spreadsheet to write to
 * @param {String} syncKey - Unique identifier for sync, will keep same
 * @param {Object} options
 * @param {Boolean} [options.isIncremental=true] - Read from metadata last time the api was used and only updated items
 * @param {String[]} [statuses=[]] - List of statuses to include (if change, run with isIncremental=false)
 * @param {Boolean} [protectData] - If true, replace data with faked info
 */
 function openApplyUpdater_(
  { clientId, clientSecret, subdomain, count = 30 },
  { id, syncKey },
  {
    isIncremental = false,
    protectData = false,
    priorityHeaders = [
      "id",
      "student_id",
      "first_name",
      "last_name",
      "class_grade",
      "email",
    ],
    useMetadata = true,
    includeCustomFields = [],
    includeParentFields = [],
    activeOnly = false,
    statuses = [],
    tabbedStatuses = false,
    visibility = "PROJECT",
    cnDomain = false
  } = {}
) {
  // Ensure valid types are passed through here
  Enforce.named(
    arguments,
    {
      clientId: "!string",
      clientSecret: "!string",
      subdomain: "!string",
      count: "number",
      id: "!string",
      syncKey: "!string",
      activeOnly: "boolean",
      statuses: "array",
      isIncremental: "boolean",
      protectData: "boolean",
      includeParentFields: "array",
      includeCustomFields: "array",
      useMetadata: "boolean",
      priorityHeaders: "array",
      tabbedStatuses: "boolean",
      visibility: "string",
      cnDomain: "boolean"
    },
    "openApplyUpdater_"
  );

  // setup constant values
  const domain = cnDomain ? "openapply.cn" : "openapply.com";
  const version = "api/v3";

  // if activeOnly flag and no statuses, passed, help them out
  if (activeOnly && statuses == null) statuses = ["enrolled"];
  const endpoint = initWithClientIdSecret_({
    clientId,
    clientSecret,
    subdomain,
    count,
    domain,
    version,
  });

  // TODO: refactor to make this clearer
  // this is the main body of this function
  const store_date = new Date(); // start now in case there's changes happening during operation
  let result;
  if (tabbedStatuses) result = tabbed();
  else result = untabbed();
  const { sheet, md } = result;

  // logs after downloading TODO: log this straight off the bat instead
  Logger.log(
    `Updating ${sheet.sheetName} with id of ${sheet.sheetId} of ss id: ${sheet.id}`
  );

  // now update the sinceDate md with utc string representation of the date
  const updated = GSheetsMetadataSync.updateMetadata(
    sheet,
    md.metadataId,
    md.metadataKey,
    store_date.toISOString(),
    md.visibility,
    md.location
  );
  // end main body

  function setupSheet(id, syncKey, since = "since_date_${sheet.sheetId}") {
    // initialize the gsheet, fetches the sheetId from metadata
    const sheet = GSheetsMetadataSync.fromId(id, syncKey, visibility);
    // key for checking metadata for since_date property
    const sinceDateMdKey = interpolate_(since, { sheet });

    // if activeOnly flag and no statuses, passed, help them out
    if (activeOnly && statuses == null) statuses = ["enrolled"];

    // we have to process retrieval by sinceDateMdKey, depending on if it's been setup already or not
    const replies = GSheetsMetadataSync.getMetadata(sheet, sinceDateMdKey);
    let since_date = null;

    // md is the metadata value either null if first time, or populated if already stored
    let md = null;
    if (replies == null) {
      // not there yet; need to create it
      const result = GSheetsMetadataSync.createMetadata(
        sheet,
        sinceDateMdKey,
        new Date()
      );
      md = result.replies.pop().createDeveloperMetadata.developerMetadata;
    } else {
      md = replies.pop().developerMetadata;
      if (isIncremental) {
        // only change since_date from null if we need to
        since_date = new Date(md.metadataValue);
        Logger.log(
          "Using since_date=" +
            Utilities.formatDate(
              since_date,
              Session.getTimeZone(),
              "YYYY-MM-dd hh:mm:ss"
            ) +
            " (local timezone) to request updates since last run"
        );
      }
    }

    return { since_date, sheet, md };
  }

  function grabIds(sheet) {
    const ids = sheet.getColumnValues("id");
    return ids.filter((id) => typeof id === "number");
  }

  function tabbed() {
    // the since_date metadata has to be formatted different as we want any changes on the whole sheet
    // for every tab, not a different date for each tab
    const { sheet, since_date, md } = setupSheet(
      id,
      syncKey,
      "since_date_${sheet.id}"
    );

    // get the ids so we can also include them
    const includeIds = grabIds(sheet);

    const jsons = downloadOAv3_2_({
      endpoint,
      sheet,
      since_date,
      statuses,
      parentCustomFields: includeParentFields,
      studentCustomFields: includeCustomFields,
      protectData,
      includeIds,
    });

    for (const status of statuses) {
      // we also need to have a syncKey pattern to match tabbed here
      const { sheet: thisSheet } = setupSheet(id, `${syncKey}_${status}`);
      const includeIds = grabIds(sheet);
      // filter out by status or by those who are there
      const thisJsons = jsons.filter(
        (j) => j.status === status || includeIds.includes(j.id)
      );

      updateSpreadsheet_({
        sheet: thisSheet,
        jsons: thisJsons,
        isIncremental,
        priorityHeaders,
        useMetadata
      });

      pruneWrongStatuses(jsons, thisSheet, [status]);
    }

    return { md, sheet };
  }

  function untabbed() {
    // initialize the gsheet, fetches the sheetId from metadata
    const { sheet, md, since_date } = setupSheet(
      id,
      syncKey,
      "since_date_${sheet.sheetId}"
    );
    const includeIds = grabIds(sheet);

    // custom_fields is false by default
    // const jsons = downloadOAv3_({endpoint, since_date, statuses, includeParentFields, includeCustomFields, protectData, includeIds});
    // sync operation!

    const jsons = downloadOAv3_2_({
      endpoint,
      sheet,
      since_date,
      statuses,
      parentCustomFields: includeParentFields,
      studentCustomFields: includeCustomFields,
      protectData,
      includeIds,
    });

    updateSpreadsheet_({
      sheet,
      jsons,
      isIncremental,
      priorityHeaders,
      useMetadata
    });

    if (statuses.length > 0) pruneWrongStatuses(jsons, sheet, statuses);

    return { md, sheet };
  }

  function pruneWrongStatuses(jsons, sheet, statuses) {
    // do batch on this, otherwise end up with wild results
    for (const json of jsons.filter((j) => !statuses.includes(j.status))) {
      const { id } = json;
      // find the address to prune
      const response = sheet.deleteRowId(id.toString());
    }
  }

  // output
  //Logger.log(updated);
}
