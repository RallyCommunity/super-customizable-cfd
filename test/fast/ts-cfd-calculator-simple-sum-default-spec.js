describe("When making a TS CFD Calculator",function(){
    
    beforeEach(function() {
        this.addMatchers(customMatchers);
    });
    
    it("should make one series with one x-axis value when given a single snapshot",function(){
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            group_by_field: 'ScheduleState',
            allowed_values: ['Completed'],
            value_field: 'PlanEstimate'
        });
        
        var snap = { 
            ObjectID:5, 
            PlanEstimate: 5, 
            ScheduleState:'Completed',
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var results = calculator.runCalculation([snap]);

        expect(results.series).toContainHashWithName('Completed');
        expect(results.series).toContainHashValues({ name:'Completed', data: [5] });
        expect(results.categories).toEqual(['2013-08-05']);
    });
    
    it("should make two serieses with one x-axis value when given a two snapshot on same day",function(){
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            group_by_field: 'ScheduleState',
            allowed_values: ['Completed','Accepted'],
            value_field: 'PlanEstimate'
        });
        
        var snap1 = { 
            ObjectID:5, 
            PlanEstimate: 5, 
            ScheduleState:'Completed',
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var snap2 = { 
            ObjectID:5, 
            PlanEstimate: 7, 
            ScheduleState:'Accepted',
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var results = calculator.runCalculation([snap1,snap2]);

        expect(results.series).toContainHashWithName('Completed');
        expect(results.series).toContainHashWithName('Accepted');
        expect(results.series).toContainHashValues({ name:'Completed', data: [5] });
        expect(results.series).toContainHashValues({ name:'Accepted', data: [7] });
        expect(results.categories).toEqual(['2013-08-05']);
    });
            
    it("should ignore a snapshot with a groupby value that is not in the configured set",function(){
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            group_by_field: 'ScheduleState',
            allowed_values: ['Completed','Accepted'],
            value_field: 'PlanEstimate'
        });
        
        var snap1 = { 
            PlanEstimate: 5, 
            ScheduleState:'Completed',
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var snap2 = { 
            PlanEstimate: 7, 
            ScheduleState:'Accepted',
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var snap_to_be_ignored = { 
            PlanEstimate: 3, 
            ScheduleState:'Defined',
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var results = calculator.runCalculation([snap1,snap2,snap_to_be_ignored]);

        expect(results.series).toContainHashWithName('Completed');
        expect(results.series).toContainHashWithName('Accepted');
        expect(results.series).not.toContainHashWithName('Defined');
        
        expect(results.series).toContainHashValues({ name:'Completed', data: [5] });
        expect(results.series).toContainHashValues({ name:'Accepted', data: [7] });
        expect(results.categories).toEqual(['2013-08-05']);
    });
    
    it("should ignore a snapshot with a valid groupby value if not valid on same day",function(){
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            group_by_field: 'ScheduleState',
            allowed_values: ['Completed','Accepted'],
            value_field: 'PlanEstimate'
        });
        
        var snap1 = { 
            PlanEstimate: 5, 
            ScheduleState:'Completed',
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var snap2 = { 
            PlanEstimate: 7, 
            ScheduleState:'Accepted',
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var snap_to_be_ignored = { 
            PlanEstimate: 3, 
            ScheduleState:'Accepted',
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2013-08-05T15:50:23.365Z"  // means somethine else superceded it before the end of the day
        };
        
       var results = calculator.runCalculation([snap1,snap2,snap_to_be_ignored]);

        expect(results.series).toContainHashWithName('Completed');
        expect(results.series).toContainHashWithName('Accepted');
        
        expect(results.series).toContainHashValues({ name:'Completed', data: [5] });
        expect(results.series).toContainHashValues({ name:'Accepted', data: [7] });
        expect(results.categories).toEqual(['2013-08-05']);
    });
    
});