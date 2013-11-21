var useObjectID = function(value,record) {
    if ( record.get('ObjectID') ) {
        return record.get('ObjectID');
    } 
    return 0;
};

var shiftDayBeginningToEnd = function(day) {
    return Rally.util.DateTime.add(Rally.util.DateTime.add(Rally.util.DateTime.add(day,'hour',23), 'minute',59),'second',59);
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
        {name:'c_Effort',type:'float'}
    ]
});