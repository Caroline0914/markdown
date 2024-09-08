const { ipcRenderer } = require('electron')
const { transfer } = require('./markdown/index')
const { debounce, handleStr } = require('../util')
const inp = document.querySelector('.inp')
const resultArea = document.querySelector('.right')
let selectionStart = 0
let selectionEnd = 0

const newTransfer = debounce(transfer, 500)

inp.addEventListener('input', async (e) => {
  const res = await newTransfer(e.target.value)
  resultArea.innerHTML = res
  selectionStart = e.target.selectionStart
  selectionEnd = e.target.selectionStart
})

inp.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    // 按tab键
    const value = e.target.value
    const index = e.target.selectionStart
    const prev = value.slice(0, index)
    const next = value.slice(index)
    inp.value = prev + '  ' + next
  }
})

inp.addEventListener('mouseup', function () {
  const timer = setTimeout(() => {
    selectionStart = inp.selectionStart
    selectionEnd = inp.selectionEnd
    clearTimeout(timer)
  }, 0)
  // window.getSelection().toString()
})

ipcRenderer.on('open-file', async (_, value) => {
  inp.value = value
  const res = await newTransfer(value)
  resultArea.innerHTML = res
})

ipcRenderer.on('file-path', (_, filePath) => {
  ipcRenderer.send('save-file', {
    filePath,
    content: inp.value
  })
})

ipcRenderer.on('format-str', async (_, type) => {
  inp.value = handleStr(inp.value, type, selectionStart, selectionEnd)
  if (!selectionEnd || selectionStart === selectionEnd) {
    selectionStart = inp.value.length
    selectionEnd = inp.value.length
  }
  // 手动重新分析修改后的内容
  const res = await newTransfer(inp.value)
  resultArea.innerHTML = res
})
