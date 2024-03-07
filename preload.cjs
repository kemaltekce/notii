const { contextBridge, ipcRenderer } = require('electron')

const API = {
  onSendData: (callback) =>
    ipcRenderer.on('on-send-data', (event, args) => {
      callback(args)
    }),
  onTurnOnOffVim: (callback) =>
    ipcRenderer.on('on-turn-on-off-vim', (event, args) => {
      callback(args)
    }),
  logData: (data) => ipcRenderer.send('log-data', data),
}

contextBridge.exposeInMainWorld('api', API)
