describe("When making a TS CFD Calculator with a set of OIDs to limit",function(){
    
    beforeEach(function() {
        this.addMatchers(customMatchers);
    });
 
    it("should make not count items with object ID not in allowed list",function(){
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            group_by_field: 'ScheduleState',
            allowed_values: ['Completed','Accepted'],
            value_field: 'PlanEstimate',
            allowed_oids: [1]
        });
        
        var snap1 = { 
            ObjectID:1, 
            PlanEstimate: 5, 
            ScheduleState:'Completed',
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var snap2 = { 
            ObjectID:5, 
            PlanEstimate: 7, 
            ScheduleState:'Accepted',
            _ValidFrom:"2013-08-05T15:47:06.588Z",
            _ValidTo:"2014-08-05T15:47:23.365Z"
        };
        
        var results = calculator.runCalculation([snap1,snap2]);

        expect(results.series).toContainHashWithName('Completed');
        expect(results.series).toContainHashWithName('Accepted');
        expect(results.series).toContainHashValues({ name:'Completed', data: [5] });
        expect(results.series).toContainHashValues({ name:'Accepted', data: [0] });
        expect(results.categories).toEqual(['2013-08-05']);
    });
    
    it("should make not count items with object ID not in allowed list when list has multiple items",function(){
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            group_by_field: 'ScheduleState',
            allowed_values: ['Completed','Accepted'],
            value_field: 'PlanEstimate',
            allowed_oids: [1,2]
        });
        
        var snap1 = { 
            ObjectID:1, 
            PlanEstimate: 5, 
            ScheduleState:'Accepted',
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var snap2 = { 
            ObjectID:2, 
            PlanEstimate: 8, 
            ScheduleState:'Accepted',
            _ValidFrom:"2013-08-05T15:47:06.588Z",
            _ValidTo:"2014-08-05T15:47:23.365Z"
        };
        
        var snap3 = { 
            ObjectID:3, 
            PlanEstimate: 14, 
            ScheduleState:'Accepted',
            _ValidFrom:"2013-08-05T15:47:06.588Z",
            _ValidTo:"2014-08-05T15:47:23.365Z"
        };
        
        var results = calculator.runCalculation([snap1,snap2,snap3]);

        expect(results.series).toContainHashWithName('Completed');
        expect(results.series).toContainHashWithName('Accepted');
        expect(results.series).toContainHashValues({ name:'Completed', data: [0] });
        expect(results.series).toContainHashValues({ name:'Accepted', data: [13] });
        expect(results.categories).toEqual(['2013-08-05']);
    });
    
    it("should not count anything if allowed_oids is an empty array",function(){
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            group_by_field: 'ScheduleState',
            allowed_values: ['Completed','Accepted'],
            value_field: 'PlanEstimate',
            allowed_oids: []
        });
        
        var snap1 = { 
            ObjectID:1, 
            PlanEstimate: 5, 
            ScheduleState:'Accepted',
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var snap2 = { 
            ObjectID:2, 
            PlanEstimate: 8, 
            ScheduleState:'Accepted',
            _ValidFrom:"2013-08-05T15:47:06.588Z",
            _ValidTo:"2014-08-05T15:47:23.365Z"
        };
        
        var snap3 = { 
            ObjectID:3, 
            PlanEstimate: 14, 
            ScheduleState:'Accepted',
            _ValidFrom:"2013-08-05T15:47:06.588Z",
            _ValidTo:"2014-08-05T15:47:23.365Z"
        };
        
        var results = calculator.runCalculation([snap1,snap2,snap3]);

        expect(results.series).toContainHashWithName('Completed');
        expect(results.series).toContainHashWithName('Accepted');
        expect(results.series).toContainHashValues({ name:'Completed', data: [] });
        expect(results.series).toContainHashValues({ name:'Accepted', data: [] });
        expect(results.categories).toEqual([]);
    });
    
    it("should count everything if allowed_oids is null",function(){
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            group_by_field: 'ScheduleState',
            allowed_values: ['Completed','Accepted'],
            value_field: 'PlanEstimate',
            allowed_oids: null
        });
        
        var snap1 = { 
            ObjectID:1, 
            PlanEstimate: 5, 
            ScheduleState:'Accepted',
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var snap2 = { 
            ObjectID:2, 
            PlanEstimate: 8, 
            ScheduleState:'Accepted',
            _ValidFrom:"2013-08-05T15:47:06.588Z",
            _ValidTo:"2014-08-05T15:47:23.365Z"
        };
        
        var snap3 = { 
            ObjectID:3, 
            PlanEstimate: 14, 
            ScheduleState:'Accepted',
            _ValidFrom:"2013-08-05T15:47:06.588Z",
            _ValidTo:"2014-08-05T15:47:23.365Z"
        };
        
        var results = calculator.runCalculation([snap1,snap2,snap3]);

        expect(results.series).toContainHashWithName('Completed');
        expect(results.series).toContainHashWithName('Accepted');
        expect(results.series).toContainHashValues({ name:'Completed', data: [0] });
        expect(results.series).toContainHashValues({ name:'Accepted', data: [27] });
        expect(results.categories).toEqual(['2013-08-05']);
    });
});