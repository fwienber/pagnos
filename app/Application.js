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

Ext.define('pagnos.Application', {

    extend: 'Ext.app.Application',

    name: 'pagnos',

    requires : [
      "Ext.Package"
    ],


    /**
     * @type {String} applicationViewClassName (required)
     * The fqn of the class representing the view which will be used as
     * the {@link #mainView}.
     * The representing classes should have been loaded before this class
     * gets instantiated, to prevent synchronous requests to this class.
     * This value will be set in the constructor to the value of {@link #mainView},
     * which is a required property.
     */
    applicationViewClassName : null,


    /**
     * @inheritdocs
     *
     * @throws Exception if any of the required class configs are not available,
     * or if  {@link #mainView} were not loaded already.
     */
    constructor : function(config) {

        const me = this;

        config = config || {};

        if (config.mainView) {
            me.applicationViewClassName = config.mainView;
            delete config.mainView;
        }

        if (me.defaultConfig.mainView) {
            Ext.raise({
                'defaultConfig.mainView' : me.defaultConfig.mainView,
                msg                      : "requires applicationViewClassName, not mainView to be set."
            });
        }

        me.callParent([config]);
    },

    /**
     * The preLaunchHookProcess is a hook for the launch process which gets called
     * before the {@link #mainView} gets rendered.
     * When this method returns false, the applications's mainView does not
     * get rendered.
     * This method gives controllers the chance to change the applications's behavior
     * and hook into the process of setting up the application.
     * This is called before the {@link #launch} method initializes this Application's
     * {@link #mainView}.
     * This method will iterate over the controllers configured for this application.
     * If an {@link Ext.app.Controller} is configured, it's preLaunchHook method will
     * be called, if implemented.
     *
     * @returns {boolean} false if the {@link #mainView} should not be
     * rendered, otherwise true
     *
     * @protected
     *
     * @throws if {@link #mainView} was already initialized
     */
    preLaunchHookProcess : function() {

        var me = this;

        if (me.getMainView()) {
            Ext.raise({
                mainView    : me.getMainView(),
                msg         : "preLaunchHookProcess cannot be run since mainView was already initialized."
            });
        }

        var ctrl = null,
            res  = false,
            controllers = this.controllers.getRange();

        for (var i = 0, len = controllers.length; i < len; i++) {

            ctrl = controllers[i];

            if ((ctrl instanceof Ext.app.Controller) &&
                Ext.isFunction(ctrl.preLaunchHook)) {
                res = ctrl.preLaunchHook(this);

                if (res === false) {
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * @inheritdoc
     *
     * This method needs the {@link #mainView} to be configured as a string (the class
     * name of the view to use as the applications main view) when this Application's
     * instance gets configured.
     * Before the mainView gets initialized, the {@link #preLaunchHookProcess}
     * will be called. If this method returns anything but false, the mainView will
     * be rendered. Additionally, the {@link #postLaunchHookProcess} will be called.
     *
     */
    launch : function() {
        var me = this;

        if (me.preLaunchHookProcess() !== false) {
            me.setMainView(me.applicationViewClassName);
            me.postLaunchHookProcess();
        }
    },


    /**
     * Hook for the launch-process, after the {@link #mainView} was initialized.
     * This method can be used for additional setup and configuration of the
     * application.
     *
     * @protected
     * @method
     * @template
     */
    postLaunchHookProcess : function() {

        const me          = this,
              controllers = me.controllers.getRange(),
              mainView    = me.getMainView();

        let info = {},
            ctrl = null;

        for (var i = 0, len = controllers.length; i < len; i++) {

            ctrl = controllers[i];

            if ((ctrl instanceof Ext.app.Controller) &&
                Ext.isFunction(ctrl.postLaunchHook)) {
                info = ctrl.postLaunchHook();
                if (info !== undefined) {
                    mainView.addPostLaunchInfo(info);
                }
            }
        }
    },


    /**
     * Overridden to make sure that all pagnos PackageControllers found in
     * Ext.manifest are loaded before the application is initiated.
     * Starts loading required packages by calling "handlePackage()" and
     * returns all found packageController that are required by this app.
     * Will also make sure that those controllers are added to THIS applications
     * #controllers-list.
     * While packages are loaded, Ext.env.Ready is blocked and the original
     * Ext.app.Application.prototype.onProfilesReady is registered with Ext.onReady.
     * Ext.env.Ready is unblocked in #handlePackageLoad.
     *
     * @return {Object}
     *
     * @see findPackageControllers
     * @see handlePackageLoad
     */
    onProfilesReady : function() {

        const me          = this,
            pcs         = me.findPackageControllers(Ext.manifest),
            packages    = Object.keys(pcs);

        if (!me.controllers) {
            me.controllers = [];
        }

        if (packages.length) {

            packages.forEach(function(packageName) {
                me.controllers.push(pcs[packageName].controller);
                Ext.app.addNamespaces(pcs[packageName].namespace);
            });

            Ext.env.Ready.block();

            Ext.onReady(function() {
                Ext.app.Application.prototype.onProfilesReady.call(me);
            });

            me.handlePackageLoad(packages.pop(), packages);


        } else {

            Ext.app.Application.prototype.onProfilesReady.call(me);

        }


        return pcs;
    },


    /**
     * Called by overridden implementation of onProfilesReady to load all packages
     * available in remainingPackages.
     * The method will call itself until all entries of remainingPackages have been
     * processed by Ex.Package#load. Once this is done, the original implementation
     * of Ext.app.Application.onProfilesReady will be called.
     *
     * @param {String} packageName
     * @param {Array} remainingPackages
     *
     * @private
     *
     */
    handlePackageLoad : function(packageName, remainingPackages) {

        const me = this;

        if (!packageName) {
            Ext.env.Ready.unblock();
            return;
        }

        Ext.Package
            .load(packageName)
            .then(me.handlePackageLoad.bind(me, remainingPackages.pop(), remainingPackages));
    },



    /**
     * Queries all available packages in Ext.manifest.packages and returns
     * an object containing all key/value pairs in the form of
     * [package-name] -> controller: [packageNamespace].app.PackageController,
     *                   namespace : [packageNamespace] if, and only
     * if:
     *  - The packages was not yet loaded
     *  - The property "included" of the package is not equal to "true"
     *  - The package has a property named "pagnos" which is an object and
     *    has the property "packageController" set to true
     *
     * @param {Object} manifest an object providing manifest information (Ext.manifest)
     *
     * @return {Object}
     *
     * @private
     */
    findPackageControllers : function(manifest) {

        const me          = this,
            controllers = {},
            mp          = manifest && manifest.packages ? manifest.packages : {},
            keys        = Object.keys(mp);

        keys.forEach(function(key) {

            let entry = mp[key], ns, fqn;

            if (entry.included !== true &&
                !Ext.Package.isLoaded(key) &&
                entry['pagnos'] &&
                entry['pagnos']['packageController'] === true
            ) {
                ns  = entry.namespace;
                fqn = ns + '.app.PackageController';

                controllers[key] = {
                    controller : fqn,
                    namespace  : ns
                };
            }
        });


        return controllers;
    }

});
