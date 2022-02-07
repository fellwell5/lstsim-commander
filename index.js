const { exec } = require('child_process')
const server = exec(`node ${__dirname}/server.js`);

require('update-electron-app')();

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const createWindow = () => {
    const win = new BrowserWindow({
        width: 400,
        height: 600,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
          nodeIntegration: true,
          enableRemoteModule: true,
          preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('electron.html')
}
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});