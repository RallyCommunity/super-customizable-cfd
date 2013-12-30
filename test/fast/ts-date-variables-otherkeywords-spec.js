describe("When working with query strings and providing the other keywords",function(){
    var today_at_midnight = new Date(Ext.clone(new Date()).setHours(0,0,0,0));
    var tomorrow_at_midnight = Rally.util.DateTime.add(today_at_midnight,"day",1);
    var yesterday_at_midnight = Rally.util.DateTime.add(today_at_midnight,"day",-1);
    
    var today_at_midnight_iso = Rally.util.DateTime.toIsoString(today_at_midnight).replace(/T.*$/,"");
    var tomorrow_at_midnight_iso = Rally.util.DateTime.toIsoString(tomorrow_at_midnight).replace(/T.*$/,"");
    var yesterday_at_midnight_iso = Rally.util.DateTime.toIsoString(yesterday_at_midnight).replace(/T.*$/,"");
    
    // Last week is 7 days including all of today
    it("should replace 'LastWeek' with end of day when operator is <",function(){
        var query_string = "( Iteration.StartDate < lastweek )"; 
        var beginning_js = Rally.util.DateTime.add(tomorrow_at_midnight,"day",-7);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
        var clean_string = '(Iteration.StartDate < "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
   
    it("should replace 'LastWeek' with end of day when operator is >",function(){
        var query_string = '( Iteration.StartDate > "lastweek" )';
        var beginning_js = Rally.util.DateTime.add(tomorrow_at_midnight,"day",-7);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
       
        var clean_string = '(Iteration.StartDate > "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });

    it("should replace 'LastWeek' with a range when operator is =",function(){
        var query_string = '( Iteration.StartDate = "lastweek" )';
        var beginning_js = Rally.util.DateTime.add(tomorrow_at_midnight,"day",-7);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
         
        var clean_string = '((Iteration.StartDate > "' + beginning_iso + '") AND (Iteration.StartDate < "' + tomorrow_at_midnight_iso + '"))';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
    
    // Next week is 7 days including all of today
    it("should replace 'NextWeek' with end of day when operator is <",function(){
        var query_string = "( Iteration.StartDate < NextWeek )"; 
        var beginning_js = Rally.util.DateTime.add(today_at_midnight,"day",7);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
        var clean_string = '(Iteration.StartDate < "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
   
    it("should replace 'NextWeek' with end of day when operator is >",function(){
        var query_string = '( Iteration.StartDate > "NextWeek" )';
        var beginning_js = Rally.util.DateTime.add(today_at_midnight,"day",7);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
       
        var clean_string = '(Iteration.StartDate > "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });

    it("should replace 'NextWeek' with a range when operator is =",function(){
        var query_string = '( Iteration.StartDate = "NextWeek" )';
        var beginning_js = Rally.util.DateTime.add(today_at_midnight,"day",7);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
         
        var clean_string = '((Iteration.StartDate > "' + today_at_midnight_iso + '") AND (Iteration.StartDate < "' + beginning_iso + '"))';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
        
    // Last month is 30 days including all of today
    it("should replace 'LastMonth' with end of day when operator is <",function(){
        var query_string = "( Iteration.StartDate < LastMonth )"; 
        var beginning_js = Rally.util.DateTime.add(tomorrow_at_midnight,"day",-30);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
        var clean_string = '(Iteration.StartDate < "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
   
    it("should replace 'LastMonth' with end of day when operator is >",function(){
        var query_string = '( Iteration.StartDate > "LastMonth" )';
        var beginning_js = Rally.util.DateTime.add(tomorrow_at_midnight,"day",-30);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
       
        var clean_string = '(Iteration.StartDate > "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });

    it("should replace 'LastMonth' with a range when operator is =",function(){
        var query_string = '( Iteration.StartDate = "LastMonth" )';
        var beginning_js = Rally.util.DateTime.add(tomorrow_at_midnight,"day",-30);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
         
        var clean_string = '((Iteration.StartDate > "' + beginning_iso + '") AND (Iteration.StartDate < "' + tomorrow_at_midnight_iso + '"))';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
    
    // Next month is 30 days including all of today
    it("should replace 'NextMonth' with end of day when operator is <",function(){
        var query_string = "( Iteration.StartDate < NextMonth )"; 
        var beginning_js = Rally.util.DateTime.add(today_at_midnight,"day",30);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
        var clean_string = '(Iteration.StartDate < "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
   
    it("should replace 'NextMonth' with end of day when operator is >",function(){
        var query_string = '( Iteration.StartDate > "NextMonth" )';
        var beginning_js = Rally.util.DateTime.add(today_at_midnight,"day",30);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
       
        var clean_string = '(Iteration.StartDate > "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });

    it("should replace 'NextMonth' with a range when operator is =",function(){
        var query_string = '( Iteration.StartDate = "NextMonth" )';
        var beginning_js = Rally.util.DateTime.add(today_at_midnight,"day",30);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
         
        var clean_string = '((Iteration.StartDate > "' + today_at_midnight_iso + '") AND (Iteration.StartDate < "' + beginning_iso + '"))';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
            
    // Last quarter is 90 days including all of today
    it("should replace 'LastQuarter' with end of day when operator is <",function(){
        var query_string = "( Iteration.StartDate < LastQuarter )"; 
        var beginning_js = Rally.util.DateTime.add(tomorrow_at_midnight,"day",-90);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
        var clean_string = '(Iteration.StartDate < "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
   
    it("should replace 'LastQuarter' with end of day when operator is >",function(){
        var query_string = '( Iteration.StartDate > "LastQuarter" )';
        var beginning_js = Rally.util.DateTime.add(tomorrow_at_midnight,"day",-90);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
       
        var clean_string = '(Iteration.StartDate > "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });

    it("should replace 'LastQuarter' with a range when operator is =",function(){
        var query_string = '( Iteration.StartDate = "LastQuarter" )';
        var beginning_js = Rally.util.DateTime.add(tomorrow_at_midnight,"day",-90);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
         
        var clean_string = '((Iteration.StartDate > "' + beginning_iso + '") AND (Iteration.StartDate < "' + tomorrow_at_midnight_iso + '"))';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
    
    // Next quarter is 90 days including all of today
    it("should replace 'NextQuarter' with end of day when operator is <",function(){
        var query_string = "( Iteration.StartDate < NextQuarter )"; 
        var beginning_js = Rally.util.DateTime.add(today_at_midnight,"day",90);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
        var clean_string = '(Iteration.StartDate < "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
   
    it("should replace 'NextQuarter' with end of day when operator is >",function(){
        var query_string = '( Iteration.StartDate > "NextQuarter" )';
        var beginning_js = Rally.util.DateTime.add(today_at_midnight,"day",90);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
       
        var clean_string = '(Iteration.StartDate > "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });

    it("should replace 'NextQuarter' with a range when operator is =",function(){
        var query_string = '( Iteration.StartDate = "NextQuarter" )';
        var beginning_js = Rally.util.DateTime.add(today_at_midnight,"day",90);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
         
        var clean_string = '((Iteration.StartDate > "' + today_at_midnight_iso + '") AND (Iteration.StartDate < "' + beginning_iso + '"))';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
    
    // Last year is 365 days including all of today
    it("should replace 'LastYear' with end of day when operator is <",function(){
        var query_string = "( Iteration.StartDate < LastYear )"; 
        var beginning_js = Rally.util.DateTime.add(tomorrow_at_midnight,"day",-365);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
        var clean_string = '(Iteration.StartDate < "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
   
    it("should replace 'LastYear' with end of day when operator is >",function(){
        var query_string = '( Iteration.StartDate > "LastYear" )';
        var beginning_js = Rally.util.DateTime.add(tomorrow_at_midnight,"day",-365);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
       
        var clean_string = '(Iteration.StartDate > "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });

    it("should replace 'LastYear' with a range when operator is =",function(){
        var query_string = '( Iteration.StartDate = "LastYear" )';
        var beginning_js = Rally.util.DateTime.add(tomorrow_at_midnight,"day",-365);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
         
        var clean_string = '((Iteration.StartDate > "' + beginning_iso + '") AND (Iteration.StartDate < "' + tomorrow_at_midnight_iso + '"))';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
    
    // Next quarter is 90 days including all of today
    it("should replace 'NextYear' with end of day when operator is <",function(){
        var query_string = "( Iteration.StartDate < NextYear )"; 
        var beginning_js = Rally.util.DateTime.add(today_at_midnight,"day",365);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
        var clean_string = '(Iteration.StartDate < "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
   
    it("should replace 'NextYear' with end of day when operator is >",function(){
        var query_string = '( Iteration.StartDate > "NextYear" )';
        var beginning_js = Rally.util.DateTime.add(today_at_midnight,"day",365);
        var beginning_iso =  Rally.util.DateTime.toIsoString(beginning_js).replace(/T.*$/,"");
       
        var clean_string = '(Iteration.StartDate > "' + beginning_iso + '")';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });

    it("should replace 'NextYear' with a range when operator is =",function(){
        var query_string = '( Iteration.StartDate = "NextYear" )';
        var end_js = Rally.util.DateTime.add(today_at_midnight,"day",365);
        var end_iso =  Rally.util.DateTime.toIsoString(end_js).replace(/T.*$/,"");
         
        var clean_string = '((Iteration.StartDate > "' + today_at_midnight_iso + '") AND (Iteration.StartDate < "' + end_iso + '"))';
        var filter = Ext.create('TSStringFilter',{query_string:query_string});
        expect(filter.toString()).toEqual(clean_string);
    });
    
});