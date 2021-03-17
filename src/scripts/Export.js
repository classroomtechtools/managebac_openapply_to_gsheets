/**
 * Download OpenApply via Bearer token
 * @param {Object} settings
 * @param {String} settings.token - The bearer token derived from /oauth/token endpoint
 * @param {String} settings.subdomain - Your schools subdomain, i.e. 'demo' for 'demo.openapply.com'
 * @param {Number} [settings.count=100]
 * @param {Object} ss
 * @param {String} ss.id - The id of the target spreadsheet to write to
 * @param {String} [sheetName='Sheet1'] - The name of the sheet
 */
function openApplyV3BearerToken({token, subdomain, count=30}={},
                                {id,sheetName='Sheet1'}={},
                                {numHeaderRows=1}={})
{
  Enforce.named(arguments, {token: '!string', subdomain: '!string', count: 'number', version: 'string', id: '!string', sheetName: 'string'}, 'openApplyV3BearerToken');
  const domain='openapply.com';
  const version='api/v3';
  const endpoint = initWithBearerToken_({token, subdomain, count, domain, version});
  const jsons = downloadOAv3_(endpoint);
  saveToSpreadsheet_({id, sheetName, jsons, numHeaderRows,
                      priorityHeaders: ['id', 'student_id', 'first_name', 'last_name']});
}

/**
 * Download OpenApply via Bearer token
 * @param {Object} settings
 * @param {String} settings.token - The bearer token from the managebac settings
 * @param {Number} [settings.count=100] - How many to download at a time
 * @param {Object} ss
 * @param {String} ss.id - The id of the target spreadsheet to write to
 * @param {String} [ss.sheetName='Sheet1'] - The name of the sheet
 */
function manageBacV2AuthToken ({token, count=30}={},
                               {id, sheetName='Sheet1'}={},
                               {numHeaderRows=1}={})
{
  const subdomain = 'api';
  const domain = 'managebac.com';
  const version = 'v2';
  const endpoint = initWithAuthToken_({token, subdomain, domain, version, count});
  const jsons = downloadMBv2_(endpoint);
  saveToSpreadsheet_({id, sheetName, jsons, numHeaderRows,
                      priorityHeaders: ['id', 'student_id', 'first_name', 'last_name', 'class_grade', 'email']});
}

/**
 * Download OpenApply via Bearer token
 * @param {Object} settings
 * @param {String} settings.token - The bearer token from the managebac settings
 * @param {Number} [settings.count=100] - How many to download at a time
 * @param {Object} ss
 * @param {String} ss.id - The id of the target spreadsheet to write to
 * @param {String} [ss.sheetName='Sheet1'] - The name of the sheet
 */
function manageBacV2AuthTokenBehaviour ({token, count=100}={},
                          {id, sheetName}={},
                          {numHeaderRows=1}={})
{
  const subdomain = 'api';
  const domain = 'managebac.com';
  const version = 'v2';
  const endpoint = initWithAuthToken_({token, subdomain, domain, version, count});
  const jsons = downloadMBBehaviourv2_(endpoint);
  saveToSpreadsheet_({id, sheetName, jsons, numHeaderRows,
                      priorityHeaders: ['student_id', 'email', 'first_name', 'last_name', 'reported_by', 'notes']});
}
