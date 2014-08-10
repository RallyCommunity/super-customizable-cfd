describe("When making a TS CFD Calculator with various group-by fields",function(){
    
        
    beforeEach(function() {
        this.addMatchers(customMatchers);
    });
    
    it("should make two serieses with when given a group-by field that has a false value",function(){
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            allowed_values: [true,false],
            value_type: 'count',
            group_by_field: 'Blocked'
        });
        
        var snap1 = { 
            ObjectID:5, 
            PlanEstimate: 5, 
            Blocked: true,
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var snap2 = { 
            ObjectID:5, 
            PlanEstimate: 7, 
            Blocked:false,
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var results = calculator.runCalculation([snap1,snap2]);
        expect(results.series.length).toEqual(2);

        expect(results.series).toContainHashWithName("True");
        expect(results.series).toContainHashWithName("False");
        
        expect(results.series).toContainHashValues({ name:"True", data: [1] });
        expect(results.series).toContainHashValues({ name:"False", data: [1] });
        
        expect(results.categories).toEqual(['2013-08-05']);
        
    });
    
    it("should make two serieses with when given a group-by field that has an empty string value",function(){
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            allowed_values: ["","Widgets"],
            value_type: 'count',
            group_by_field: 'Category'
        });
        
        var snap1 = { 
            ObjectID:5, 
            PlanEstimate: 5, 
            Category: null,
            _ValidFrom:"2013-08-05T15:46:06.588Z",
            _ValidTo:"2014-08-05T15:46:23.365Z"
        };
        
        var snap2 = { 
            ObjectID:5, 
            PlanEstimate: 7, 
            Category:"",
            _ValidFrom:"2013-08-05T15:55:06.588Z",
            _ValidTo:"2014-08-05T15:55:23.365Z"
        };
        
        var snap3 = { 
            ObjectID:5, 
            PlanEstimate: 5, 
            Category: "Widgets",
            _ValidFrom:"2013-08-05T15:55:06.588Z",
            _ValidTo:"2014-08-05T15:55:23.365Z"
        };
        var results = calculator.runCalculation([snap1,snap2,snap3]);
        expect(results.series.length).toEqual(2);

        expect(results.series).toContainHashWithName("None");
        expect(results.series).toContainHashWithName("Widgets");
        
        expect(results.series).toContainHashValues({ name:"None", data: [2] });
        expect(results.series).toContainHashValues({ name:"Widgets", data: [1] });
        
        expect(results.categories).toEqual(['2013-08-05']);
        
    });
    
});