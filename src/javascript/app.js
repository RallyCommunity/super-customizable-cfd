Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    items: [
        {xtype:'container',itemId:'settings_box'},
        {xtype:'container',itemId:'display_box',margin:10},
        {xtype:'tsinfolink'}
    ],
    launch: function() {
        this._makeChart();
    },
    _getChartTitle: function(type_path,group_by_field){
        var type = this._deCamelCase(type_path);
        var field = this._deCamelCase(group_by_field);
        
        return type + " grouped by " + field;
    },
    _deCamelCase: function(camelCaseText){
        var result = camelCaseText.replace( /([A-Z])/g, " $1" );
        var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
        return finalResult;
    },
    _makeChart: function(group_by_field) {
        var project = this.getContext().getProject().ObjectID;
        var type_path = "HierarchicalRequirement";
        var group_by_field = "ScheduleState";
        var allowed_values = ['Defined','In-Progress', 'Completed', 'Accepted'];
        var metric_field = "PlanEstimate";
        
        var chart_title = this._getChartTitle(type_path,group_by_field);
        
        
        this.down('#display_box').add({
            xtype:'rallychart',
            storeType: 'Rally.data.lookback.SnapshotStore',
            calculatorType: 'Rally.TechnicalServices.CFDCalculator',
            calculatorConfig: {
                /*startDate: "2013-12-01T00:00:00.000Z",*/
                /*tz: "America/Anchorage",*/
                allowed_values: allowed_values,
                metric_field: metric_field
            },
            storeConfig: {
                filters: [
                    {property:'_TypeHierarchy',value: type_path},
                    {property:'_ProjectHierarchy', value: project}
                ],
                hydrate: [group_by_field],
                fetch: [group_by_field,metric_field]
            },
            chartConfig: {
                 chart: {
                     zoomType: 'xy'
                 },
                 title: {
                     text: chart_title
                 },
                 xAxis: {
                     tickmarkPlacement: 'on',
                     tickInterval: 30,
                     title: {
                         text: ''
                     }
                 },
                 yAxis: [
                     {
                         title: {
                             text: metric_field
                         }
                     }
                 ],
                 plotOptions: {
                    series: {
                        marker: { enabled: false },
                        stacking: 'normal'
                    }
                }
            }
        });
    }
});
