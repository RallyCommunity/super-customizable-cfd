describe("When creatng a TS CFD Calculator and setting value field name",function(){
    
    it ("should understand value field name",function(){
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            group_by_field: 'Fred',
            value_type: 'sum',
            value_field: 'Arnold',
            allowed_values: ['a']
        });
        
        expect(calculator.value_type).toEqual('sum');
        expect(calculator.value_field).toEqual('Arnold');
    });
    
    it ("should set value_type to count if value_field is 'Count'",function(){
        var calculator = Ext.create('Rally.TechnicalServices.CFDCalculator',{
            group_by_field: 'Fred',
            value_type: 'sum',
            value_field: 'Count'
        });
        
        expect(calculator.value_type).toEqual('count');
        expect(calculator.value_field).toEqual('Count');
    });
 
});