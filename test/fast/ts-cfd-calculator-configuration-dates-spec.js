describe("When creatng a TS CFD Calculator and setting date values",function(){
    
    it ("should fail if end date is provided as string",function(){
        expect( function() { 
            Ext.create('Rally.TechnicalServices.CFDCalculator',{
                allowed_values: ['test'],
                group_by_field: 'Fred',
                value_type: 'count',
                startDate: "03/03/2014"
            });
        } ).toThrow(new Error("Failed to create Rally.TechnicalServices.CFDCalculator: startDate must be a javascript date or ISO date string"));
    });
    
    it ("should fail if start date is provided as string",function(){
        expect( function() { 
            Ext.create('Rally.TechnicalServices.CFDCalculator',{
                allowed_values: ['test'],
                group_by_field: 'Fred',
                value_type: 'count',
                endDate: "03/03/2014"
            });
        } ).toThrow(new Error("Failed to create Rally.TechnicalServices.CFDCalculator: endDate must be a javascript date or ISO date string"));
    });
    
    it ("should accept start date as iso string",function(){
        
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            allowed_values: ['test'],
            group_by_field: 'Fred',
            value_type: 'count',
            endDate: '2014-05-03T00:00:00Z'
        });
        
        expect(calculator.endDate).toEqual("2014-05-03");
    });
    
    it ("should accept start date as iso string with time",function(){
        
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            allowed_values: ['test'],
            group_by_field: 'Fred',
            value_type: 'count',
            endDate: '2014-05-03T00:00:00-08:00'
        });
        
        expect(calculator.endDate).toEqual("2014-05-03");
    });
    
    it ("should convert end date into iso string",function(){
        var end_date = new Date(2014,04,03);
        
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            allowed_values: ['test'],
            group_by_field: 'Fred',
            value_type: 'count',
            endDate: end_date
        });
        
        expect(calculator.endDate).toEqual("2014-05-03");
    });
        
    it ("should convert start date into iso string",function(){
        var start_date = new Date(2014,04,03);
        
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            allowed_values: ['test'],
            group_by_field: 'Fred',
            value_type: 'count',
            startDate: start_date
        });
        
        expect(calculator.startDate).toEqual("2014-05-03");
    });
    
    it ("should switch dates if they're out of order",function(){
        var start_date = new Date(2014,04,03);
        var end_date = new Date(2014,02,03);
        
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            allowed_values: ['test'],
            group_by_field: 'Fred',
            value_type: 'count',
            startDate: start_date,
            endDate: end_date
        });
        
        expect(calculator.startDate).toEqual("2014-03-03");
        expect(calculator.endDate).toEqual("2014-05-03");
    });
    
    it ("should not switch dates if they're not out of order",function(){
        var end_date = new Date(2014,04,03);
        var start_date = new Date(2014,02,03);
        
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            allowed_values: ['test'],
            group_by_field: 'Fred',
            value_type: 'count',
            startDate: start_date,
            endDate: end_date
        });
        
        expect(calculator.startDate).toEqual("2014-03-03");
        expect(calculator.endDate).toEqual("2014-05-03");
    });
    
    it ("should change empty string date to null",function(){
        var end_date = new Date(2014,04,03);
        var start_date = new Date(2014,02,03);
        
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            allowed_values: ['test'],
            group_by_field: 'Fred',
            value_type: 'count',
            startDate: "",
            endDate: ""
        });
        
        expect(calculator.startDate).toEqual(null);
        expect(calculator.endDate).toEqual(null);
    });
    
});