#   ManageBac / OpenApply to Gsheets

Interacts with the ManageBac and OpenApply APIs, downloading students and linked parents into a google spreadsheet. 

## Getting started

Note that you need access to API manager for this to work. Simplest way is to:

- Make a [copy of this spreadsheet](https://docs.google.com/spreadsheets/d/1Uc___fcVkp_QURp_9sMq3vFJSVncv2-ENwiZmVzz4bg/copy)
- Click on "Tools" and go to "Script Editor"
- Fill out the global variables that are relevant to you
- Run the functions `runMB` and `runOA`
- Wait for them to finish


## Bearer Tokens

The ManageBac bearer token is available from the Develop menu. The OpenApply bearer token can be gotten from using `curl` in the instructions (and is valid for a month).

You need to create an appscript project at `script.google.com`, and add the Library with ID `1IXI9ESzAO3ZQpLg0DTGoB55Lnk-6bobE2EUkQSashkIfnSOMNslgMV4d`. You need to create the spreadsheet ahead of time, and give it the speadsheet ID, and the name of the target sheet you want the info in.

Then use the example code below. Run it.

### Data privacy

Remember, the data you are downloading should be **restricted** to only those individuals on your domain who need it. Don't turn on link sharing, for example. 

### Privacy Policy of this library

While you are providing authentication credentials to the library, these items are not saved in any way. They are simply passed through to the API requests themselves.

This library does not save any user data on any server or database.

### Santity check

Since this code is doing lots of API interactions, please practice sanity and not have it run all the time on a bunch of spreadsheets. You can run it probably once per day.

### Multiple Spreadsheets

Administrators might be tempted to run this code on multiple spreadsheets. That way you can give permissions to different people in your organization. 

Much better would be to run this code on just one spreadsheet, and then use the `IMPORTRANGE` google sheet function on any other spreadsheets that also need the data.

### About OpenApply's V3 oauth

OpenApply's V3 oauth needs a `clientId` and `client secret` method to start, and then the bearer token is obtained. Currently this is not supported, but likely to be included in a future version.

## Example Code

Working code included below:

```js

const OABearerToken = '<secret>';
const MBBearerToken = '<secret>';

function testOA() {
  MB_OA_Gsheets.openApplyV3BearerToken({
    token: OABearerToken, 
    subdomain: 'igbis'
  }, {
    id: '<id>',
    sheetName: 'OA'
  });
}


function testMB() {
  MB_OA_Gsheets.manageBacV2AuthToken({
    token: MBBearerToken
  }, {
    id: '<id>', 
    sheetName:'MB'
  });
}


```
