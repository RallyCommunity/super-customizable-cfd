Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    settingsScope: 'app',
    items: [
        {xtype:'container',itemId:'settings_box'},
        {xtype:'container',itemId:'display_box',margin:10},
        {xtype:'tsinfolink'}
    ],
    launch: function() {
        if (this.isExternal()){
            this.showSettings(this.config);
        } else {
            if ( ! this.getSetting('type_path') ) {
                this.down('#display_box').add({
                    xtype:'container',
                    html:'No settings applied.  Select "Edit App Settings." from the gear menu.'
                });
            }
            this.onSettingsUpdate(this.getSettings());  //(this.config.type,this.config.pageSize,this.config.fetch,this.config.columns);
        }  
    },
    _getChartTitle: function(type_path,group_by_field){
        var type = this._deCamelCase(type_path);
        var field = this._deCamelCase(group_by_field);
        var main_title = type + " grouped by " + field;
        
        var title = main_title;
        var query_string = this.getSetting('query_string');
        if ( query_string ) {
            title += "<br/>Filtered with " + query_string;
        }
        return title;
    },
    _deCamelCase: function(camelCaseText){
        this.logger.log("_deCamelCase",camelCaseText);
        
        var spaced_out_text = camelCaseText.replace( /([A-Z])/g, " $1" );
        var initial_cap_text = spaced_out_text.charAt(0).toUpperCase() + spaced_out_text.slice(1);
        var removed_custom_field_prefix = initial_cap_text.replace(/^C_ /,"");
        
        this.logger.log(" .. ", removed_custom_field_prefix);
        return removed_custom_field_prefix;
    },
    _preProcess: function() {
        this._getAllowedValues().then({
            scope: this,
            success:this._getOIDsAndMakeChart,
            failure:function(message){
                this.down('#display_box').add({xtype:'container',html:'message'});
            }
        });
    },
    _getAllowedValues:function(){
        var deferred = Ext.create('Deft.Deferred');
        var type_path = this.getSetting('type_path');
        var group_by_field = this.getSetting('group_by_field');
        
        var allowed_values = [];
        
        Rally.data.ModelFactory.getModel({
            type: type_path,
            success: function(model){
                var field = model.getField(group_by_field);
                var attribute_definition = field.attributeDefinition;
                if ( attribute_definition && attribute_definition.AttributeType == "BOOLEAN" ) {
                    deferred.resolve([true,false]);
                } else {
                    field.getAllowedValueStore().load({
                        callback: function(values,operation,success) {
                            Ext.Array.each(values, function(value){
                                allowed_values.push(value.get('StringValue'));
                            });
                            deferred.resolve(allowed_values);
                        }
                    });
                }
            },
            scope: this
        });
        return deferred.promise;
    },
    _findOIDsByQuery: function(model,query_string) {
        this.logger.log("_findOIDsByQuery");
        this.setLoading("Loading Filtered Data");

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
                        this.setLoading(false);
                        deferred.resolve(oids);
                    } else {
                        this.setLoading(false);
                        deferred.reject("Error loading filter");
                    }
                }
            }
        });
        return deferred.promise;
    },
    _getOIDsAndMakeChart: function(allowed_values) {
        var type_path = this.getSetting('type_path');
        var query_string = this.getSetting('query_string');
        
        if ( query_string ) { 
            this.logger.log("Using query:", query_string);
            
            this._findOIDsByQuery(type_path, query_string).then({
                scope: this,
                success: function(oids){
                    this._makeChart(allowed_values,oids);
                },
                failure: function(error) {
                    alert("Error while trying to apply filter");
                }
            });
        } else {
            this._makeChart(allowed_values,null);
        }
    },
    _makeChart: function(allowed_values,allowed_oids) {
        this.down('#display_box').removeAll();
        
        var project = this.getContext().getProject().ObjectID;
        var type_path = this.getSetting('type_path');
        var group_by_field = this.getSetting('group_by_field');
        var start_date = this.getSetting('start_date');
        var end_date = this.getSetting('end_date');
        
        var value_field = this.getSetting('metric_field');
        
        this.logger.log("Making chart for ", type_path, " on ", group_by_field);
        this.logger.log("  Start Date/End Date: ", start_date, end_date);
        this.logger.log("  Allowed Values: ", allowed_values);
        
        var chart_title = this._getChartTitle(type_path,group_by_field);
        this.logger.log("  Title: ", chart_title);
        
        this.down('#display_box').add({
            xtype:'rallychart',
            storeType: 'Rally.data.lookback.SnapshotStore',
            calculatorType: 'Rally.TechnicalServices.CFDCalculator',
            calculatorConfig: {
                startDate: start_date,
                endDate: end_date,/*
                /*tz: "America/Anchorage",*/
                allowed_values: allowed_values,
                allowed_oids: allowed_oids,
                value_field: value_field,
                group_by_field: group_by_field
            },
            storeConfig: {
                filters: [
                    {property:'_TypeHierarchy',value: type_path},
                    {property:'_ProjectHierarchy', value: project}
                ],
                hydrate: [group_by_field],
                fetch: [group_by_field,value_field]
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
                             text: value_field
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
    },
    isExternal: function(){
      return typeof(this.getAppId()) == 'undefined';
    },
    
    
    
    /********************************************
    /* for drop-down filtering
    /*
    /********************************************/
    _filterOutExceptChoices: function(store) {
        store.filter([{
            filterFn:function(field){ 
                var attribute_definition = field.get('fieldDefinition').attributeDefinition;
                var attribute_type = null;
                if ( attribute_definition ) {
                    attribute_type = attribute_definition.AttributeType;
                }
                if (  attribute_type == "BOOLEAN" ) {
                    return true;
                }
                if ( attribute_type == "STRING" || attribute_type == "STATE" ) {
                    if ( field.get('fieldDefinition').attributeDefinition.Constrained ) {
                        return true;
                    }
                }
                if ( field.get('name') === 'State' ) { 
                    return true;
                }
                return false;
            } 
        }]);
    },
    _addCountToChoices: function(store){
        store.add({name:'Count',value:'Count',fieldDefinition:{}});
    },
    _filterOutExceptNumbers: function(store) {
        store.filter([{
            filterFn:function(field){ 
                var field_name = field.get('name');

                if ( field_name == 'Formatted ID' || field_name == 'Object ID' ) {
                    return false;
                }
                if ( field_name == 'Latest Discussion Age In Minutes' ) {
                    return false;
                }
                
                if ( field_name == 'Count' ) { return true; }
                
                var attribute_definition = field.get('fieldDefinition').attributeDefinition;
                var attribute_type = null;
                if ( attribute_definition ) {
                    attribute_type = attribute_definition.AttributeType;
                }
                if (  attribute_type == "QUANTITY" || attribute_type == "INTEGER" || attribute_type == "DECIMAL" ) {
                    return true;
                }

                return false;
            } 
        }]);
    },
        
    /********************************************
    /* Overrides for App class
    /*
    /********************************************/
    //getSettingsFields:  Override for App    
    getSettingsFields: function() {
        var me = this;
        
        return [
        {
            name: 'type_path',
            xtype:'rallycombobox',
            displayField: 'DisplayName',
            fieldLabel: 'Artifact Type',
            autoExpand: true,
            storeConfig: {
                model:'TypeDefinition',
                filters: [
                  {property:'Restorable',value:true}
                ]
            },
            labelWidth: 100,
            labelAlign: 'left',
            minWidth: 200,
            margin: 10,
            valueField:'TypePath',
            bubbleEvents: ['select','ready'],
            readyEvent: 'ready'
        },
        {
            name: 'group_by_field',
            xtype: 'rallyfieldcombobox',
            fieldLabel: 'Group By',
            labelWidth: 100,
            labelAlign: 'left',
            minWidth: 200,
            margin: 10,
            autoExpand: false,
            alwaysExpanded: false,
            handlesEvents: { 
                select: function(type_picker) {
                    this.refreshWithNewModelType(type_picker.getValue());
                },
                ready: function(type_picker){
                    this.refreshWithNewModelType(type_picker.getValue());
                }
            },
            listeners: {
                ready: function(field_box) {
                    me._filterOutExceptChoices(field_box.getStore());
                }
            },
            readyEvent: 'ready'
        },
        {
            name: 'metric_field',
            xtype: 'rallyfieldcombobox',
            fieldLabel: 'Measure',
            labelWidth: 100,
            labelAlign: 'left',
            minWidth: 200,
            margin: 10,
            autoExpand: false,
            alwaysExpanded: false,
            handlesEvents: { 
                select: function(type_picker) {
                    this.refreshWithNewModelType(type_picker.getValue());
                },
                ready: function(type_picker){
                    this.refreshWithNewModelType(type_picker.getValue());
                }
            },
            listeners: {
                ready: function(field_box) {
                    me._addCountToChoices(field_box.getStore());
                    me._filterOutExceptNumbers(field_box.getStore());
                    field_box.setValue( field_box.getStore().getAt(0) );
                }
            },
            readyEvent: 'ready'
        },
        {
            name: 'start_date',
            xtype: 'rallydatefield',
            fieldLabel: 'Start Date',
            labelWidth: 100,
            labelAlign: 'left',
            minWidth: 200,
            margin: 10
        },
        {
            name: 'end_date',
            xtype: 'rallydatefield',
            fieldLabel: 'End Date',
            labelWidth: 100,
            labelAlign: 'left',
            minWidth: 200,
            margin: 10
        },
        {
            xtype:'textareafield',
            grow: true,
            name:'query_string',
            labelAlign: 'top',
            width: 250,
            margin: 10,
            fieldLabel:'Limit to items that currently meet this query:'
        }];
    },
    //showSettings:  Override to add showing when external + scrolling
    showSettings: function(options) {
        this.logger.log("showSettings",options);
        this._appSettings = Ext.create('Rally.app.AppSettings', Ext.apply({
            fields: this.getSettingsFields(),
            settings: this.getSettings(),
            defaultSettings: this.getDefaultSettings(),
            context: this.getContext(),
            settingsScope: this.settingsScope
        }, options));

        this._appSettings.on('cancel', this._hideSettings, this);
        this._appSettings.on('save', this._onSettingsSaved, this);
        
        if (this.isExternal()){
            if (this.down('#settings_box').getComponent(this._appSettings.id)==undefined){
                this.down('#settings_box').add(this._appSettings);
            }
        } else {
            this.hide();
            this.up().add(this._appSettings);
        }
        return this._appSettings;
    },
    _onSettingsSaved: function(settings){
        this.logger.log('_onSettingsSaved',settings);
        Ext.apply(this.settings, settings);
        this._hideSettings();
        this.onSettingsUpdate(settings);
    },
    //onSettingsUpdate:  Override
    onSettingsUpdate: function (settings){
        //Build and save column settings...this means that we need to get the display names and multi-list
        this.logger.log('onSettingsUpdate',settings);
        
        var type = this.getSetting('type');
        this._preProcess();
    }

});
