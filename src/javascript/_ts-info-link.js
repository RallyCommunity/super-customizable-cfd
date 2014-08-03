/**
 * A link that pops up a version dialog box
 */

Ext.define('Rally.technicalservices.InfoLink',{
    extend: 'Ext.Component',
    alias: 'widget.tsinfolink',
    
    /**
     * @cfg {String} informationHtml
     * Additional text to be displayed on the popup dialog (for exmaple,
     * to add a description of the app's use or functionality)
     */
    informationHtml: null,
    
    /**
     * 
     * cfg {String} title
     * The title for the dialog box
     */
     title: "Build Information",
    
    renderTpl: "<div id='{id}-infolinkWrap' class='tsinfolink'>i</div>",

    initComponent: function() {
        this.callParent(arguments);
       
    },
    
    onRender: function() {
        this.callParent(arguments);
        this.mon(this.el,'click',this.onClick,this);
    },
    _generateChecksum: function(string){
        var chk = 0x12345678,
            i;
        string = string.replace(/var CHECKSUM = .*;/,"");
        string = string.replace(/\s/g,"");  //Remove all whitespace from the string.
        
        for (i = 0; i < string.length; i++) {
            chk += (string.charCodeAt(i) * i);
        }
    
        return chk;
    },
    _checkChecksum: function(container) {
        var me = this;
        Ext.Ajax.request({
            url: document.URL,
            params: {
                id: 1
            },
            success: function (response) {
                text = response.responseText;
                if ( CHECKSUM ) {
                    if ( CHECKSUM !== me._generateChecksum(text) ) {
                        console.log("Checksums don't match!");
                        if ( me.dialog ) {
                            me.dialog.add({xtype:'container',html:'Checksums do not match'});
                        }
                    }
                }
            }
        });
    },
    onClick: function(e) {
        var me = this;
        this._checkChecksum(this);
        
        var dialog_items = [];
        
        if ( this.informationHtml ) {
            dialog_items.push({
                xtype:'container',
                html: this.informationHtml
            });
        }
                
        dialog_items.push({
            xtype:'container',
            html:"This app was created by the Rally Technical Services Team."
        });
        
        if ( APP_BUILD_DATE ) {
            dialog_items.push({
                xtype:'container',
                html:'Build date/time: ' + APP_BUILD_DATE
            });
        }
        
        if (this.dialog){this.dialog.destroy();}
        this.dialog = Ext.create('Rally.ui.dialog.Dialog',{
            defaults: { padding: 5, margin: 5 },
            closable: true,
            draggable: true,
            title: me.title,
            items: dialog_items
        });
        this.dialog.show();
    }
});
