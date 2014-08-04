Ext.override(Rally.app.AppSettings,{
    
    
    /*
     * Change so that values returned are not just strings
     */
    _saveAppGlobalScopedSettings: function() {
        var globalAppSettings = this.getAppScopedSettingsForm().getValues(false,false,false,true);

        Ext.apply(this.settings, globalAppSettings);

        return Rally.data.PreferenceManager.update({
            appID: this.getContext() && this.getContext().get('appID'),
            settings: globalAppSettings,
            project: null,
            workspace: null,
            scope: this
        });
    }
});