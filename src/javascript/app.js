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
        this._makeGraph();
    },
    _makeGraph: function(allowed_values) {
        var project = this.getContext().getProject().ObjectID;
        var allowed_values = ['Defined','In-Progress', 'Completed', 'Accepted'];
        var type_path = "HierarchicalRequirement";
        var chart_title = type_path;
        
        
        this.down('#display_box').add({
            xtype:'rallychart',
            storeType: 'Rally.data.lookback.SnapshotStore',
            calculatorType: 'Rally.TechnicalServices.CFDCalculator',
            calculatorConfig: {
                /*startDate: "2013-12-01T00:00:00.000Z",*/
                /*tz: "America/Anchorage",*/
                allowed_values: allowed_values
            },
            storeConfig: {
                filters: [
                    {property:'_TypeHierarchy',value: type_path},
                    {property:'_ProjectHierarchy', value: project}
                ],
                hydrate: ["ScheduleState"],
                fetch: ["ScheduleState","PlanEstimate"]
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
                             text: 'Count'
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
