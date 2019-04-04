/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'pagnos.Application',

    name: 'pagnos',

    requires: [
        // This will automatically load all classes in the pagnos namespace
        // so that application classes do not need to require each other.
        'pagnos.*'
    ],

    // The name of the initial view to create.
    applicationViewClassName: 'pagnos.view.MainView'
});
