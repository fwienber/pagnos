/**
 * pagnos
 * pagnos
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/sencha-community-days/pagnos
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

Ext.define("pagnos.view.MainView", {

    extend : 'Ext.Panel',

    requires : [
        "pagnos.view.MainViewController"
    ],

    controller : 'mainviewcontroller',

    plugins : [
        "viewport"
    ],

    layout : {
        type : 'hbox',
        align : 'stretch'
    },

    items : [{
        xtype : 'container',
        layout : {
            type : 'vbox',
            align : 'stretch'
        },
        width : 200,
        items : [{
            xtype : 'displayfield',
            cls : 'ps-titlefield',
            value : 'pagnos',
            height:44,
        }, {
            xtype : 'treelist',
            flex : 1,
            store : {
                root : {
                    name : 'root',
                    children : []
                }
            }
        }]
    }, {
        xtype : 'panel',
        itemId : 'modulePanel',
        flex : 1,
        layout : {
            type : 'card'
        },
        dockedItems : [{
            xtype : 'toolbar',
            itemId : 'moduleToolbar',
            items : []
        }]
    }],



    addPostLaunchInfo : function(info) {

        const me = this;

        if (info.navigation) {
            me.addNavigation(info.navigation);
        }

    },


    addNavigation : function(navigation) {

        const me   = this,
              root = me.down("treelist").getStore().getRoot();

        let node;

        for (let i = 0, len = navigation.length; i < len; i++) {
            node = navigation[i];

            if (node.moduleNavigation) {
                me.addModuleNavigation(node.key, node.moduleNavigation)
                delete node.moduleNavigation;
            }

            root.appendChild(node)
        }


    },


    addModuleNavigation : function(key, navigation) {

        const me   = this,
              tbar = me.down("toolbar");

        let btn;

        for (let i = 0, len = navigation.length; i < len; i++) {
            btn = navigation[i];

            btn.hidden = true;
            btn.itemId = key + '-btn-' + i;

            tbar.add(btn)
        }

    }


});