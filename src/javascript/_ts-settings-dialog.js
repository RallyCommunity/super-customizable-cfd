Ext.define('Rally.technicalservices.SettingsDialog',{
    extend: 'Rally.ui.dialog.Dialog',
    alias: 'widget.tssettingsdialog',
    config: {
        title: 'Settings',
        model_type: 'HierarchicalRequirement',
        group_by_field_name: 'Schedulestate'
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
        }
        return config;
    },
    _addChoosers: function() {
        var me = this;
        this._addModelChooser();
        this._addGroupChooser();
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
            value: me.model_type,
            listeners: {
                scope: this,
                change: function(cb,new_value){
                    this.model_type = new_value;
                    this.group_by_field_name = null;
                    this._addGroupChooser();
                }
            }
        });
    },
    _addGroupChooser: function() {
        var me = this;
        
        this.down('#group_field_selector_box').removeAll();
        this.down('#group_field_selector_box').add({
            xtype:'rallyfieldcombobox',
            itemId: 'group_field_chooser',
            model: me.model_type,
            value: me.group_by_field_name
        });
    }
    
});