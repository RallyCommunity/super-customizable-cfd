#Super Customizable Cumulative Flow Diagram

This cannot be used in on-premises installations.

## Description

This is a new chart.  You can choose the record type to make a cumulative flow
diagram from.  Choose:

 * An artifact type to get history
 * A field from the artifact type to group on (the different colors of the area chart)
 * A field from the artifact to calculate the Y axis (or count)
 * A beginning and end date -- Keep in mind that there is not historical data before 11/11/11.
    * if within 45 business days, will show each day at midnight 
    * if more than 45 days, each week
    * if 2 or fewer days, will show 30 minute increments
 * An optional query -- this is in the normal Rally query language and will be used to limit the results that are calculated 
    the item must match the filter at this point in time in order to be used for tracking the history (doesn't matter if it
    moved from Release 1 to Release 2 in the period, if you limit to Release 2, we'll see it all the time because it's there now)

### TODO
 * The query box needs more trapping for spaces and hard returns
 * The filter query tends to be slow -- need to push the objectIDs into the subsequent lookback query
 * The configuration settings could be saved to a preference for future use
 * Perhaps an additional filter for the lookback itself (that is, apply the limits every day instead of at the end and retconning)

## Development Notes

### First Load

If you've just downloaded this from github and you want to do development, 
you're going to need to have these installed:

 * node.js
 * grunt-cli
 * grunt-init

If you have those three installed, just type this in the root directory here
to get set up to develop:

  npm install

### Structure

  * src/javascript:  All the JS files saved here will be compiled into the 
  target html file
  * src/style: All of the stylesheets saved here will be compiled into the 
  target html file
  * test/fast: Fast jasmine tests go here.  There should also be a helper 
  file that is loaded first for creating mocks and doing other shortcuts
  (fastHelper.js) **Tests should be in a file named <something>-spec.js**
  * test/slow: Slow jasmine tests go here.  There should also be a helper
  file that is loaded first for creating mocks and doing other shortcuts 
  (slowHelper.js) **Tests should be in a file named <something>-spec.js**
  * templates: This is where templates that are used to create the production
  and debug html files live.  The advantage of using these templates is that
  you can configure the behavior of the html around the JS.
  * config.json: This file contains the configuration settings necessary to
  create the debug and production html files.  Server is only used for debug,
  name, className and sdk are used for both.
  * package.json: This file lists the dependencies for grunt
  * auth.json: This file should NOT be checked in.  Create this to run the
  slow test specs.  It should look like:
    {
        "username":"you@company.com",
        "password":"secret"
    }
  
### Usage of the grunt file
####Tasks
    
##### grunt debug

Use grunt debug to create the debug html file.  You only need to run this when you have added new files to
the src directories.

##### grunt build

Use grunt build to create the production html file.  We still have to copy the html file to a panel to test.

##### grunt test-fast

Use grunt test-fast to run the Jasmine tests in the fast directory.  Typically, the tests in the fast 
directory are more pure unit tests and do not need to connect to Rally.

##### grunt test-slow

Use grunt test-slow to run the Jasmine tests in the slow directory.  Typically, the tests in the slow
directory are more like integration tests in that they require connecting to Rally and interacting with
data.
