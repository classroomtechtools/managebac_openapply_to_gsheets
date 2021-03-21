#   ManageBac / OpenApply to Gsheets

Interacts with the ManageBac and OpenApply APIs, downloading students and linked parents into a google spreadsheet. 

Changelog:

- March 21st, 2021: Properites are added and augmented to `behavior/notes`.
  - `incident_date` as native date 
  - `count` serial id-like
  - `notes` now stripped of html

## Getting started

Note that you need access to API manager for this to work. Simplest way is to:

- Make a [copy of this spreadsheet](https://docs.google.com/spreadsheets/d/1Uc___fcVkp_QURp_9sMq3vFJSVncv2-ENwiZmVzz4bg/copy)
- Click on "Tools" and go to "Script Editor"
- Fill out the global variables 
- Run the functions `runMB` and `runOA`
- Wait for them to finish


## Tokens

- The ManageBac auth token is available from the Develop menu.
- The OpenApply bearer token can be gotten from using `curl` in the instructions (and is valid for a month).
- A future version of the library can support the full v3 oauth flow where the bearer token is obtained from the automatic process

Then use the example code below. Run it.

### Data privacy

Remember, the data you are downloading should be **restricted** to only those individuals on your domain who need it. Don't turn on link sharing, for example. 

### Privacy Policy of this library

While you are providing authentication credentials to the library, these items are not saved in any way. They are simply passed through to the API requests themselves.

This library does not save any user data on any server or database. It only passes the information obtained from the API and stores it onto the attached spreadsheet.

### Santity check

Since this code is doing lots of API interactions, please practice sanity and not have it run all the time on a bunch of spreadsheets. You can run it probably once per day.

## Multiple Spreadsheets

Administrators might be tempted to run this code on multiple spreadsheets. That way you can give permissions to different people in your organization. 

Much better would be to run this code on just one spreadsheet, and then use the `IMPORTRANGE` google sheet function on any other spreadsheets that also need the data.

## How is this so fast?

Anyone who works with APIs and appscripts may have found it to be slow. 

The code is written for concurrently obtaining results from the API at a rate limit of 200 per second. It uses a batch mode that very efficiently downloads as much as it can, whle at the same time respecting the rate limitations.


