/**
 * manageBacUpdater. Updates spreadsheet
 * @param {Object} settings
 * @param {String} settings.clientId - The client ID in the API manager
 * @param {String} settings.clientSecret - The client ID in the API manager
 * @param {String} settings.subdomain - Your schools subdomain, i.e. 'demo' for 'demo.openapply.com'
 * @param {Number} [settings.count=30]
 * @param {Object} ss
 * @param {String} ss.id - The id of the target spreadsheet to write to
 * @param {String} syncKey - Unique identifier for sync, will keep same
 * @param {Object} options
 * @param {Boolean} [options.incremental=true] - Read from metadata last time the api was used and only updated items
 * @param {String[]} [activeOnly=false] - Only download currently enrolled students (and parents)
 * @param {Boolean} [protectData] - If true, replace data with faked info using faker.js
 */
 function manageBacUpdater_ ( {token, count=200},
    {id, syncKey, downloader=null},
    {priorityHeaders=['id'],  sortCallback=( (a, b) => a.id - b.id ),
     isIncremental=false, activeOnly=false, protectData=false, useMetadata=true}={} ) 
{
// Ensure valid types are passed through here
Enforce.named(arguments, {
token: '!string',
count: 'number',
downloader: '!function',
id: '!string', syncKey: '!string',
activeOnly: 'boolean', isIncremental: 'boolean', useMetadata: 'boolean', protectData: 'boolean', priorityHeaders: 'array', sortCallback: 'any',
}, 'manageBacUpdater');

// setup constant values
const domain = 'managebac.com';
if (!downloader) throw new Error("Downloader needs to be a function!");
const version = 'v2';
// initialize the gsheet, fetches the sheetId from metadata
const sheet = GSheetsMetadataSync.fromId(id, syncKey);
// key for checking metadata for since_date property
const sinceDateMdKey = `since_date_${sheet.sheetId}`;

// we have to process retrieval by sinceDateMdKey, depending on if it's been setup already or not
const replies = GSheetsMetadataSync.getMetadata(sheet, sinceDateMdKey);
let since_date = null;

// md is the metadata value either null if first time, or populated if already stored
let md = null;
if (replies == null) { 
// not there yet; need to create it
const result = GSheetsMetadataSync.createMetadata(sheet, sinceDateMdKey, new Date());
md = result.replies.pop().createDeveloperMetadata.developerMetadata;
} else {
md = replies.pop().developerMetadata;
if (isIncremental) {
// only change since_date from null if we need to
since_date = new Date(md.metadataValue);
Logger.log("Using modifiedSince=" + Utilities.formatDate(since_date, Session.getTimeZone(), 'YYYY-MM-dd mm:ss') + " to request updates since last run");
}
}

// get the endpoint object which will interact with apis
const subdomain = 'api';
const endpoint = initWithAuthToken_({token, subdomain, count, domain, version});
// custom_fields is false by default   
const jsons = downloader({endpoint, modifiedSince: since_date, activeOnly, protectData});   

// store date for later, before operation
const store_date = new Date();

// write to spreadsheet
updateSpreadsheet_({
sheet, jsons, 
priorityHeaders,
isIncremental, useMetadata,
sortCallback
});

// now update the sinceDate md with utc string representation of the date
const updated = GSheetsMetadataSync.updateMetadata(
sheet, md.metadataId, md.metadataKey, store_date.toISOString(), md.visibility, md.location
);

}


