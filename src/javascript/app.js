Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    config: {
        model_type:'HierarchicalRequirement',
        start_date: Rally.util.DateTime.add(new Date(),"month",-1),
        end_date: new Date(),
        group_by_field_name: 'ScheduleState',
        metric: 'Count',
        groups:[]
    },
    logger: new Rally.technicalservices.Logger(),
    items: [
        {xtype:'container',itemId:'selector_box', margin: 5, padding: 5},
        {xtype:'container',itemId:'chart_box', margin: 5, padding: 5},
        {xtype:'tsinfolink',informationHtml:"<strong>Super-Customizable CFD</strong><p/>Start by pushing the Settings button"}
    ],
    launch: function() {
        this.logger.log("Launched with context", this.getContext(), "and config", this.config);
        this.down('#selector_box').add({
            xtype:'rallybutton',
            text:'Settings',
            handler: function() {
                this._showSettingsDialog();
            },
            scope: this
            
        });
    },
    _showSettingsDialog: function() {
        if ( this.dialog ) { this.dialog.destroy(); }
        var config = this.config;
        
        this.dialog = Ext.create('Rally.technicalservices.SettingsDialog',{
            model_type: config.model_type,
            width: 200,
            group_by_field_name: config.group_by_field_name,
            metric: config.metric,
            listeners: {
                settingsChosen: function(dialog,returned_config) {
                    this.config = Ext.Object.merge(this.config,returned_config);
                    this.logger.log("new config",this.config);
                    this._reCalculate();
                },
                scope: this
            }
        });
        this.dialog.show();
    },
    _reCalculate:function() {
        var me = this;
        this.down('#chart_box').removeAll();
        this.getEl().mask("Loading");

        var array_of_days = Rally.technicalservices.util.Utilities.arrayOfDaysBetween(this.config.start_date,this.config.end_date,true);
        
        var promises = _.map(array_of_days,me._getSnapshots,this);
        promises.push(me._getValidFieldChoices(),this);
        
        Deft.Promise.all(promises).then({
            success: function(days) {
                // got back an array of calculated data for each day (tsday model) (plus the null back from the other call)
                
                days.pop();
                days.pop();
                me._makeChart(days);
            }, 
            failure: function(records) {
                console.log("oops");
            }
        });
        
    },
    _getValidFieldChoices: function() {
        this.logger.log("_getValidFieldChoices");
        var deferred = Ext.create('Deft.Deferred');
        var config = this.config;
        var me = this;
        
        config.groups = [];
        
        if ( config.group_by_field_type === "BOOLEAN" ) {
            config.groups = ["true","false"];
            deferred.resolve("x");
        } else {
            Rally.data.ModelFactory.getModel({
                type: config.model_type,
                success: function(model){
                    var field = model.getField(config.group_by_field_name);
                    field.getAllowedValueStore().load({
                        callback: function(values,operation,success) {
                            Ext.Array.each(values, function(value){
                                config.groups.push(value.get('StringValue'));
                            });
                            deferred.resolve("x");
                        }
                    });
                    
                },
                scope: this
            });
        }
        
        return deferred.promise;
    },
    _getSnapshots:function(day){
        var config = this.config;
        
        var deferred = Ext.create('Deft.Deferred');
        
        this.logger.log("fetching snapshots at", day);
        var project = this.getContext().getProject().ObjectID;
        
        var date_array = 
        Ext.create('Rally.data.lookback.SnapshotStore',{
            fetch: [config.group_by_field_name, config.metric],
            autoLoad: true,
            filters: [
                {property:'_TypeHierarchy',value:config.model_type},
                {property:'__At',operator:'=',value:Rally.util.DateTime.toIsoString(day)},
                {property:'_ProjectHierarchy', value:project}
            ],
            hydrate: [config.group_by_field_name],
            listeners: {
                load: function(store,snaps,success){
                    if (success) {
                        this.logger.log("snaps",snaps);
                        var day_calculator = Ext.create('TSDay',{
                            metricFieldName: config.metric,
                            groupByFieldName:config.group_by_field_name,
                            JSDate: day
                        });
                        Ext.Array.each(snaps, function(snap){
                            day_calculator.addSnap(snap);
                        });
                        deferred.resolve(day_calculator);
                    } else {
                        deferred.reject("Error Loading Snapshots for " + day);
                    }
                },
                scope: this
            }
        });
        return deferred.promise;
    },
    _getCategories: function(days) {
        var me = this;
        this.logger.log("_getCategories");
        var categories = [];
        Ext.Array.each(days,function(day){
            categories.push(day.get('JSDate'));
        });
        return categories;
    },
    _getSeries: function(days){
        this.logger.log("_getSeries");
        var group_data = {};
        var series = [];
        
        var groups = this.config.groups;
        Ext.Array.each(groups, function(group){
            group_data[group] = [];
        });
        
        Ext.Array.each(days, function(day){
            if ( day ) {
                Ext.Array.each(groups,function(group_name){
                    var group_value = day.getGroupTotal(group_name);
                    group_data[group_name].push(group_value);
                });
            }
        });
        
        Ext.Array.each(groups,function(group_name){
            var display_group_name = group_name;
            if ( group_name == "" ) { display_group_name = "None"; }
            series.push({
                type:'area',
                name: display_group_name,
                data: group_data[group_name]
            });
        });
        
        return series;
    },
    _makeChart: function(days) {
        var me = this;
        this.logger.log("_makeChart",days);
        
        this.down('#chart_box').removeAll();
        
        var categories = this._getCategories(days);
        var series = this._getSeries(days);
        
        this.logger.log('categories',categories);
        this.logger.log('series',series);
        
        this.getEl().unmask();
        
        this.down('#chart_box').add({
            xtype:'rallychart',
            chartData: {
                series: series,
                categories: categories
            },
            chartConfig: {
                chart: { 
                    width: me.getWidth(),
                    type:'area'
                },
                title: {
                    text: '',
                    align: 'center'
                },
                xAxis: [
                    {
                        categories: categories,
                        labels: {
                            align: 'left',
                            rotation: 70,
                            formatter: function() {
                                return Ext.Date.format(this.value,'d-M');
                            }
                        }
                    }
                ],
                yAxis: [{title:{text:''}}],
                plotOptions: {
                    series: {
                        stacking: 'normal'
                    }
                }
            }
            
        });
        
    }
});
