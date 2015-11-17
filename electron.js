'use strict';
const app = require('app');
const BrowserWindow = require('browser-window');
const globalShortcut = require('global-shortcut');
var path = require('path');
const isOSX = process.platform === 'darwin';

module.exports = function(config) {
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
            win.webContents.send('require', config.main);
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

    app.on('window-all-closed', function() {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate-with-no-open-windows', function() {
        if (!mainWindow) {
            mainWindow = createMainWindow();
        }
    });

    app.on('ready', function() {
        var protocol = require('protocol');
        protocol.registerFileProtocol('utfront', function(request, callback) {
            var url = request.url.substr(18);
            if (url.indexOf('?') !== -1) {
                url = url.substring(0,url.indexOf('?'));
            }
            callback({path:path.normalize(__dirname + '/browser/' + url)});
        }, function(error) {
            if (!error) {
                console.log('Protocol utfront registered successfully');
            } else {
                console.log('Failed to register utfront protocol');
            }
        });

        mainWindow = createMainWindow();

        function devTools() {
            var win = BrowserWindow.getFocusedWindow();

            if (win) {
                win.toggleDevTools();
            }
        }

        function refresh() {
            var win = BrowserWindow.getFocusedWindow();

            if (win) {
                win.reloadIgnoringCache();
            }
        }

        globalShortcut.register('F12', devTools);
        globalShortcut.register(isOSX ? 'Cmd+Alt+I' : 'Ctrl+Shift+I', devTools);

        globalShortcut.register('F5', refresh);
        globalShortcut.register('CmdOrCtrl+R', refresh);

    });

};
