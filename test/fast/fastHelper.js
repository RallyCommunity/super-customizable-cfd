var useObjectID = function(value,record) {
    if ( record.get('ObjectID') ) {
        return record.get('ObjectID');
    } 
    return 0;
};

var shiftDayBeginningToEnd = function(day) {
    return Rally.util.DateTime.add(Rally.util.DateTime.add(Rally.util.DateTime.add(day,'hour',23), 'minute',59),'second',59);
};

var customMatchers = {
    toContainHashWithName: function(expected_key) {
        var is_array = this.actual instanceof Array;
        
        var has_named_hash = false;
        Ext.Array.each( this.actual, function(actual_value) {
            if (actual_value.name == expected_key) {
                has_named_hash = true;
            }
        });
        
        this.message = function() {
            if ( !is_array ) {
                return "Expected " + Ext.JSON.encode(this.actual) + " to be an array";
            }
            return "Expected " + Ext.JSON.encode(this.actual) + " to have a hash with a key of " + expected_key;
        }
        return is_array && has_named_hash;
    },
    toContainHashValues: function(expected_partial_hash) {
        var is_array = this.actual instanceof Array;
        
        var has_values = false;
        
        var expected_keys = Ext.Object.getKeys(expected_partial_hash);
        if ( expected_keys.length > 0 ) {
            
            var expected_key = expected_keys[0];
            var expected_value = expected_partial_hash[expected_key];
            
            Ext.Array.each( this.actual, function(actual_value) {
                if (actual_value[expected_key] == expected_value) {
                    // we have a match on the first one
                    has_values = true;
                    Ext.Array.each(expected_keys, function(key_to_check){
                        var value_to_check = expected_partial_hash[key_to_check];
                        if ( Ext.JSON.encode(actual_value[key_to_check]) != Ext.JSON.encode(value_to_check) ) {
                            has_values = false;
                        }
                    });
                }
            });
        }
        
        this.message = function() {
            if ( !is_array ) {
                return "Expected " + Ext.JSON.encode(this.actual) + " to be an array";
            }
            return "Expected " + Ext.JSON.encode(this.actual) + " to have a hash that partially matches " + Ext.JSON.encode(expected_partial_hash);
        }
        return is_array && has_values;
    }
};

Ext.define('mockStory',{
    extend: 'Ext.data.Model',
    fields: [
        {name:'ObjectID', type: 'int'},
        {name:'Name',type:'string'},
        {name:'PlanEstimate',type:'int'},
        {name:'id',type:'int',convert:useObjectID},
        {name:'ScheduleState',type:'string',defaultValue:'Defined'}
    ]
});

Ext.define('mockIteration',{
    extend: 'Ext.data.Model',
    fields: [
        {name:'ObjectID', type: 'int'},
        {name:'Name',type:'string'},
        {name:'StartDate',type:'auto'},
        {name:'EndDate',type:'auto'},
        {name:'id',type:'int',convert:useObjectID}
    ]
});

Ext.define('mockCFD',{
    extend: 'Ext.data.Model',
    fields: [
        {name:'CardCount',type:'int'},
        {name:'CardEstimateTotal',type:'int'},
        {name:'CardState',type:'string'},
        {name:'CardToDoTotal',type:'int'},
        {name:'CreationDate',type:'date'},
        {name:'ObjectID',type:'int'},
        {name:'TaskEstimateTotal',type:'int'}
    ]
});

Ext.define('mockSnap',{
    extend: 'Ext.data.Model',
    fields: [
        {name:'ObjectID',type:'int'},
        {name:'Project',type:'int'},
        {name:'ScheduleState',type:'string'},
        {name:'Blocked',type:'boolean'},
        {name:'c_Effort',type:'float'},
        {name:'c_Category',type:'string'},
        {name:'_ValidFrom', type:'string', defaultValue:"2013-08-05T15:46:06.588Z"},
        {name:'_ValidTo', type:'string', defaultValue:"2013-08-05T15:46:23.365Z"}
    ]
});