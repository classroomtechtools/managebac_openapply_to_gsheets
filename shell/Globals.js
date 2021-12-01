/**
 * Enter these values, then switch to files and run functions as appropriate
 * run functions as appropriate
 */

// auth token can be retrieved from the api manager (v2)
const MB_AUTH_TOKEN = "";

// client and secret can be created / retrieved from the api manager (v3)
// if you don't use openapply, ignore it
const OA_CLIENT_ID = "";
const OA_CLIENT_SECRET = "";
const SUBDOMAIN = ""; // your school's subdomain, in *.openapply.com

/**
 * Need to take screenshots without student data? This will do the trick
 * (Note: endpoints such as the main mb and the oa one will need to be run "full" to update all the data)
 */
const PROTECT_DATA = false;

/**
 * If you only want students and classes currently active (not archived) set this to true
 */
const ACTIVE_ONLY = true;

/**
 * Below here, "only change if you know what you're doing"
 */
const SS_ID = SpreadsheetApp.getActive().getId();

// sync keys are internally maintained to know which sheet will have the data
// (you can rename the sheet if desired, but sync key should remain the same)
const SYNC_KEYS = {
  mb_main: "mb_main",
  oa_main: "oa_main",
  mb_academic_terms: "mb_academic_terms",
  mb_teachers: "mb_teachers",
  mb_classes: "mb_classes",
  mb_termgrades: "mb_termgrades",
  mb_memberships: "mb_memberships",
  mb_behavior: "mb_behavior",
  mb_attendance: "mb_attendance",
};

const MB_Auth = {
  token: MB_AUTH_TOKEN,
  count: 100,
};

const OA_Auth = {
  clientId: OA_CLIENT_ID,
  clientSecret: OA_CLIENT_SECRET,
  subdomain: SUBDOMAIN,
  count: 50,
};
