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

Ext.define("pagnos.view.MainViewController", {

    extend : 'Ext.app.ViewController',

    alias : 'controller.mainviewcontroller',


    control : {

        treelist : {
            selectionchange : 'onTreeListSelect'
        }

    },


    onTreeListSelect : function(list, rec) {

        const me = this,
              view = me.getView(),
              tbar = view.down('toolbar'),
              key  = rec.get('key'),
              items = tbar.items.items;

        let item;

        for (let i = 0, len = items.length; i < len; i++) {

            item = items[i];

            if (item.getItemId().indexOf(key + "-") === 0) {
                item.setHidden(false);
            } else {
                item.setHidden(true);
            }
        }

        me.switchMainViewFor(rec);
    },


    switchMainViewFor : function(rec) {

        const me     = this,
              view   = me.getView(),
              xclass = rec.get('mainView'),
              key    = rec.get('key'),
              itemId = key + '-mainView',
              card   = view.down('#modulePanel');

        let mainView = card.down('#' + itemId);

        if (!mainView) {
            let cfg = {
                xclass : xclass,
                itemId : itemId
            };
            mainView = card.add(cfg);
            console.log("mainView for", key, "created");
        }

        card.setActiveItem(mainView);

    }



});