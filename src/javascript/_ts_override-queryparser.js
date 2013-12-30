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
            value = this._convertKeywords(value,operator);
            property = Ext.create('Rally.data.QueryFilter', {
                property: property,
                operator: operator,
                value: this._convertToType(value)
            });
        }
        return property;
    },
    /**
     * Do date math
     **/
    _convertKeywords: function(value,operator) {
        var xform_value = value;
        if ( operator != "AND" && operator != "OR" ) {
            if ( value == "today" ) {
                if ( operator == "<" ) {
                    xform_value = this._getIsoMidnight(new Date());
                } else if ( operator == ">" ) {
                    xform_value = this._getIsoMidnight(Rally.util.DateTime.add(new Date(),"day",1));
                }
            }
        } 
        return xform_value;
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