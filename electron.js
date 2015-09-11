'use strict';
const app = require('app');
const BrowserWindow = require('browser-window');
const globalShortcut = require('global-shortcut');
var path = require('path');

module.exports = function(main){
// report crashes to the Electron project
    require('crash-reporter').start();

    function createMainWindow() {
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            resizable: true,
            'web-preferences': {'web-security': false}
        });

        win.loadUrl('utfront://ut.local/desktop.html', {
            headers: ['Content-Type: text/html']
        });
        win.on('closed', onClosed);
        win.webContents.on('did-finish-load', function() {
            win.webContents.send('require', main);
        });

        return win;
    }

    function onClosed() {
        // deref the window
        // for multiple windows store them in an array
        mainWindow = null;
    }

// prevent window being GC'd
    var mainWindow = null;

    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate-with-no-open-windows', function () {
        if (!mainWindow) {
            mainWindow = createMainWindow();
        }
    });

    app.on('ready', function () {
        var protocol = require('protocol');
        protocol.registerProtocol('utfront', function (request) {
            var url = request.url.substr(18)
            return new protocol.RequestFileJob(path.normalize(__dirname + '/browser/' + url));
        }, function (error, scheme) {
            if (!error)
                console.log(scheme, ' registered successfully')
        });

        mainWindow = createMainWindow();

        globalShortcut.register('CmdOrCtrl+J', function () {
            var win = BrowserWindow.getFocusedWindow();
            if (win) {
                win.toggleDevTools();
            }
        });

        globalShortcut.register('CmdOrCtrl+R', function () {
            var win = BrowserWindow.getFocusedWindow();
            if (win) {
                win.reloadIgnoringCache();
            }
        });

    });

}
