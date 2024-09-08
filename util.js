const { typeEnum } = require('./hardCode')

// 防抖
function debounce(fn, wait) {
  let timer = null
  return async function () {
    timer && clearTimeout(timer)
    return new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        try {
          resolve(fn(...arguments))
        } catch (err) {
          reject(err)
        }
      }, wait)
    })
  }
}

// 转译特殊字符
function translateStr(str) {
  return str.replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll(' ', '&nbsp;')
}

// 字符串响应位置插入内容
function handleStr(initStr, type, start, end) {
  if (initStr.length < start || initStr.length < end) {
    return initStr
  }
  const prev = initStr.slice(0, start)
  const center = initStr.slice(start, end)
  const next = initStr.slice(end)
  let prevInsert = ''
  let nextInsert = ''
  switch (type) {
    case typeEnum['BOLD']:
      prevInsert = '**'
      nextInsert = '**'
      break;
    case typeEnum['ITALIC']:
      prevInsert = '*'
      nextInsert = '*'
      break;
    case typeEnum['UNDERLINE']:
      prevInsert = '<u>'
      nextInsert = '<\/u>'
      break;
    case typeEnum['CODE']:
      prevInsert = '`'
      nextInsert = '`'
      break;
    // link 和 image 有选中部分不处理
    case typeEnum['LINK']:
      prevInsert = center ? '' : '[]()'
      nextInsert = ''
      break;
    case typeEnum['IMAGE']:
      prevInsert = center ? '' : '![]()'
      nextInsert = ''
      break;
    default:
      break;
  }
  return `${prev}${prevInsert}${center}${nextInsert}${next}`
}

module.exports = {
  debounce,
  translateStr,
  handleStr
}