#Super Customizable Cumulative Flow Diagram

This cannot be used in on-premises installations.

## Description

This is a new chart.  You can choose the record type to make a date-driven area diagram from.  Also choose:

 * An artifact type to get history
 * A field from the artifact type to group on (the different colors of the area chart)
 * A field from the artifact (or count) to calculate the Y axis
 * A beginning and end date -- Keep in mind that there is not historical data before 11/11/11.
 * An optional query -- this is in the normal Rally query language and will be used to limit the results that are calculated 
    the item must match the filter at this point in time in order to be used for tracking the history (doesn't matter if it
    moved from Release 1 to Release 2 in the period, if you limit to Release 2, we'll see it all the time because it's there now)
 * The optional query now supports the date keywords (but NOT the math) listed [here](https://help.rallydev.com/use-grid-app-queries#dates)
 * Configuration settings are saved
 
### TODO
 * Perhaps an additional filter for the lookback itself (that is, apply the limits every day instead of (in addition to?) at the end and retconning)
 * Add query math for date keywords
 * Allow interaction with the page-based timebox dropdowns (iteration/release)
 * Move settings to the settings gear
 
## Development Notes

10 August 2014 - This is a complete rewrite.  The most significant changes are:
 * Settings are now accessed from the gear menu
 * The chart now uses the Luminize calculator to analyze snapshots
 * Grouping on fields with allowed values that include booleans or no selection now display series correctly

### First Load

If you've just downloaded this from github and you want to do development, 
you're going to need to have these installed:

 * git
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
