describe("When creatng a TS CFD Calculator and setting date values",function(){
    
    it ("should fail if end date is provided as string",function(){
        expect( function() { 
            Ext.create('Rally.TechnicalServices.CFDCalculator',{
                allowed_values: ['test'],
                group_by_field: 'Fred',
                group_type: 'count',
                StartDate: "03/03/2014"
            });
        } ).toThrow(new Error("Failed to create Rally.TechnicalServices.CFDCalculator: StartDate must be a javascript date"));
    });
    
    it ("should fail if start date is provided as string",function(){
        expect( function() { 
            Ext.create('Rally.TechnicalServices.CFDCalculator',{
                allowed_values: ['test'],
                group_by_field: 'Fred',
                group_type: 'count',
                EndDate: "03/03/2014"
            });
        } ).toThrow(new Error("Failed to create Rally.TechnicalServices.CFDCalculator: EndDate must be a javascript date"));
    });
    
    it ("should convert date into iso string",function(){
        var end_date = new Date(2014,04,03);
        
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            allowed_values: ['test'],
            group_by_field: 'Fred',
            group_type: 'count',
            EndDate: end_date
        });
        
        expect(calculator.EndDate).toEqual("2014-05-03");
    });
        
    it ("should convert start date into iso string",function(){
        var start_date = new Date(2014,04,03);
        
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            allowed_values: ['test'],
            group_by_field: 'Fred',
            group_type: 'count',
            StartDate: start_date
        });
        
        expect(calculator.StartDate).toEqual("2014-05-03");
    });
    
    it ("should switch dates if they're out of order",function(){
        var start_date = new Date(2014,04,03);
        var end_date = new Date(2014,02,03);
        
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            allowed_values: ['test'],
            group_by_field: 'Fred',
            group_type: 'count',
            StartDate: start_date,
            EndDate: end_date
        });
        
        expect(calculator.StartDate).toEqual("2014-03-03");
        expect(calculator.EndDate).toEqual("2014-05-03");
    });
    
    it ("should not switch dates if they're not out of order",function(){
        var end_date = new Date(2014,04,03);
        var start_date = new Date(2014,02,03);
        
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            allowed_values: ['test'],
            group_by_field: 'Fred',
            group_type: 'count',
            StartDate: start_date,
            EndDate: end_date
        });
        
        expect(calculator.StartDate).toEqual("2014-03-03");
        expect(calculator.EndDate).toEqual("2014-05-03");
    });
    
});