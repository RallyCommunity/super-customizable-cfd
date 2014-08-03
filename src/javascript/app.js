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
        if (this.isExternal()){
            this.showSettings(this.config);
        } else {
            this.onSettingsUpdate(this.getSettings());  //(this.config.type,this.config.pageSize,this.config.fetch,this.config.columns);
        }  
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
        var value_field = "PlanEstimate";
        
        var chart_title = this._getChartTitle(type_path,group_by_field);
        
        
        this.down('#display_box').add({
            xtype:'rallychart',
            storeType: 'Rally.data.lookback.SnapshotStore',
            calculatorType: 'Rally.TechnicalServices.CFDCalculator',
            calculatorConfig: {
                /*startDate: "2013-12-01T00:00:00.000Z",*/
                /*tz: "America/Anchorage",*/
                allowed_values: allowed_values,
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
    /* Overrides for App class
    /*
    /********************************************/
    //getSettingsFields:  Override for App    
    getSettingsFields: function() {
        
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
            labelWidth: 100,
            fieldLabel: 'Group By',
            labelAlign: 'left',
            minWidth: 200,
            margin: 10,
            autoExpand: false,
            alwaysExpanded: false,
            handlesEvents: { 
                select: function(type_picker) {
                    console.log("select happened",type_picker.getValue());
                    this.refreshWithNewModelType(type_picker.getValue());
                },
                ready: function(type_picker){
                    console.log("ready happened",type_picker.getValue());
                    this.refreshWithNewModelType(type_picker.getValue());
                    
                }
            },
            readyEvent: 'ready'
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
        this._makeChart();
    }

});
