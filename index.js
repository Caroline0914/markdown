const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron')
const fs = require('fs')
const path = require('path')
const { typeEnum } = require('./hardCode')

let win = null
let curFilePath = ''
let savedFlag = false

const createWindow = () => {
  win = new BrowserWindow({
    width: 1500,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('window/index.html')
}

// 保存文件
function saveToFile() {
  dialog.showSaveDialog({
    title: 'save file',
    filters: [{
      name: 'markdown',
      extensions: ['md']
    }]
  }).then(result => {
    if (!result.canceled) {
      win.webContents.send('file-path', result.filePath)
    }
  }).catch(err => {
    console.log(err)
  })
}

// 格式处理
function formatStr(type) {
  win.webContents.send('format-str', type)
}

// 菜单
const menu = Menu.buildFromTemplate([
  {
    label: app.name,
    submenu: [
      { role: 'about' }
    ]
  },
  {
    label: '文件',
    submenu: [
      {
        label: '打开...',
        click: () => {
          dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{
              name: 'markdown',
              extensions: ['md', 'txt']
            }]
          }).then(result => {
            if (!result.canceled) {
              result.filePaths.forEach(filename => {
                curFilePath = filename
                const res = fs.readFileSync(filename, {
                  encoding: 'utf-8'
                })
                win.webContents.send('open-file', res)
              })
            }
          }).catch(err => {
            console.log(err)
          })
        }
      },
      {
        label: '打开最近文件',
        click: () => {
          console.log('打开最近文件')
        }
      },
      { type: 'separator' },
      {
        label: '关闭',
        accelerator: 'command+w',
        click: () => {
          win.close()
        }
      },
      { type: 'separator' },
      {
        label: '保存',
        accelerator: 'command+s',
        click: () => {
          // 判断是否有文件
          if (curFilePath) {
            // 有 直接保存
            win.webContents.send('file-path', curFilePath)
          } else {
            // 无 效果同另存为
            saveToFile()
          }
        }
      },
      {
        label: '另存为...',
        accelerator: 'shift+command+s',
        click: saveToFile
      }
    ]
  },
  {
    label: '编辑',
    submenu: [
      { label: '撤销', role: 'undo' },
      { label: '重做', role: 'redo' },
      { type: 'separator' },
      { label: '剪切', role: 'cut' },
      { label: '拷贝', role: 'copy' },
      { label: '粘贴', role: 'paste' },
      { type: 'separator' },
      { label: '删除', role: 'delete' },
      // { role: 'pasteAndMatchStyle' },
      // { role: 'selectAll' },
      // { role: 'hide' },
      // { role: 'hideOthers' },
      // { role: 'unhide' },
      // { role: 'quit' }
    ]
  },
  {
    label: '格式',
    submenu: [
      {
        label: '加粗',
        accelerator: 'command+B',
        click: () => formatStr(typeEnum['BOLD'])
      },
      {
        label: '斜体',
        accelerator: 'command+I',
        click: () => formatStr(typeEnum['ITALIC'])
      },
      {
        label: '下划线',
        accelerator: 'command+U',
        click: () => formatStr(typeEnum['UNDERLINE'])
      },
      {
        label: '代码',
        accelerator: 'command+`',
        click: () => formatStr(typeEnum['CODE'])
      },
      { type: 'separator' },
      {
        label: '超链接',
        accelerator: 'command+K',
        click: () => formatStr(typeEnum['LINK'])
      },
      {
        label: '图片',
        accelerator: 'command+P',
        click: () => formatStr(typeEnum['IMAGE'])
      },
      { type: 'separator' },
      {
        label: '清除样式',
        accelerator: 'command+\\',
        click: () => formatStr(typeEnum['CLEAR'])
      }
    ]
  },
  {
    label: '开发者工具',
    submenu: [
      {
        label: '调试',
        role: 'toggleDevTools'
      }
    ]
  }
])
Menu.setApplicationMenu(menu)

// 主进程事件监听
ipcMain.on('save-file', (_, options) => {
  // 保存文件
  fs.writeFile(options.filePath, options.content, (err) => {
    if (err) {
      savedFlag = false
      dialog.showErrorBox('保存失败', JSON.stringify(err))
    } else {
      savedFlag = true
      dialog.showMessageBox(win, {
        message: '保存成功'
      })
    }
  })
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  win.on('close', (event) => {
    if (!savedFlag) {
      const res = dialog.showMessageBoxSync(win, {
        message: '是否保存文件',
        buttons: ['否', '是'] // 0否 1是
      })
      if (res === 1) {
        // 保存操作
        if (curFilePath) {
          // 存在文件名，直接保存在改文件中
          win.webContents.send('file-path', curFilePath)
        } else {
          const res = dialog.showSaveDialogSync({
            title: 'save file',
            filters: [{
              name: 'markdown',
              extensions: ['md']
            }]
          })
          if (res) {
            // 存在文件路径，保存文件
            win.webContents.send('file-path', res)
          }
          // 否则，拦截关闭
          event.preventDefault()
        }
      }
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') app.quit()
})
