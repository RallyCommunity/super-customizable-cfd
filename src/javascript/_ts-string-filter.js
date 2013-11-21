Ext.define('TSStringFilter',{
    extend: 'Rally.data.QueryFilter',
    config: {
        query_string: ''
    },
    constructor: function(config) {
        this.mergeConfig(config);
        this.callParent([this.config]);
    },
    _createQueryString: function(property, operator, value) {
        return this.query_string;
    }
});