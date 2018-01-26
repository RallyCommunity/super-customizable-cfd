Ext.define('EndDateField', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.enddatefield',

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
                name: 'enddate',
                itemId: 'enddategroup',
                columns: 4,
                vertical: false,
                listeners: {
                    change: this._onChange,
                    scope: this,
                },
                items: [
                    {
                        name: 'enddate',
                        itemId: 'timebox',
                        boxLabel: 'Timebox End Date',
                        inputValue: 'timebox',
                        width: 150
                    },
                    {
                      name: 'enddate',
                      itemId: 'today',
                      boxLabel: 'Today',
                      inputValue: 'today',
                      width: 75
                    },
                    {
                        name: 'enddate',
                        itemId: 'specificdate',
                        boxLabel: 'Specific Date',
                        inputValue: 'specificdate',
                    },
                    {
                        xtype: 'rallydatefield',
                        itemId: 'enddatefield',
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
        var hasTimeboxScope = !!this.context.getTimeboxScope();
        this.down('#timebox').setDisabled(!hasTimeboxScope);
        var dateEnabled = this.down('#enddategroup').getValue().enddate === 'specificdate';
        this.down('#enddatefield').setDisabled(!dateEnabled);
    },

    setValue: function (value) {
        var hasTimeboxScope = !!this.context.getTimeboxScope();
        var radioValue = (hasTimeboxScope && (value === 'timebox' || !value)) ? 'timebox' : 
          (value === 'today' ? 'today' : 'specificdate');
        var isSpecificDate = radioValue === 'specificdate';
        this.down('#enddategroup').setValue({ enddate: radioValue });
        if (isSpecificDate && value) {
            this.down('#enddatefield').setValue(Rally.util.DateTime.fromIsoString(value));
        }
        return this;
    },

    getValue: function () {
        var radioValue = this.down('#enddategroup').getValue().enddate;
        var value = radioValue === 'specificdate' ? Rally.util.DateTime.toIsoString(this.down('#enddatefield').getValue()) : radioValue;
        return value;
    }
});