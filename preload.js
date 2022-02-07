const ip = require('ip');
const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    let openweb = document.getElementById("openweb");
    openweb.href = "http://"+ip.address()+":3000";
    openweb.addEventListener('click', event => {
        event.preventDefault();
        require("electron").shell.openExternal(event.target.href);
    });

    let openinstall = document.getElementById("openinstall");
    openinstall.href = "http://"+ip.address()+":3000/install";
    openinstall.addEventListener('click', event => {
        event.preventDefault();
        require("electron").shell.openExternal(event.target.href);
    });

    let weburl = document.getElementById("weburl");
    weburl.innerHTML = "http://"+ip.address()+":3000";
    const version = document.getElementById('version');
    
    ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (event, arg) => {
      ipcRenderer.removeAllListeners('app_version');
      version.innerText = 'Version ' + arg.version;
    });
})