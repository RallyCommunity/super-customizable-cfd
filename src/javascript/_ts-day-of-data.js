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
        {name:'metricFieldName',type:'string',defaultValue:'Count'}, /* the name of the field with a value to add (or count), remember the c_! */
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
        var metric_field_name = this.get('metricFieldName');
        
        var value_in_snap = 0;
        if ( metric_field_name === "Count" ) {
            value_in_snap = 1;
        } else {
            if (Ext.isNumber(snap.get(metric_field_name))) {
                value_in_snap = snap.get(metric_field_name);
            }
        }
        total = total + value_in_snap;
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
            
            if ( ! snap_value || snap_value == "" ) { snap_value = "None"; }
            
            if ( ! this.group_totals[snap_value] ) { this.group_totals[snap_value] = 0; }
            this.group_totals[snap_value] = this.group_totals[snap_value] + value_in_snap;
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
