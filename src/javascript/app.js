Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    settingsScope: 'app',
    layout: 'fit',
    items: [
        {
          xtype:'container',
          itemId:'display_box',
          layout: {
            type: 'vbox',
            align: 'stretch'
          },
          items: [
              { xtype: 'rallyleftright', itemId: 'header', height: 30 },
              { xtype: 'container', itemId: 'filterContainer'},
              { xtype: 'container', itemId: 'chartContainer', layout: 'fit', flex: 1 },
            ]
        }
    ],
    launch: function() {
        if ( ! this.getSetting('type_path') ) {
            this._showMissingSettingMessage('No settings applied.  Select "Edit App Settings." from the gear menu.');
        } else {
            this._refresh();
        }  
    },
    _showMissingSettingMessage: function(message) {
        this.down('#chartContainer').add({
            xtype: 'container',
            html: message
        });
    },
    onTimeboxScopeChange: function () {
        this.callParent(arguments);

        this._refresh();
    },
    _addHeaderControls: function() {
        var blackListFields = ['FlowState'],
            whiteListFields = ['Milestones', 'Tags'],
            modelNames = [this.model.typePath];
        this.down('#header').getLeft().add({
            xtype: 'rallyinlinefiltercontrol',
            context: this.getContext(),
            height: 26,
            align: 'left',
            inlineFilterButtonConfig: {
                stateful: true,
                stateId: this.getContext().getScopedStateId('inline-filter'),
                context: this.getContext(),
                modelNames: modelNames,
                filterChildren: false,
                inlineFilterPanelConfig: {
                    quickFilterPanelConfig: {
                        defaultFields: ['ArtifactSearch', 'Owner'],
                        addQuickFilterConfig: {
                            blackListFields: blackListFields,
                            whiteListFields: whiteListFields
                        }
                    },
                    advancedFilterPanelConfig: {
                        advancedFilterRowsConfig: {
                            propertyFieldConfig: {
                                blackListFields: blackListFields,
                                whiteListFields: whiteListFields
                            }
                        }
                    }
                },
                listeners: {
                    inlinefilterchange: this._onFilterChange,
                    inlinefilterready: function (inlineFilterPanel) {
                      this.down('#filterContainer').add(inlineFilterPanel);
                    },
                    scope: this
                }
            }
        });

        var isIE = this._isIE();
        this.down('#header').getRight().add({
            xtype: 'rallybutton',
            disabled: isIE,
            cls: 'secondary rly-small',
            margin: '3px 20px 0 0',
            frame: false,
            iconCls: 'icon-export',
            toolTipConfig: {
                html: isIE ? 'Export is currently not supported in Microsoft browsers.' : 'Export',
                anchor: 'top',
                hideDelay: 0
            },
            listeners: {
                click: this._onExportClick,
                scope: this
            }
        });
    },

    _isIE: function() {
        var ua = window.navigator.userAgent;
        return ua.indexOf('MSIE ') > 0 ||
            ua.indexOf('Trident/') > 0 ||
            ua.indexOf('Edge/') > 0;
    },

    _onFilterChange: function (inlineFilterButton) {
        this.filterInfo = inlineFilterButton.getTypesAndFilters();
        this._getOIDsAndMakeChart(this.allowedValues);
    },

    _onExportClick: function () {
        if (!this._isIE()) {
            var link = document.createElement('a');
            var chartData = this.down('rallychart').chartData;
            var data = _.reduce(chartData.categories, function(accum, category, i) {
                var row = [category];
                _.each(chartData.series, function(series) {
                    row.push(series.data[i]);
                });
                accum.push(row.join(','));
                return accum;
            }, [['Date'].concat(_.pluck(chartData.series, 'name')).join(',')]);
            link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURI(data.join('\n')));
            link.setAttribute('download', 'cfd.csv');
            link.click();
        }
    },

    _getChartTitle: function(type_path,group_by_field){
        var type = this._deCamelCase(type_path);
        var field = this._deCamelCase(group_by_field);
        var main_title = type + " grouped by " + field;
        
        var title = main_title;
        var query_string = this.getSetting('query_string');
        if ( query_string ) {
            //  title += "<br/>Filtered with " + query_string;
            title = "";
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

    _getStartDate: function() {
        var startDate = this.getSetting('start_date');
        if (startDate === 'timebox') {
            var timeboxScope = this.getContext().getTimeboxScope();
            return timeboxScope && timeboxScope.getRecord() && timeboxScope.getStartDate();
        } else {
            return startDate;
        }
    },

    _getEndDate: function() {
        var endDate = this.getSetting('end_date');
        if (endDate === 'timebox') {
            var timeboxScope = this.getContext().getTimeboxScope();
            return timeboxScope && timeboxScope.getRecord() && timeboxScope.getEndDate();
        } else if (endDate === 'today') {
            return Rally.util.DateTime.toIsoString(new Date()); 
        } else {
            return endDate;
        }
    },

    _preProcess: function() {
        var startDate = this._getStartDate();
        var endDate = this._getEndDate();

        if (!startDate) {
            this._showMissingSettingMessage('No start date available.  Select "Edit App Settings." from the gear menu.');
        } else if (!endDate) {
          this._showMissingSettingMessage('No end date available.  Select "Edit App Settings." from the gear menu.');
        } else {
            this._getAllowedValues().then({
                scope: this,
                success: function(allowedValues) {
                  this.allowedValues = _.map(allowedValues, function(allowedValue) {
                      return allowedValue === '' ? 'None' : allowedValue;
                  });
                  this._addHeaderControls();
                },
                failure:function(message){
                    this.down('#chartContainer').add({xtype:'container',html:'message'});
                }
            });
        }
    },
    _getAllowedValues:function(){
        var deferred = Ext.create('Deft.Deferred');
        var type_path = this.getSetting('type_path');
        var group_by_field = this.getSetting('group_by_field');
        
        var allowed_values = [];
        
        Rally.data.ModelFactory.getModel({
            type: type_path,
            success: function(model){
                this.model = model;
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
    _findOIDsByQuery: function(model, filters) {
        this.logger.log("_findOIDsByQuery");
        this.down('#chartContainer').setLoading("Loading Filtered Data");

        var deferred = Ext.create('Deft.Deferred');
        
        Ext.create('Rally.data.WsapiDataStore',{
            model: model,
            autoLoad: true,
            limit: Infinity,
            pageSize: 2000,
            filters: filters,
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
                        this.down('#chartContainer').setLoading(false);
                        deferred.resolve(oids);
                    } else {
                        this.down('#chartContainer').setLoading(false);
                        deferred.reject("Error loading filter");
                    }
                }
            }
        });
        return deferred.promise;
    },
    _getOIDsAndMakeChart: function(allowed_values) {
        this.down('#chartContainer').removeAll();
        
        var type_path = this.getSetting('type_path');
        var query_string = this.getSetting('query_string');
        var timeboxScope = this.getContext().getTimeboxScope();
        var filters = [].concat(this.filterInfo.filters);
        if (timeboxScope && timeboxScope.isApplicable(this.model)) {
          filters.push(timeboxScope.getQueryFilter());
        }
        if (query_string) {
          filters.push(Ext.create('TSStringFilter',{query_string:query_string}));
        }
        
        if (filters.length) {
            this.logger.log("Using query:", Rally.data.wsapi.Filter.and(filters).toString());
        }

        this._findOIDsByQuery(type_path, filters).then({
            scope: this,
            success: function(oids){
                this._makeChart(allowed_values,oids);
            },
            failure: function(error) {
                alert("Error while trying to apply filter");
            }
        });
    },
    _makeChart: function(allowed_values,allowed_oids) {
        var me = this;
        
        var project = this.getContext().getProject().ObjectID;
        var type_path = this.getSetting('type_path');
        var group_by_field = this.getSetting('group_by_field');
        var start_date = this._getStartDate();
        var end_date = this._getEndDate();
        
        var value_field = this.getSetting('metric_field');
        
        this.logger.log("Making chart for ", type_path, " on ", group_by_field);
        this.logger.log("  Start Date/End Date: ", start_date, end_date);
        this.logger.log("  Allowed Values: ", allowed_values);
        
        var chart_title = this._getChartTitle(type_path,group_by_field);
        this.logger.log("  Title: ", chart_title);
        
        var tickInterval = Math.ceil((moment(end_date).diff(moment(start_date), 'days') / this.getWidth()) * 100);
        
        var findConfig = {
            _TypeHierarchy: type_path,
            ObjectID: { $in: allowed_oids },
        };
        if (/hierarchicalrequirement/i.test(type_path)) {
            findConfig.Children = null; //exclude epics (leaf stories only)
        }
        this.down('#chartContainer').add({
            xtype:'rallychart',
            chartColors: [
                "#FF8200", // $orange
                "#F6A900", // $gold
                "#FAD200", // $yellow
                "#8DC63F", // $lime
                "#1E7C00", // $green_dk
                "#337EC6", // $blue_link
                "#005EB8", // $blue
                "#7832A5", // $purple,
                "#DA1884",  // $pink,
                "#C0C0C0" // $grey4
            ],
            storeType: 'Rally.data.lookback.SnapshotStore',
            calculatorType: 'Rally.TechnicalServices.CFDCalculator',
            calculatorConfig: {
                startDate: start_date,
                endDate: end_date,/*
                /*tz: "America/Anchorage",*/
                allowed_values: allowed_values,
                //allowed_oids: allowed_oids,
                value_field: value_field,
                group_by_field: group_by_field
            },
            storeConfig: {
                find: findConfig,
                hydrate: [group_by_field],
                fetch: [group_by_field,value_field],
                removeUnauthorizedSnapshots : true,
                useHttpPost: true,
                compress: true
            },
            chartConfig: {
                 chart: {
                     zoomType: 'xy',
                     events: {
                        redraw: function () {
//                            me.logger.log('howdy');
//                            me._preProcess();
                        }
                     }
                 },
                 title: {
                     text: chart_title
                 },
                 xAxis: {
                     tickmarkPlacement: 'on',
                     tickInterval: tickInterval,
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
                    var value = me.getSetting('metric_field');
                    if ( value ) {
                        field_box.setValue(value);
                    }
                    if ( !field_box.getValue() ) {
                        field_box.setValue( field_box.getStore().getAt(0) );
                    }
                }
            },
            readyEvent: 'ready'
        },
        {
            name: 'start_date',
            xtype: 'startdatefield',
            fieldLabel: 'Start Date',
            labelWidth: 100,
            labelAlign: 'left',
            margin: 10
        },
        {
            name: 'end_date',
            xtype: 'enddatefield',
            fieldLabel: 'End Date',
            labelWidth: 100,
            labelAlign: 'left',
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

    //onSettingsUpdate:  Override
    onSettingsUpdate: function (settings) {
        if (this.isExternal()) {
            //Build and save column settings...this means that we need to get the display names and multi-list
            this.logger.log('onSettingsUpdate',settings);
            this._refresh();     
        }
    },

    _refresh: function() {
      this.down('#chartContainer').removeAll();
      this.down('#header').getLeft().removeAll();
      this.down('#header').getRight().removeAll();
      this.down('#filterContainer').removeAll();
      this._preProcess();
    }
});
