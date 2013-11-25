Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    config: {
        model_type:'HierarchicalRequirement',
        start_date: Rally.util.DateTime.add(new Date(),"month",-3),
        end_date: Rally.util.DateTime.add(new Date(),"day",-1),
        group_by_field_name: 'ScheduleState',
        metric: 'Count',
        groups:[],
        /**
         * At this number of days, switch to displaying by week instead of by day
         * @type Number
         */
        day_to_week_switch_point: 45,
        query_string: null
    },
    logger: new Rally.technicalservices.Logger(),
    items: [
        {xtype:'container',itemId:'selector_box', margin: 5, padding: 5},
        {xtype:'container',itemId:'chart_box', margin: 10, padding: 10},
        {xtype:'tsinfolink',informationHtml:"<strong>Super-Customizable CFD</strong><p/>Start by pushing the Settings button"}
    ],
    launch: function() {
        this.logger.log("Launched with context", this.getContext(), "and config", this.config);
        var me = this;
        
        this._getPITypes().then({
            success: function(pi_types) {
                me.down('#selector_box').add({
                    xtype:'rallybutton',
                    text:'Settings',
                    handler: function() {
                        me._showSettingsDialog();
                    },
                    scope: me
                    
                });
            },
            failure: function(error) {
                alert(error);
            }
        });
    },
    _getPITypes: function() {
        var me = this;
        var deferred = Ext.create('Deft.Deferred');
        Ext.create('Rally.data.WsapiDataStore',{
            model: 'TypeDefinition',
            filters: [{property:'TypePath',operator:'contains',value:'PortfolioItem/'}],
            autoLoad: true,
            listeners: {
                load: function(store,types) {
                    me.config.artifact_types = [
                        {Name:'HierarchicalRequirement',Value:'HierarchicalRequirement'},
                        {Name:'Defect',Value:'Defect'},
                        {Name:'Task',Value:'Task'}
                    ];
                    
                    Ext.Array.each(types, function(type){
                        me.config.artifact_types.push({
                            Name:type.get('DisplayName'),
                            Value:type.get('TypePath')
                        });
                    });
                    deferred.resolve(types);
                }
            }
        });
        return deferred.promise;
    },
    _showSettingsDialog: function() {
        if ( this.dialog ) { this.dialog.destroy(); }
        var config = this.config;
        
        this.dialog = Ext.create('Rally.technicalservices.SettingsDialog',{
            model_type: config.model_type,
            group_by_field_name: config.group_by_field_name,
            metric: config.metric,
            start_date: config.start_date,
            end_date: config.end_date,
            artifact_types: config.artifact_types,
            query_string: config.query_string,
            listeners: {
                settingsChosen: function(dialog,returned_config) {
                    this.config = Ext.Object.merge(this.config,returned_config);
                    this.logger.log("new config",this.config);
                    if ( this.config.start_date < new Date(2011,10,11) ) { this.config.start_date = new Date(2011,10,11); }
                    if ( this.config.end_date < new Date(2011,10,11) ) { this.config.end_date = new Date(2011,10,11); }
                    
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

        this.config.limit_to_oids = null;
        
        if ( this.config.query_string ) { 
            this.logger.log("Using query:",this.config.query_string);
            
            this._limitRecordsByQuery(this.config.model_type, this.config.query_string).then({
                success: function(oids){
                    me.config.limit_to_oids = oids;
                    me._recalculateLookBack();
                },
                failure: function(error) {
                    alert("Error while trying to apply filter");
                    me.getEl().unmask();
                }
            });
        } else {
            this._recalculateLookBack(null);
        }
    },
    _limitRecordsByQuery: function(model,query_string) {
        this.logger.log("_limitRecordsByQuery");
        this.getEl().mask("Loading Filter Data");

        var deferred = Ext.create('Deft.Deferred');
        
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        
        Ext.create('Rally.data.WsapiDataStore',{
            model: model,
            autoLoad: true,
            limit: 'Infinity',
            filters: filter,
            fetch: ['ObjectID'],
            listeners: {
                scope: this,
                load: function(store,items,successful,opts){
                    this.logger.log("wsapi load",successful,opts);
                    if ( successful ) {
                        var oids = [];
                        Ext.Array.each(items, function(item){
                            oids.push(item.get('ObjectID'));
                        });
                        this.logger.log("back from wsapi with",oids);
                        deferred.resolve(oids);
                    } else {
                        deferred.reject("Error loading filter");
                    }
                }
            }
        });
        return deferred.promise;
    },
    _shouldUseSnap: function(snap) {
        if ( this.config.query_string ) {
            var oids = this.config.limit_to_oids;
            var oid = snap.get('ObjectID');
            return Ext.Array.contains(oids,oid);
        } else { 
            return true;
        }
    },
    _recalculateLookBack: function(limit_to_oids) {
        var me = this;
        this.getEl().mask("Loading Historical Data");

        var config = this.config;
                
        var array_of_days = Rally.technicalservices.util.Utilities.arrayOfDaysBetween(config.start_date,config.end_date,true,config.day_to_week_switch_point);
        
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
        var me = this;
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
                            if ( me._shouldUseSnap(snap) ) {
                                day_calculator.addSnap(snap);
                            }
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
    /*
     * determine what the distance between two x values is
     */
    _getIncrement: function(days){
        this.logger.log("_getIncrement");
        var increment = 0;
        if ( days.length > 1 ) {
            increment = Rally.util.DateTime.getDifference(days[1].get('JSDate'),days[0].get('JSDate'),'day');
        }
        this.logger.log("Increment",increment);
        return increment;
    },
    _makeChart: function(days) {
        var me = this;
        var config = this.config;
        
        this.logger.log("_makeChart",days);
        
        this.down('#chart_box').removeAll();
        
        var categories = this._getCategories(days);
        var series = this._getSeries(days);
        var increment = this._getIncrement(days);
        
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
                    type:'area'
                },
                title: {
                    text: config.model_type + " grouped by " + config.group_by_field_name,
                    align: 'center'
                },
                xAxis: [
                    {
                        categories: categories,
                        labels: {
                            align: 'left',
                            rotation: 70,
                            formatter: function() {
                                if ( increment < 1 ) {
                                    return Ext.Date.format(this.value,'H:i');
                                }
                                return Ext.Date.format(this.value,'d-M');
                            }
                        }
                    }
                ],
                yAxis: [
                    {title:
                        {text:config.metric}
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
        if (this.config.query_string) {
            this.down('#chart_box').add({xtype:'container', html:'Filterd by: ' + this.config.query_string});
        }
    }
});
