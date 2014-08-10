
Ext.override(Rally.ui.DateField,{
    getSubmitValue: function() {
        return Rally.util.DateTime.toIsoString(this.getValue());
    },
    rawToValue: function(rawValue) {
        console.log('raw value',rawValue);

        var iso_string = null;
        if ( rawValue && typeof rawValue == 'object' ) {
            iso_string = Rally.util.DateTime.fromIsoString(rawValue);
            if ( /NaN/.test(iso_string) ) { 
                iso_string = null;
            }
        }
        
        if ( rawValue && typeof rawValue == 'string' ) {
            // test that it has dashes
            if ( ! /-/.test(rawValue) ) {
                iso_string = null;
            }
        }

        return iso_string;
    }
});

