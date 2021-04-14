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
 * @param {String[]} [statuses=null] - List of statuses to include (if change, run with isIncremental=false)
 * @param {Boolean} [protectData] - If true, replace data with faked info
 */
function openApplyUpdater_ ( {clientId, clientSecret, subdomain, count=30},
                           {id, syncKey},
                           {isIncremental=false, activeOnly=false, statuses=null, protectData=false}={} ) 
{
  // Ensure valid types are passed through here
  Enforce.named(arguments, {
    clientId: '!string', clientSecret: '!string',
    subdomain: '!string', count: 'number',
    id: '!string', syncKey: '!string', activeOnly: 'boolean',
    statuses: 'array', isIncremental: 'boolean', protectData: 'boolean'
  }, 'openApplyUpdater_');

  // setup constant values
  const domain = 'openapply.com';
  const version = 'api/v3';  
  // initialize the gsheet, fetches the sheetId from metadata
  const doc = GSheetsMetadataSync.fromId(id, syncKey);
  // key for checking metadata for since_date property
  const sinceDateMdKey = `since_date_${doc.sheetId}`;

  // if activeOnly flag and no statuses, passed, help them out
  if (activeOnly && statuses == null) statuses = ['enrolled'];

  // we have to process retrieval by sinceDateMdKey, depending on if it's been setup already or not
  const replies = GSheetsMetadataSync.getMetadata(doc, sinceDateMdKey);
  let since_date = null;

  // md is the metadata value either null if first time, or populated if already stored
  let md = null;
  if (replies == null) { 
    // not there yet; need to create it
    const result = GSheetsMetadataSync.createMetadata(doc, sinceDateMdKey, new Date());
    md = result.replies.pop().createDeveloperMetadata.developerMetadata;
  } else {
    md = replies.pop().developerMetadata;
    if (isIncremental) {
      // only change since_date from null if we need to
      since_date = new Date(md.metadataValue);
    }
  }

  // get the endpoint object which will interact with apis
  const endpoint = initWithClientIdSecret_({clientId, clientSecret, subdomain, count, domain, version});
  // custom_fields is false by default   
  const jsons = downloadOAv3_({endpoint, since_date, statuses, protectData});

  // store date for later, before operation
  const store_date = new Date();

  // sync operation!  
  updateSpreadsheet_({
    doc, jsons, isIncremental,
    priorityHeaders: ['id', 'student_id', 'first_name', 'last_name', 'class_grade', 'email']
  });

  // now update the sinceDate md with utc string representation of the date
  const updated = GSheetsMetadataSync.updateMetadata(
    doc, md.metadataId, md.metadataKey, store_date.toISOString(), md.visibility, md.location
  );

  // output
  //Logger.log(updated);
}

