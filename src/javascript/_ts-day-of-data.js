/**
 * a calculator for each day of data,
 * given a snap for that day, will calculate a
 * total count for each value in a metric field (e.g., count the number of items in Defined schedule state)
 * 
 * assumes that each individual snap represents one unique item
 */
 
 Ext.define('TSDay',{
    extend: 'Ext.data.Model',
    group_totals: {},
    fields: [
        {name:'JSDate',type:'date',defaultValue:new Date()},
        {name:'groupByFieldName',type:'string',defaultValue:'ScheduleState'}, /* the name of the field that filters what we count */
        {name:'Total',type:'number',defaultVale:0}
    ],
    constructor: function(data) {
        this.group_totals = {};
        this.callParent(arguments);
    },
    /**
     * Given a single lookback snapshot, aggregate data
     * @param {} snap
     */
    addSnap: function(snap){
        var total = this.get('Total');
        var group_by_field_name = this.get('groupByFieldName');
        
        total = total + 1;
        this.set('Total',total);
        
        var snap_value = snap.get(group_by_field_name);
        
        if ( Ext.isDefined(snap_value) ) {
            if ( Ext.isBoolean(snap_value) ) { 
                if ( snap_value ) { 
                    snap_value = "true"; 
                } else { 
                    snap_value = "false"; 
                } 
            }
            if ( ! this.group_totals[snap_value] ) { this.group_totals[snap_value] = 0; }
            this.group_totals[snap_value] = this.group_totals[snap_value] + 1;
        }
    },
    /**
     * return the aggregated value of totals for a given group (as seen in the groupByFieldName
     * (assumes if we haven't heard about the field value yet, it's just 0
     */
    getGroupTotal: function(field_value){
        return this.group_totals[field_value] || 0 ;
    }
    
 });
