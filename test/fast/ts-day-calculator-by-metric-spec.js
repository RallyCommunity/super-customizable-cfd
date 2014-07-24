describe("When making a TSDay model using a metric other than count",function(){
    it("should define default values",function(){
        var day = Ext.create('TSDay',{});
        
        expect(day.get('metricFieldName')).toEqual('Count');
    });
    
    it("should accept value settings",function(){
        var today = new Date();
        
        var day = Ext.create('TSDay',{
            groupByFieldName:'John',
            metricFieldName:'c_Effort',
            Total: 25,
            JSDate: today
        });
        
        expect(day.get('metricFieldName')).toEqual('c_Effort');
        expect(day.get('Total')).toEqual(25);
        expect(day.get('JSDate')).toEqual(today);
    });
    
    it("should add a snapshot",function(){
        var day = Ext.create('TSDay',{
            groupByFieldName:'ScheduleState',
            metricFieldName:'c_Effort'
        });
        
        var snap = Ext.create('mockSnap',{ ObjectID:5, Project: 5, ScheduleState:'Completed', c_Effort: 5.1 });
        
        day.addSnap(snap);
        
        expect(day.get('Total')).toEqual(5.1);
        expect(day.getGroupTotal('Completed')).toEqual(5.1);
        expect(day.getGroupTotal('Defined')).toEqual(0);
    });
    
    it("should add several snapshots",function(){
        var day = Ext.create('TSDay',{
            groupByFieldName:'ScheduleState',
            metricFieldName:'c_Effort'
        });
        
        var snap1 = Ext.create('mockSnap',{ ObjectID:5, Project: 5, ScheduleState:'Completed', c_Effort: 5 });
        var snap2 = Ext.create('mockSnap',{ ObjectID:6, Project: 5, ScheduleState:'Completed', c_Effort: 5 });
        var snap3 = Ext.create('mockSnap',{ ObjectID:7, Project: 5, ScheduleState:'Defined', c_Effort: 5 });
        
        day.addSnap(snap1);
        day.addSnap(snap2);
        day.addSnap(snap3);

        expect(day.get('Total')).toEqual(15);
        expect(day.getGroupTotal('Completed')).toEqual(10);
        expect(day.getGroupTotal('Defined')).toEqual(5);
    });
    
    it("should add snapshots with missing values",function(){
        var day = Ext.create('TSDay',{
            groupByFieldName:'Blocked',
            metricFieldName:'c_Effort'
        });
        
        var snap1 = Ext.create('mockSnap',{ ObjectID:5, Project: 5, Blocked:true, c_Effort: 5 });
        var snap2 = Ext.create('mockSnap',{ ObjectID:6, Project: 5, Blocked:true , c_Effort: ""});
        var snap3 = Ext.create('mockSnap',{ ObjectID:7, Project: 5, Blocked:false });
        
        day.addSnap(snap1);
        day.addSnap(snap2);
        day.addSnap(snap3);

        expect(day.get('Total')).toEqual(5);
        expect(day.getGroupTotal('true')).toEqual(5);
        expect(day.getGroupTotal('false')).toEqual(0);
    });
    
    it("should convert snapshots with missing group value to None",function(){
        var day = Ext.create('TSDay',{
            groupByFieldName:'c_Category',
            metricFieldName:'c_Effort'
        });
        
        var snap1 = Ext.create('mockSnap',{ ObjectID:5, Project: 5, c_Effort: 5, c_Category: "Fred" });
        var snap2 = Ext.create('mockSnap',{ ObjectID:6, Project: 5, c_Effort: 5, c_Category: ""});
        var snap3 = Ext.create('mockSnap',{ ObjectID:7, Project: 5, c_Effort: 5, c_Category: null });
        
        day.addSnap(snap1);
        day.addSnap(snap2);
        day.addSnap(snap3);

        expect(day.get('Total')).toEqual(15);
        expect(day.getGroupTotal('Fred')).toEqual(5);
        expect(day.getGroupTotal('None')).toEqual(10);
    });
    
});