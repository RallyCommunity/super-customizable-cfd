describe("When creatng a TS CFD Calculator",function(){
    
    it("should fail if no allowed_values found",function(){
        expect( function() { 
            Ext.create('Rally.TechnicalServices.CFDCalculator',{});
        } ).toThrow(new Error("Cannot create Rally.TechnicalServices.CFDCalculator without allowed_values"));
        
       
    });
});