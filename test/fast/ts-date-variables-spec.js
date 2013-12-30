describe("When working with query strings",function(){
    var today_at_midnight = new Date(Ext.clone(new Date()).setHours(0,0,0,0));
    var today_at_midnight_iso = Rally.util.DateTime.toIsoString(today_at_midnight).replace(/T.*$/,"");
        
    it("should replace 'today' with the date when operator is <",function(){
        var query_string = "( Iteration.StartDate < today )";
       
        var clean_string = '(Iteration.StartDate < "' + today_at_midnight_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
    
    it("should replace 'today' with the date when operator is < and today is in quotes",function(){
        var query_string = '( Iteration.StartDate < "today" )';
       
        var clean_string = '(Iteration.StartDate < "' + today_at_midnight_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
    
    it("should replace 'today' with the date when operator is < in multiple nodes",function(){
        var query_string = '(((Iteration.StartDate < "today") AND (Iteration.StartDate < "today")) AND (Iteration.StartDate < "fred"))';
       
        var clean_string = '(((Iteration.StartDate < "' + today_at_midnight_iso + '") AND (Iteration.StartDate < "' + today_at_midnight_iso + '")) AND (Iteration.StartDate < "fred"))';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
    
    
});