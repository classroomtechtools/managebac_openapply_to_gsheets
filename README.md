#   ManageBac / OpenApply to Gsheets

Interacts with the ManageBac and OpenApply APIs downloads into a google spreadsheet. 

Currently only gets the students and linked parents.

Future versions could include additional endpoints.

## Getting started

The ManageBac bearer token is available from the Develop menu. The OpenApply bearer token can be gotten from using `curl` in the instructions (and is valid for a month).

You need to create an appscript project at `script.google.com`, and add the Library with ID `1IXI9ESzAO3ZQpLg0DTGoB55Lnk-6bobE2EUkQSashkIfnSOMNslgMV4d`. You need to create the spreadsheet ahead of time, and give it the speadsheet ID, and the name of the target sheet you want the info in.

Then use the example code below. Run it.

### Data privacy

Remember, the data you are downloading should be **restricted** to only those individuals on your domain who need it. Don't turn on link sharing, for example…

## Notes

When you run the below code, it will interact with your school's ManageBac or OpenApply endpoints, starting with the `students` endpoint. It will then augment each student information with the linked parent accounts.

If any *rate limitations* are encountered, it will sleep until it may continue again (standard operating procedure). You may see a console message indicating this action.

### Santity check

Since this code is doing lots of API interactions, please practice sanity and not have it run all the time on a bunch of spreadsheets. You can run it probably once per day.

### Multiple Spreadsheets

Administrators might be tempted to run this code on multiple spreadsheets. That way you can give permissions to different people in your organization. 

Much better would be to run this code on just one spreadsheet, and then use the `IMPORTRANGE` google sheet function on any other spreadsheets that also need the data.

### OpenApply `clientId` and `client secret` method

Currently this is not supported, but likely to be included in a future version.

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
