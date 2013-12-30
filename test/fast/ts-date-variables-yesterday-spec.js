describe("When working with query strings and providing the yesterday keyword",function(){
    var today_at_midnight = new Date(Ext.clone(new Date()).setHours(0,0,0,0));
    var tomorrow_at_midnight = Rally.util.DateTime.add(today_at_midnight,"day",1);
    var yesterday_at_midnight = Rally.util.DateTime.add(today_at_midnight,"day",-1);
    
    var today_at_midnight_iso = Rally.util.DateTime.toIsoString(today_at_midnight).replace(/T.*$/,"");
    var tomorrow_at_midnight_iso = Rally.util.DateTime.toIsoString(tomorrow_at_midnight).replace(/T.*$/,"");
    var yesterday_at_midnight_iso = Rally.util.DateTime.toIsoString(yesterday_at_midnight).replace(/T.*$/,"");
        
    it("should replace 'yesterday' with beginning of day when operator is <",function(){
        var query_string = "( Iteration.StartDate < yesterday )";
       
        var clean_string = '(Iteration.StartDate < "' + yesterday_at_midnight_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
   
    it("should replace 'yesterday' with beginning of day when operator is < in multiple nodes",function(){
        var query_string = '(((Iteration.StartDate < "yesterday") AND (Iteration.StartDate < "today")) AND (Iteration.StartDate < "fred"))';
       
        var clean_string = '(((Iteration.StartDate < "' + yesterday_at_midnight_iso + '") AND (Iteration.StartDate < "' + today_at_midnight_iso + '")) AND (Iteration.StartDate < "fred"))';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
        
    it("should replace 'yesterday' with end of day when operator is >",function(){
        var query_string = '( Iteration.StartDate > "yesterday" )';
       
        var clean_string = '(Iteration.StartDate > "' + yesterday_at_midnight_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });

    it("should replace 'yesterday' with end of day when operator is <= ",function(){
        var query_string = '( Iteration.StartDate <= "yesterday" )';
       
        var clean_string = '(Iteration.StartDate <= "' + today_at_midnight_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
        
    it("should replace 'yesterday' with beginning of day when operator is >= ",function(){
        var query_string = '( Iteration.StartDate >= "yesterday" )';
       
        var clean_string = '(Iteration.StartDate >= "' + yesterday_at_midnight_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
    
    it("should replace 'yesterday' with a range when operator is =",function(){
        var query_string = '( Iteration.StartDate = "yesterday" )';
       
        var clean_string = '((Iteration.StartDate > "' + yesterday_at_midnight_iso + '") AND (Iteration.StartDate < "' + today_at_midnight_iso + '"))';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
        
    it("should replace 'yesterday' in a series with a range when operator is =",function(){
        var query_string = '((Iteration.StartDate = "yesterday") AND (Name contains "fred"))';
       
        var clean_string = '(((Iteration.StartDate > "' + yesterday_at_midnight_iso + '")' +
                ' AND (Iteration.StartDate < "' + today_at_midnight_iso + '"))' +
                ' AND (Name CONTAINS "fred"))';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
});