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
        
        if ( this.startDate == "" ) { this.startDate = null; }
        if ( this.endDate == "" )   { this.endDate   = null; }
        
        if ( this.startDate && typeof this.startDate !== "object" ){
            throw "Failed to create Rally.TechnicalServices.CFDCalculator: startDate must be a javascript date";
        }

        if ( this.endDate && typeof this.endDate !== "object" ){
            throw "Failed to create Rally.TechnicalServices.CFDCalculator: endDate must be a javascript date";
        }
    

        // switch dates
        if ( this.startDate && this.endDate ) {
            if ( this.startDate > this.endDate ) {
                var holder = this.startDate;
                this.startDate = this.endDate;
                this.endDate = holder;
            }
        }
        if ( this.startDate ) {
            this.startDate = Rally.util.DateTime.toIsoString(this.startDate).replace(/T.*$/,"");
        }
        if ( this.endDate ) {
            this.endDate = Rally.util.DateTime.toIsoString(this.endDate).replace(/T.*$/,"");
        }
    },
    
    runCalculation: function(snaps){
        //console.log(snaps);
        return this.callParent(arguments);
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

        for (var i = 0, ilength = metrics.length; i < ilength; i += 1) {
            var metric = metrics[i];
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
        }

        for (var j = 0, jlength = derivedFieldsAfterSummary.length; j < jlength; j += 1) {
            var derivedField = derivedFieldsAfterSummary[j];
            aggregationConfig.push({
                name: derivedField.as,
                type: derivedField.display,
                dashStyle: derivedField.dashStyle || "Solid"
            });
        }

        return aggregationConfig;
    }
});