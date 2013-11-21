Ext.define('Rally.technicalservices.SettingsDialog',{
    extend: 'Rally.ui.dialog.Dialog',
    alias: 'widget.tssettingsdialog',
    config: {
        /* default settings. pass new ones in */
        title: 'Settings',
        model_type: 'HierarchicalRequirement',
        group_by_field_name: 'Schedulestate',
        metric: 'Count',
        start_date:Rally.util.DateTime.add(new Date(),"month",-1),
        end_date: Rally.util.DateTime.add(new Date(),"day",-1)
    },
    items: {
        xtype: 'panel',
        border: false,
        defaults: {
            padding: 5,
            margin: 5
        },
        items: [
            {
                xtype: 'container',
                itemId: 'model_selector_box'
            },
            {
                xtype:'container',
                itemId: 'group_field_selector_box'
            },
            {
                xtype:'container',
                itemId: 'metric_selector_box'
            },
            {
                xtype:'container',
                itemId:'start_date_selector_box'
            },
            {
                xtype:'container',
                itemId:'end_date_selector_box'
            }
        ]
    },
    constructor: function(config){
        this.mergeConfig(config);
        this.callParent([this.config]);
        
    },
    initComponent: function() {
        this.callParent(arguments);
        this.addEvents(
            /**
             * @event settingsChosen
             * Fires when user clicks done after making settings choices
             * @param {Rally.technicalservices.SettingsDialog} this
             * @param {hash} config settings
             */
            'settingsChosen',
            /**
             * @event cancelChosen
             * Fires when user clicks the cancel button
             */
            'cancelChosen'
        );
        this._buildButtons();
        this._addChoosers();
    },
    _buildButtons: function() {
        this.down('panel').addDocked({
            xtype: 'toolbar',
            dock: 'bottom',
            padding: '0 0 10 0',
            layout: {
                type: 'hbox',
                pack: 'center'
            },
            ui: 'footer',
            items: [
                {
                    xtype: 'rallybutton',
                    text: 'Run',
                    scope: this,
                    userAction: 'clicked done in dialog',
                    handler: function() {
                        this.fireEvent('settingsChosen', this, this._getConfig());
                        this.close();
                    }
                },
                {
                    xtype: 'rallybutton',
                    text: 'Cancel',
                    handler: function() {
                        this.fireEvent('cancelChosen');
                        this.close()
                    },
                    scope: this
                }
            ]
        });
    },
    _getConfig: function() {
        var config = {};
        if ( this.down('#model_chooser') ) {
            config.model_type = this.down('#model_chooser').getValue();
        }
        if ( this.down('#group_field_chooser') ) {
            config.group_by_field_name = this.down('#group_field_chooser').getValue();
            config.group_by_field_type = this.down('#group_field_chooser').getRecord().get('fieldDefinition').attributeDefinition.AttributeType;
        }
        if ( this.down('#metric_chooser') ) {
            config.metric = this.down('#metric_chooser').getValue();
        }
        
        if ( this.down('#start_date_chooser') ) {
            config.start_date = this.down('#start_date_chooser').getValue();
        }
        if ( this.down('#end_date_chooser') ) {
            config.end_date = this.down('#end_date_chooser').getValue();
        }
        return config;
    },
    _addChoosers: function() {
        var me = this;
        this._addModelChooser();
        this._addGroupChooser();
        this._addMetricChooser();
        this._addDateChoosers();
    },
    _addModelChooser: function() {
        var me = this;
        var type_store = Ext.create('Rally.data.custom.Store',{
            data: [
                {Name:'HierarchicalRequirement',Value:'HierarchicalRequirement'},
                {Name:'Defect',Value:'Defect'},
                {Name:'Task',Value:'Task'}
            ]
        });
        this.down('#model_selector_box').add({
            xtype:'rallycombobox',
            itemId: 'model_chooser',
            displayField: 'Name',
            valueField: 'Value',
            store: type_store,
            fieldLabel: 'Artifact Type',
            labelWidth: 75,
            value: me.model_type,
            listeners: {
                scope: this,
                change: function(cb,new_value){
                    this.model_type = new_value;
                    this.group_by_field_name = null;
                    this.metric = "Count";
                    this._addGroupChooser();
                    this._addMetricChooser();
                }
            }
        });
    },
    _addGroupChooser: function() {
        var me = this;
        
        this.down('#group_field_selector_box').removeAll();
        var cb = this.down('#group_field_selector_box').add({
            xtype:'rallyfieldcombobox',
            itemId: 'group_field_chooser',
            model: me.model_type,
            value: me.group_by_field_name,
            labelWidth: 75,
            fieldLabel: 'Group By'
        });
        var field_store = cb.getStore();
        field_store.on({
            'load': {
                fn: function(store,records) {
                    me._filterOutExceptChoices(store,records);
                    if ( me.group_by_field_name === null ) {
                        cb.setValue(store.getAt(0));
                    }
                },
             'scope': me
            }
        });

    },
    _addMetricChooser: function() {
        var me = this;
        
        this.down('#metric_selector_box').removeAll();
        var cb = this.down('#metric_selector_box').add({
            xtype:'rallyfieldcombobox',
            itemId: 'metric_chooser',
            model: me.model_type,
            value: me.metric,
            labelWidth: 75,
            fieldLabel: 'Measure'
        });
        var field_store = cb.getStore();
        field_store.on('load',this._filterOutExceptNumbers,this,true);
        field_store.on({
            'load':{
                fn: function() { 
                    field_store.add({name:'Count',value:'Count',fieldDefinition:{}});
                    cb.setValue(me.metric);
                },
                single: true
            }
        });
    },
    _addDateChoosers: function() {
        var me = this;
        this.down('#start_date_selector_box').add({
            xtype: 'rallydatefield',
            fieldLabel: 'Start Date',
            itemId: 'start_date_chooser',
            labelWidth: 75,
            value: me.start_date
        });
        
        this.down('#end_date_selector_box').add({
            xtype: 'rallydatefield',
            fieldLabel: 'End Date',
            itemId:'end_date_chooser',
            labelWidth: 75,
            value: me.end_date
        });
    },
    _filterOutExceptChoices: function(store,records) {
        store.filter([{
            filterFn:function(field){ 
                var attribute_type = field.get('fieldDefinition').attributeDefinition.AttributeType;
                if (  attribute_type == "BOOLEAN" ) {
                    return true;
                }
                if ( attribute_type == "STRING" || attribute_type == "STATE" ) {
                    if ( field.get('fieldDefinition').attributeDefinition.Constrained ) {
                        return true;
                    }
                }
                return false;
            } 
        }]);
    },
    _filterOutExceptNumbers: function(store,records) {
        store.filter([{
            filterFn:function(field){ 
                var attribute_type = field.get('fieldDefinition').attributeDefinition.AttributeType;
                if (  attribute_type == "QUANTITY" || attribute_type == "INTEGER" || attribute_type == "DECIMAL" ) {
                    return true;
                }
                if ( field.get('name') == 'Count' ) { return true; }
                return false;
            } 
        }]);
    }
    
});