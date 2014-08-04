describe("When creatng a TS CFD Calculator",function(){
    
    it("should fail if no allowed_values found",function(){
        expect( function() { 
            Ext.create('Rally.TechnicalServices.CFDCalculator',{
                group_by_field: 'Fred',
                value_type: 'sum',
                value_field: 'Sam'
            });
        } ).toThrow(new Error("Cannot create Rally.TechnicalServices.CFDCalculator without allowed_values"));
    });
    
    it("should fail if no group_by_field found",function(){
        expect( function() { 
            Ext.create('Rally.TechnicalServices.CFDCalculator',{
                allowed_values: ['test'],
                value_type: 'count'
            });
        } ).toThrow(new Error("Cannot create Rally.TechnicalServices.CFDCalculator without group_by_field"));
    });
    
    it("should not fail if no value_field if group_by is count",function(){
        expect( function() { 
            Ext.create('Rally.TechnicalServices.CFDCalculator',{
                allowed_values: ['test'],
                group_by_field: 'Fred',
                value_type: 'count'
            });
        } ).not.toThrow();
    });
    
    it("should fail if no value_field if group_by is sum",function(){
        expect( function() { 
            Ext.create('Rally.TechnicalServices.CFDCalculator',{
                allowed_values: ['test'],
                group_by_field: 'Fred',
                value_type: 'sum'
            });
        } ).toThrow(new Error("Cannot create Rally.TechnicalServices.CFDCalculator by sum without value_field"));
    });
   
});