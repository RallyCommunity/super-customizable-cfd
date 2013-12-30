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
            var base_js_date = this._getBaseJSDate(value);
            if ( value == "today" || value == "yesterday" || value == "tomorrow") {
                if ( operator == "<" ) {
                    xform_value = this._getIsoMidnight(base_js_date);
                } else if ( operator == ">" ) {
                    xform_value = this._getIsoMidnight(Rally.util.DateTime.add(base_js_date,"day",1));
                } else if ( operator == "=" ) {
                    xform_value = Ext.create('Rally.data.QueryFilter', {
                        property: property,
                        operator: ">",
                        value: this._getIsoMidnight(base_js_date)
                    }).and(Ext.create('Rally.data.QueryFilter', {
                        property: property,
                        operator: "<",
                        value: this._getIsoMidnight(Rally.util.DateTime.add(base_js_date,"day",1))
                    }));
                }
            }
        } 
        return xform_value;
    },
    _getBaseJSDate: function(keyword){
        var today = new Date();
        if ( keyword == "today" ) {
            return today;
        }
        if ( keyword == "tomorrow" ) {
            return Rally.util.DateTime.add(today,"day",1)
        }
        if ( keyword == "yesterday" ) {
            return Rally.util.DateTime.add(today,"day",-1)
        }
        return keyword;
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