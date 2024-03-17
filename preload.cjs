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
  saveData: (data) => ipcRenderer.send('save-data', data),
}

contextBridge.exposeInMainWorld('api', API)
