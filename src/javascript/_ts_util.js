Ext.define('Rally.technicalservices.util.Utilities', {
    singleton: true,
    hashToArray: function(hash) {
        var result = [];
        for ( var key in hash ) {
            result.push(hash[key]);
        }
        return result;
    },
    daysBetween: function(begin_date_js,end_date_js,skip_weekends){
        var dDate1 = Ext.clone(begin_date_js).setHours(0,0,0,0);
        var dDate2 = Ext.clone(end_date_js).setHours(0,0,0,0);
        
        if ( dDate1 == dDate2 ) { return 0; }
        if (typeof dDate1 === "number") { dDate1 = new Date(dDate1); }
        if (typeof dDate2 === "number") { dDate2 = new Date(dDate2); }
            
        if ( !skip_weekends ) {
            return Math.abs( Rally.util.DateTime.getDifference(dDate1,dDate2,'day') );
        } else {
            // from the sOverflow
            var iWeeks, iDateDiff, iAdjust = 0;
            if (dDate2 < dDate1) 
            { 
                var x = dDate2;
                dDate2 = dDate1;
                dDate1 = x;
            }
            var iWeekday1 = dDate1.getDay(); // day of week
            var iWeekday2 = dDate2.getDay();
            iWeekday1 = (iWeekday1 == 0) ? 7 : iWeekday1; // change Sunday from 0 to 7
            iWeekday2 = (iWeekday2 == 0) ? 7 : iWeekday2;
            if ((iWeekday1 > 5) && (iWeekday2 > 5)) iAdjust = 1; // adjustment if both days on weekend
            iWeekday1 = (iWeekday1 > 5) ? 5 : iWeekday1; // only count weekdays
            iWeekday2 = (iWeekday2 > 5) ? 5 : iWeekday2;
    
            // calculate differnece in weeks (1000mS * 60sec * 60min * 24hrs * 7 days = 604800000)
            iWeeks = Math.floor((dDate2.getTime() - dDate1.getTime()) / 604800000)
    
            if (iWeekday1 <= iWeekday2) {
              iDateDiff = (iWeeks * 5) + (iWeekday2 - iWeekday1)
            } else {
              iDateDiff = ((iWeeks + 1) * 5) - (iWeekday1 - iWeekday2)
            }
    
            iDateDiff -= iAdjust // take into account both days on weekend
    
            if ( iDateDiff < 0 ) { iDateDiff = 0; }
            return (iDateDiff); 
        }
    },

    isWeekday: function(check_date) {
        var weekday = true;
        var day = check_date.getDay();
        
        if ( day === 0 || day === 6 ) {
            weekday = false;
        }
        return weekday;
    },
    
    /*
     * compress size is the point at which to move to weeks instead of days
     */
    arrayOfDaysBetween: function(begin_date_js, end_date_js, skip_weekends, compress_size ) {
        var the_array = [];
        
        if ( begin_date_js > end_date_js ) {
            var swap_holder = end_date_js;
            end_date_js = begin_date_js;
            begin_date_js = swap_holder;
        }
        var number_of_days = this.daysBetween(begin_date_js,end_date_js,skip_weekends);
        
        var add_value = 1;
        if ( Ext.isNumber(compress_size) && number_of_days > compress_size ) {
            add_value = 7;
        }
        
        var dDate1 = Ext.clone(begin_date_js).setHours(0,0,0,0);
        var dDate2 = Ext.clone(end_date_js).setHours(0,0,0,0);
        
        var check_date = new Date(dDate1);
        
        while (check_date <= dDate2) {
            if ( !skip_weekends || this.isWeekday(check_date) || add_value === 7 ) {
                the_array.push(check_date);
            }
            check_date = Rally.util.DateTime.add(check_date,'day',add_value);
        }
        
        return the_array;
    }
    
});