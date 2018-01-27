Ext.define('StartDateField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.startdatefield',

    requires: [
        'Rally.ui.DateField'
    ],

    mixins: [
        'Ext.form.field.Field',
    ],

    layout: {
        type: 'hbox'
    },

    initComponent: function() {
        this.callParent(arguments);

        this.add([
            {
                xtype: 'radiogroup',
                name: 'startdate',
                itemId: 'startdategroup',
                columns: 3,
                vertical: false,
                listeners: {
                    change: this._onChange,
                    scope: this,
                },
                items: [
                    {
                        name: 'startdate',
                        itemId: 'timebox',
                        boxLabel: 'Timebox Start Date',
                        inputValue: 'timebox',
                        width: 150
                    },
                    {
                        name: 'startdate',
                        itemId: 'specificdate',
                        boxLabel: 'Specific Date',
                        inputValue: 'specificdate',
                    },
                    {
                        xtype: 'rallydatefield',
                        itemId: 'startdatefield',
                        plugins: [
                            'rallyfieldvalidationui'
                        ],
                        margin: '0 0 0 10px'
                    }
                ]
            }
        ]);

        this.initField();
        this._sync();
    },

    _onChange: function() {
        this._sync();
    },

    _sync: function() {
        this.down('#timebox').setDisabled(!this._hasTimeboxScope());
        this.down('#startdatefield').setDisabled(this.down('#startdategroup').getValue().startdate === 'timebox');
    },

    _hasTimeboxScope: function() {
        var timeboxScope = this.context.getTimeboxScope();
        return !!timeboxScope && timeboxScope.getType() !== 'milestone';
    },

    setValue: function (value) {
        var radioValue = (this._hasTimeboxScope() && (value === 'timebox' || !value)) ? 'timebox' : 'specificdate';
        this.down('#startdategroup').setValue({ startdate: radioValue });
        var isSpecificDate = radioValue === 'specificdate';
        if (isSpecificDate && value) {
            this.down('#startdatefield').setValue(Rally.util.DateTime.fromIsoString(value));
        }
        return this;
    },

    getValue: function () {
        var radioValue = this.down('#startdategroup').getValue().startdate;
        var value = radioValue === 'timebox' ? 'timebox' : Rally.util.DateTime.toIsoString(this.down('#startdatefield').getValue());
        return value;
    }
});