describe("When making a TSDay model",function(){
    it("should define default values",function(){
        var day = Ext.create('TSDay',{});
        
        expect(day.get('groupByFieldName')).toEqual('ScheduleState');
        expect(day.get('Total')).toEqual(0);
        expect(day.get('JSDate')).not.toBe(null);
    });
    
    it("should accept value settings",function(){
        var today = new Date();
        
        var day = Ext.create('TSDay',{
            groupByFieldName:'John',
            Total: 25,
            JSDate: today
        });
        
        expect(day.get('groupByFieldName')).toEqual('John');
        expect(day.get('Total')).toEqual(25);
        expect(day.get('JSDate')).toEqual(today);
    });
    
    it("should add a snapshot",function(){
        var day = Ext.create('TSDay',{
            groupByFieldName:'ScheduleState'
        });
        
        var snap = Ext.create('mockSnap',{ ObjectID:5, Project: 5, ScheduleState:'Completed' });
        
        day.addSnap(snap);
        
        expect(day.get('Total')).toEqual(1);
        expect(day.getGroupTotal('Completed')).toEqual(1);
        expect(day.getGroupTotal('Defined')).toEqual(0);
    });
    
    it("should add several snapshots",function(){
        var day = Ext.create('TSDay',{
            groupByFieldName:'ScheduleState'
        });
        
        var snap1 = Ext.create('mockSnap',{ ObjectID:5, Project: 5, ScheduleState:'Completed' });
        var snap2 = Ext.create('mockSnap',{ ObjectID:6, Project: 5, ScheduleState:'Completed' });
        var snap3 = Ext.create('mockSnap',{ ObjectID:7, Project: 5, ScheduleState:'Defined' });
        
        day.addSnap(snap1);
        day.addSnap(snap2);
        day.addSnap(snap3);

        expect(day.get('Total')).toEqual(3);
        expect(day.getGroupTotal('Completed')).toEqual(2);
        expect(day.getGroupTotal('Defined')).toEqual(1);
    });
});