//Ext.override(Rally.app.AppSettings,{
//    _saveAppGlobalScopedSettings: function() {
//        var globalAppSettings = this.getAppScopedSettingsForm().getValues(false,false,false,true);
//        Ext.apply(this.settings, globalAppSettings);
//
//        return Rally.data.PreferenceManager.update({
//            appID: this.getContext() && this.getContext().get('appID'),
//            settings: globalAppSettings,
//            project: null,
//            workspace: null,
//            scope: this
//        });
//    }
//});


Ext.override(Rally.ui.DateField,{
    getSubmitValue: function() {
        //console.log('getting submit value', this.getValue());
        return Rally.util.DateTime.toIsoString(this.getValue());
    },
    valueToRaw: function(value) {
        //console.log('valueToRaw',value);

        if ( Ext.isDate(value) ) {
            value = Rally.util.DateTime.toIsoString(value).replace(/T.*$/,"");
        }
        return value;
    },
    rawToValue: function(rawValue) {
        //console.log('raw value',rawValue);
        var value = rawValue;
        
        if ( rawValue && typeof rawValue == 'string' ) {
            // test that it has dashes
            if ( /-/.test(rawValue) ) {
                value = Rally.util.DateTime.fromIsoString(rawValue);
            }
        }

        return value;
    }
});

