describe("Using the rally utilities",function() {
    var first_saturday_begin = new Date(2013,08,07,0,0,0);
    
    var first_sunday_end = new Date(2013,08,08,23,59,0);

    var first_monday_begin = new Date(2013,08,09,0,0,0);
    var first_monday_end = new Date(2013,08,09,23,59,0);
    var first_tuesday_begin = new Date(2013,08,10,0,0,0);
    var second_monday_begin = new Date(2013,08,16,0,0,0);
    var third_monday_begin = new Date(2013,08,23,0,0,0);
    
    var three_month_start_monday = new Date(2013,10,25,0,0,0);
    var three_month_end_monday = new Date(2014,0,27,0,0,0);
        
    describe("When counting time",function(){

        
        it('should count the number of days as zero on the same day',function() {
            
            // 8th Month is September because Jan is 0
            var date1 = first_monday_begin;
            var date2 = first_monday_end;
            
            expect( Rally.technicalservices.util.Utilities.daysBetween(date1,date2) ).toEqual(0);
        });
        
        it('should count the number of days as 1 on the different days',function() {
            
            var date1 = first_monday_end;
            var date2 = first_tuesday_begin;
            
            expect( Rally.technicalservices.util.Utilities.daysBetween(date1,date2) ).toEqual(1);
        });
        
        it('should count the number of days between two dates',function() {
            
            var date1 = first_monday_begin;
            var date2 = first_tuesday_begin;
            
            expect( Rally.technicalservices.util.Utilities.daysBetween(date1,date2) ).toEqual(1);
        });
        
        it('should not care if the days are supplied out of order',function() {
            
            var date1 = first_monday_begin;
            var date2 = first_tuesday_begin;
            
            expect( Rally.technicalservices.util.Utilities.daysBetween(date2,date1) ).toEqual(1);
        });
        
        it('should count weekends in date difference',function() {
            
            var date1 = first_monday_begin;
            var date2 = second_monday_begin;
            
            expect( Rally.technicalservices.util.Utilities.daysBetween(date1,date2,false) ).toEqual(7);
        });
        
        it('should not count weekends in date difference when flag set',function() {
            
            var date1 = first_monday_begin;
            var date2 = second_monday_begin;
            
            expect( Rally.technicalservices.util.Utilities.daysBetween(date1,date2,true) ).toEqual(5);
        });
        
        it('should not count weekends in date difference across two weekends when flag set',function() {
            
            var date1 = first_monday_begin;
            var date2 = third_monday_begin;
            
            expect( Rally.technicalservices.util.Utilities.daysBetween(date1,date2,true) ).toEqual(10);
        });  
        
        it('should return 0 when on a Saturday and not counting weekends in date difference',function() {
            
            var date1 = first_saturday_begin;
            var date2 = first_sunday_end;
            
            expect( Rally.technicalservices.util.Utilities.daysBetween(date1,date2,true) ).toEqual(0);
        });
    });
    describe("When getting an array of days",function(){
        it('should return an array of days without weekends', function(){
            var date1 = first_saturday_begin;
            var date2 = third_monday_begin;
            var array_of_days = Rally.technicalservices.util.Utilities.arrayOfDaysBetween(date1,date2,true);
            expect( array_of_days.length ).toEqual(11);
            expect( array_of_days[0] ).toEqual(first_monday_begin);
            expect( array_of_days[10] ).toEqual(third_monday_begin);
            
        });
        
        it('should return an array of days with weekends', function(){
            var date1 = first_saturday_begin;
            var date2 = third_monday_begin;
            var array_of_days = Rally.technicalservices.util.Utilities.arrayOfDaysBetween(date1,date2,false);
            
            expect( array_of_days.length ).toEqual(17);
            expect( array_of_days[0] ).toEqual(first_saturday_begin);
            expect( array_of_days[16] ).toEqual(third_monday_begin);
            
        });
        
        it('should return an array of days even if dates are in wrong order', function(){
            var date1 = first_saturday_begin;
            var date2 = third_monday_begin;
            
            var array_of_days = Rally.technicalservices.util.Utilities.arrayOfDaysBetween(date2,date1,true);
            expect( array_of_days.length ).toEqual(11);
            expect( array_of_days[0] ).toEqual(first_monday_begin);
            expect( array_of_days[10] ).toEqual(third_monday_begin);
            
        });
        
        it('should return an array of days spaced a week apart when there are more than 45 days',function(){
            var date1 = three_month_start_monday;
            var date2 = three_month_end_monday;
            
            var array_of_days = Rally.technicalservices.util.Utilities.arrayOfDaysBetween(date1,date2,true,40);
            
            expect( Rally.technicalservices.util.Utilities.daysBetween(date1,date2,true) ).toEqual(45);
            expect(array_of_days.length).toEqual(10);
            expect(array_of_days[0]).toEqual(date1);
            expect(array_of_days[9]).toEqual(date2);
            
        });
        
        it('should return an array of 30 minute increments when less than or equal to 2 days', function(){
            var date1 = new Date(2013,08,09,0,0,0);
            var date2 = new Date(2013,08,09,23,59,0);
            
            var expected_last_timestamp = new Date(2013,08,09,23,30,0);
            var array_of_days = Rally.technicalservices.util.Utilities.arrayOfDaysBetween(date1,date2,true);
            expect( array_of_days.length ).toEqual(48);
            expect( array_of_days[0] ).toEqual(date1);
            expect( array_of_days[47] ).toEqual(expected_last_timestamp);
            
        });
    });
});
