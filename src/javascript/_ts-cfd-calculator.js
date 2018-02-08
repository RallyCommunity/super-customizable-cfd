Ext.define("Rally.TechnicalServices.CFDCalculator", {
    extend: "Rally.data.lookback.calculator.TimeSeriesCalculator",

    config: {
        /*
         * Required
         */
        group_by_field: null,
        /*
         * Name of field that holds the value to add up
         * (Required if type is "sum")
         */
        value_field: null, 
        /*
         * allowed_values (Required): array of available values in field to group by
         */
         allowed_values: null,
         /*
          * allowed_oids is an array of ObjectIDs that are allowed to be reported on
          * This lets you restrict to a set of items that currently met a WSAPI filter 
          * (e.g., if I want to apply a tag to stories and then see what those stories' histories
          * have been. If I put tag in the lookback query, then that tag has to have been assigned
          * yesterday to see what happened to the items yesterday)
          * 
          * leave as null to allow everything
          */
         allowed_oids: null,
         granularity: 'day',
         /*
          * value_type: 'sum' | 'count' whether to count on given field or to count the records
          */
         value_type: 'sum',
         endDate: null,
         startDate: null
    },
    constructor: function (config) {
        this.callParent(arguments);

        if (this.value_field == 'Count'){
            this.value_type = 'count';
        }
        
        if (this.value_type == 'sum' && (!this.allowed_values || this.allowed_values.length == 0) ) {
            throw "Cannot create Rally.TechnicalServices.CFDCalculator without allowed_values";
        }
        if (!this.group_by_field) {
            throw "Cannot create Rally.TechnicalServices.CFDCalculator without group_by_field";
        }
        if (this.value_type == 'sum' && !this.value_field) {
            throw "Cannot create Rally.TechnicalServices.CFDCalculator by sum without value_field";
        }
        
        this._prepareDates();
        
    },
    /*
     * The goal is to have two dates, in order, that are ISO strings
     */
    _prepareDates: function() {
        if ( this.startDate == "" ) { this.startDate = null; }
        if ( this.endDate == "" )   { this.endDate   = null; }
        
        if ( this.startDate && typeof(this.startDate) === 'object' ) {
            this.startDate = Rally.util.DateTime.toIsoString(this.startDate);
        }
        if ( this.endDate && typeof(this.endDate) === 'object' ) {
            this.endDate = Rally.util.DateTime.toIsoString(this.endDate);
        }
        
        if ( this.startDate && ! /-/.test(this.startDate)  ){
            throw "Failed to create Rally.TechnicalServices.CFDCalculator: startDate must be a javascript date or ISO date string";
        }

        if ( this.endDate && ! /-/.test(this.endDate)  ){
            throw "Failed to create Rally.TechnicalServices.CFDCalculator: endDate must be a javascript date or ISO date string";
        }
    
        // switch dates
        if ( this.startDate && this.endDate ) {
            if ( this.startDate > this.endDate ) {
                var holder = this.startDate;
                this.startDate = this.endDate;
                this.endDate = holder;
            }
        }
        
        if ( this.startDate ) { this.startDate = this.startDate.replace(/T.*$/,""); }
        if ( this.endDate ) { this.endDate = this.endDate.replace(/T.*$/,""); }
    },
    /*
     * How to measure
     * 
     * { 
     *      field       : the field that has the value to add up on each day
     *      as          : the name to display in the legend
     *      display     : "line" | "column" | "area"
     *      f           : function to use (e.g., "sum", "filteredSum"
     *      filterField : (when f=filteredSum) field with values used to group by (stacks on column)
     *      filterValues: (when f=filteredSum) used to decide which values of filterField to show
     */
    getMetrics: function () {
        
        var metric = {
            f: 'groupBySum',
            field: this.value_field, 
            groupByField: this.group_by_field, 
            allowedValues: this.allowed_values,
            display:'area'
        };
                
        if ( this.value_type == "count" ) {
            metric.f = 'groupByCount';
        }
        
        return [ metric ];
    },
    /*
     * Modified to allow groupBySum/groupByCount to spit out stacked area configs
     */
    _buildSeriesConfig: function (calculatorConfig) {
        var aggregationConfig = [],
            metrics = calculatorConfig.metrics,
            derivedFieldsAfterSummary = calculatorConfig.deriveFieldsAfterSummary;

        _.each(metrics, function(metric, i) {
            if ( metric.f == "groupBySum" || metric.f == "groupByCount") {
                var type = metric.f.replace(/groupBy/,"");
                
                if ( ! metric.allowedValues ) {
                    throw "Rally.TechnicalServices.CFDCalculator requires setting 'allowed_values'";
                }
                Ext.Array.each(metric.allowedValues,function(allowed_value){
                    aggregationConfig.push({
                        f: type,
                        name: allowed_value,
                        type: metric.display || "area",
                        dashStyle: metric.dashStyle || "Solid",
                        stack: 1
                    });
                });
            } else {
                aggregationConfig.push({
                    name: metric.as || metric.field,
                    type: metric.display,
                    dashStyle: metric.dashStyle || "Solid"
                });
            }
        });

        for (var j = 0, jlength = derivedFieldsAfterSummary.length; j < jlength; j += 1) {
            var derivedField = derivedFieldsAfterSummary[j];
            aggregationConfig.push({
                name: derivedField.as,
                type: derivedField.display,
                dashStyle: derivedField.dashStyle || "Solid"
            });
        }

        return aggregationConfig;
    },
    /*
     * WSAPI will give us allowed values that include "", but the
     * snapshot will actually say null
     * 
     */
    _convertNullToBlank:function(snapshots) {
        _.each(snapshots, function(snapshot) {
            if (snapshot[this.group_by_field] === null ||
                !snapshot.hasOwnProperty(this.group_by_field)) {
                snapshot[this.group_by_field] = 'None';
            }
        }, this);
        return snapshots;
    },
    _getAllowedSnapshots:function(snapshots){
        var allowed_snapshots = [];
        var allowed_oids = this.allowed_oids;
        
        if ( allowed_oids.length === 0 ) {
            return [];
        }
        var number_of_snapshots = snapshots.length;
        for ( var i=0;i<number_of_snapshots;i++ ) {
            if (Ext.Array.contains(allowed_oids,snapshots[i].ObjectID)) {
                allowed_snapshots.push(snapshots[i]);
            }
        }
        return allowed_snapshots;
    },
    // override runCalculation to change false to "false" because highcharts doesn't like it
    runCalculation: function (snapshots) {
        console.log(snapshots);
        var calculatorConfig = this._prepareCalculatorConfig(),
            seriesConfig = this._buildSeriesConfig(calculatorConfig);

        var calculator = this.prepareCalculator(calculatorConfig);
        
        var clean_snapshots = this._convertNullToBlank(snapshots);
        if (this.allowed_oids !== null) {
            clean_snapshots = this._getAllowedSnapshots(clean_snapshots);
        }
        if ( clean_snapshots.length > 0 ) {
            calculator.addSnapshots(clean_snapshots, this._getStartDate(clean_snapshots), this._getEndDate(clean_snapshots));
        }
        var chart_data = this._transformLumenizeDataToHighchartsSeries(calculator, seriesConfig);
        
        // check for false
        Ext.Array.each(chart_data.series,function(series){
            if ( series.name === "" ) {
                series.name = "None";
            }
            
            if (series.name === false) {
                series.name = "False";
            }
            
            if (series.name == true) {
                series.name = "True";
            }
        });
        
        return chart_data;
    }
        
        
});