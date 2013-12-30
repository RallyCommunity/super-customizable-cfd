Ext.override(Rally.data.util.QueryStringParser,{
  applyOperators: function (operators, operator) {
        if (!operators.length) {
            return this.parseNextTerm();
        }

        if (!operator) {
            operator = operators[0];
        }

        var property = this.applyOperators(operators.slice(1));

        while (this.peek() === operator) {
            this.consume(operator);
            var value = this.applyOperators(operators.slice(1));
            if ( operator == "AND" || operator == "OR" ) {
                property = Ext.create('Rally.data.QueryFilter', {
                    property: property,
                    operator: operator,
                    value: this._convertToType(value)
                });
            } else {
                value = this._convertKeywords(property,operator,value);
                if (typeof(value) == "object" ) {
                    property = value;
                } else {
                    property = Ext.create('Rally.data.QueryFilter', {
                        property: property,
                        operator: operator,
                        value: this._convertToType(value)
                    });
                }
            }
        }
        return property;
    },
    /**
     * Do date math
     **/
    _convertKeywords: function(property,operator,value) {
        var xform_value = value;
        if ( operator != "AND" && operator != "OR" ) {
            if ( this._isDateKeyword(value) ) {
                var base_js_date = this._getBaseJSDate(value);
                if ( operator == "<" || operator == ">" || operator == ">=") {
                    xform_value = this._getIsoMidnight(base_js_date);
                } else if ( operator == "<=") {
                    xform_value = this._getIsoMidnight(Rally.util.DateTime.add(base_js_date,"day",1));
                } else if ( operator == "=" ) {
                    // yesterday and tomorrow do NOT include today, but all others do
                    if ( value == "tomorrow" || value == "yesterday" || value == "today") {
                        xform_value = Ext.create('Rally.data.QueryFilter', {
                            property: property,
                            operator: ">",
                            value: this._getIsoMidnight(base_js_date)
                        }).and(Ext.create('Rally.data.QueryFilter', {
                            property: property,
                            operator: "<",
                            value: this._getIsoMidnight(Rally.util.DateTime.add(base_js_date,"day",1))
                        }));                        
                    } else {
                        // everything less than today
                        var date_1 = base_js_date;
                        var date_2 = new Date();
                        
                        if ( date_1 > date_2 ) {
                            // include today by starting at beginning of day
                            xform_value = Ext.create('Rally.data.QueryFilter', {
                                property: property,
                                operator: ">",
                                value: this._getIsoMidnight(date_2)
                            }).and(Ext.create('Rally.data.QueryFilter', {
                                property: property,
                                operator: "<",
                                value: this._getIsoMidnight(date_1)
                            }));
                        } else {
                            // include today by starting at end of day when going back
                            xform_value = Ext.create('Rally.data.QueryFilter', {
                                property: property,
                                operator: ">",
                                value: this._getIsoMidnight(date_1)
                            }).and(Ext.create('Rally.data.QueryFilter', {
                                property: property,
                                operator: "<",
                                value: this._getIsoMidnight(Rally.util.DateTime.add(date_2,"day",1))
                            }));
                        }
                    }
                }
            }
        } 
        return xform_value;
    },
    _getBaseJSDate: function(keyword){
        var lc_keyword = Ext.util.Format.lowercase(keyword);
        var today = new Date();
        return Rally.util.DateTime.add(today,"day",this.periodShifters[lc_keyword]);
    },
    _isDateKeyword: function(keyword) {
        var isKeyword = false;
        var valid_keywords = [
            "today", "tomorrow", "yesterday",
            "lastweek","lastmonth","lastquarter","lastyear",
            "nextweek","nextmonth","nextquarter","nextyear"
        ];
        if ( Ext.Array.indexOf(valid_keywords,Ext.util.Format.lowercase(keyword)) > -1 ) {
            isKeyword = true;
        }
        return isKeyword;
    },
    periodShifters: {
        "today": 0,
        "tomorrow":1, 
        "yesterday":-1,
        "lastweek":-6,
        "lastmonth":-29,
        "lastquarter":-89,
        "lastyear":-364,
        "nextweek":7,
        "nextmonth":30,
        "nextquarter":90,
        "nextyear":365       
    },
    /**
     * 
     */
    _getIsoMidnight: function(js_date) {
        var js_at_midnight = new Date(Ext.clone(js_date).setHours(0,0,0,0));
        var iso_at_midnight = Rally.util.DateTime.toIsoString(js_at_midnight).replace(/T.*$/,"");
        return iso_at_midnight;
    }
});