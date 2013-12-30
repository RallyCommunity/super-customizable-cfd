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
                xform_value = this._getIsoMidnight(new Date());
            }
        } 
        return xform_value;
    },
    /**
     * 
     */
    _getIsoMidnight: function(js_date) {
        var js_at_midnight = new Date(Ext.clone(new Date()).setHours(0,0,0,0));
        var iso_at_midnight = Rally.util.DateTime.toIsoString(js_at_midnight).replace(/T.*$/,"");
        return iso_at_midnight;
    }
});