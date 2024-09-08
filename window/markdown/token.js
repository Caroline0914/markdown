const { typeEnum } = require('../../hardCode')
const { translateStr } = require('../../util')

const titleReg = /^(#{1,6})[ |\t]+(.+)/ // 标题
const listReg = /([\t| ]*)((\d+)\.|\-) (.+)/ // 无序/有序列表
const boldReg = /\*\*([^ ].+?)\*\*|\_\_([^ ].+?)\_\_/g // 加粗
const italicReg = /\*([^ |\*].+?)\*|\_([^ |\_].+?)\_/g // 斜体
const deleteReg = /\~\~([^ ].+?)\~\~/g // 删除线
const underlineReg = /\<u\>(.+?)\<\/u\>/g // 下划线
const codeReg = /\`([\`]*[^\`]+)\`/g   // code(``) 当前不考虑代码块，代码块在之前单独处理
const codeBlockReg = /```(.*)\n([\s\S]+?)\n```/g // 代码块
const unLockedCodeBolckReg = /\n```(.*)([\s\S]*)/g // 不闭合代码块，用于最后
const imageReg = /\!\[(.*?)\]\((.+?)\)/g // 图片
const linkReg = /\[(.*?)\]\((.+?)\)/g // 链接
const blockQuoteReg = /^>([ >|>])*/g // 引用
const tab = 2 // 一个tab对应空格数

function handleRegExp(str = '') {
  if (!str || !str.trim()) {
    return null
  }
  boldReg.lastIndex = 0
  italicReg.lastIndex = 0
  codeReg.lastIndex = 0
  deleteReg.lastIndex = 0
  underlineReg.lastIndex = 0
  imageReg.lastIndex = 0
  linkReg.lastIndex = 0
  const blodRes = boldReg.exec(str) || { index: Infinity }
  const italicRes = italicReg.exec(str) || { index: Infinity }
  const codeRes = codeReg.exec(str) || { index: Infinity }
  const deleteRes = deleteReg.exec(str) || { index: Infinity }
  const underlineRes = underlineReg.exec(str) || { index: Infinity }
  const imageRes = imageReg.exec(str) || { index: Infinity }
  const linkRes = linkReg.exec(str) || { index: Infinity }
  let min = Math.min(blodRes.index, italicRes.index, codeRes.index, deleteRes.index, underlineRes.index, imageRes.index, linkRes.index)
  let result = null
  if (min === Infinity) {
    return result
  }
  switch (min) {
    case blodRes.index:
      result = {
        ...blodRes,
        type: typeEnum['BOLD']
      }
      break;
    case italicRes.index:
      result = {
        ...italicRes,
        type: typeEnum['ITALIC']
      }
      break;
    case codeRes.index:
      result = {
        ...codeRes,
        type: typeEnum['CODE']
      }
      break;
    case deleteRes.index:
      result = {
        ...deleteRes,
        type: typeEnum['DELETE']
      }
      break;
    case underlineRes.index:
      result = {
        ...underlineRes,
        type: typeEnum['UNDERLINE']
      }
      break;
    case imageRes.index:
      result = {
        ...imageRes,
        type: typeEnum['IMAGE']
      }
      break;
    case linkRes.index:
      result = {
        ...linkRes,
        type: typeEnum['LINK']
      }
      break;
    default:
      break;
  }
  return result
}

// 处理行内元素
function handleInlineEle(str = '', flag = typeEnum['DEFAULTINLINE']) {
  if (!str.trim()) {
    return ''
  }
  function innerHandleInlineEle(str = '') {
    let result = []
    // 处理 加粗/斜体/code
    // 判断三种的第一个匹配结果，优先处理结果对应的index最小的
    let restStr = str
    let curIndex = 0
    while (curIndex < str.length) {
      const regRes = handleRegExp(restStr)
      let innerCurIndex = 0
      if (restStr === '') {
        curIndex === str.length
        return
      }
      if (!regRes) {
        // 没有匹配的结果，curIndex设置初始字符串长度，跳出循环
        if (curIndex > 0 && curIndex + restStr.length === str.length) {
          // 处理剩余不匹配部分
          result.push({
            type: typeEnum['DEFAULTINLINE'],
            text: translateStr(restStr)
          })
          return result
        } else {
          curIndex = str.length
          result = restStr
          return restStr
        }
      }
      while (innerCurIndex <= regRes.index) {
        if (innerCurIndex < regRes.index) {
          // 存在不匹配部分
          result.push({
            type: typeEnum['DEFAULTINLINE'],
            text: translateStr(str.slice(curIndex, curIndex + regRes.index))
          })
          curIndex += str.slice(curIndex, curIndex + regRes.index).length
          innerCurIndex = regRes.index
        } else {
          if (regRes.type === typeEnum['CODE']) {
            // code 内部不处理，直接返回
            result.push({
              type: typeEnum['CODE'],
              text: translateStr(regRes[1])
            })
            curIndex += regRes[0].length
          }
          if (regRes.type === typeEnum['BOLD']) {
            // 加粗
            const boldRes = innerHandleInlineEle(regRes[1]) || ''
            result.push({
              type: typeEnum['BOLD'],
              [typeof boldRes === 'string' ? 'text' : 'children']: boldRes
            })
            curIndex += regRes[0].length
          }
          if (regRes.type === typeEnum['ITALIC']) {
            // 斜体
            const italicRes = innerHandleInlineEle(regRes[1], typeEnum['ITALIC']) || ''
            result.push({
              type: typeEnum['ITALIC'],
              [typeof italicRes === 'string' ? 'text' : 'children']: italicRes
            })
            curIndex += regRes[0].length
          }
          if (regRes.type === typeEnum['DELETE']) {
            // 删除
            const deleteRes = innerHandleInlineEle(regRes[1], typeEnum['DELETE']) || ''
            result.push({
              type: typeEnum['DELETE'],
              [typeof deleteRes === 'string' ? 'text' : 'children']: deleteRes
            })
            curIndex += regRes[0].length
          }
          if (regRes.type === typeEnum['UNDERLINE']) {
            // 下划线
            const underlineRes = innerHandleInlineEle(regRes[1], typeEnum['UNDERLINE']) || ''
            result.push({
              type: typeEnum['UNDERLINE'],
              [typeof underlineRes === 'string' ? 'text' : 'children']: underlineRes
            })
            curIndex += regRes[0].length
          }
          if (regRes.type === typeEnum['IMAGE']) {
            // 图片
            result.push({
              type: typeEnum['IMAGE'],
              title: regRes[1],
              src: regRes[2]
            })
            curIndex += regRes[0].length
          }
          if (regRes.type === typeEnum['LINK']) {
            // 链接
            result.push({
              type: typeEnum['LINK'],
              name: regRes[1],
              href: regRes[2]
            })
            curIndex += regRes[0].length
          }
          innerCurIndex = regRes.index + 1
          restStr = str.slice(curIndex)
        }
      }
    }
    return result
  }
  let result = innerHandleInlineEle(str, flag)
  return result
  // typeof result === 'string'
  //   ? {
  //     type: flag,
  //     text: result
  //   }
  //   : result
}

// 处理代码块
function handleCodeBlock(str = '') {
  const result = []
  if (!str.trim()) {
    return result
  }
  let regRes = null
  let curIndex = 0
  while (regRes = codeBlockReg.exec(str)) {
    if (regRes.index > curIndex) {
      // 匹配成功之前部分
      result.push(str.slice(curIndex, regRes.index))
      curIndex = regRes.index
    }
    result.push({
      type: typeEnum['CODEBLOCK'],
      language: regRes[1],
      text: translateStr(regRes[2])
    })
    curIndex += regRes[0].length
  }
  if (curIndex < str.length) {
    let unLockedRegRes = unLockedCodeBolckReg.exec(str.slice(curIndex))
    if (unLockedRegRes) {
      // 处理剩余部分未闭合的代码块
      result.push(str.slice(curIndex, unLockedRegRes.index))
      result.push({
        type: typeEnum['CODEBLOCK'],
        language: unLockedRegRes[1],
        text: translateStr(unLockedRegRes[2])
      })
    } else {
      result.push(str.slice(curIndex))
    }
  }
  return result
}

// 初始化
function handInitialStr(str) {
  // 优先处理代码块
  const codeBlockRes = handleCodeBlock(str)
  const arr = codeBlockRes.map(item => {
    if (typeof item === 'string') {
      return item.split('\n').filter(innerItem => innerItem !== '')
    }
    return item
  }).flat()
  return arr.map(item => {
    if (typeof item !== 'string') {
      // 已经处理过的直接返回
      return item
    }
    if (titleReg.test(item)) {
      // 标题
      const temp = item.match(titleReg)
      const res = handleInlineEle(temp[2]) || ''
      return {
        type: typeEnum['TITLE'],
        level: temp[1].length,
        [typeof res === 'string' ? 'text' : 'children']: res
      }
    } else if (listReg.test(item)) {
      // 有序/无序列表
      const temp = item.match(listReg)
      const res = handleInlineEle(temp[4]) || ''
      return {
        type: temp[2] === '-' ? 'unOrderList' : 'orderList',
        [typeof res === 'string' ? 'text' : 'children']: res,
        level: Math.floor(temp[1].length / tab) + 1, // 处理层级
        number: temp[3]
      }
    } else if (item.startsWith('>')) {
      // 引用
      const matchRes = item.match(blockQuoteReg)[0]
      const res = handleInlineEle(item.slice(matchRes.length)) || ''
      return {
        type: typeEnum['QUOTE'],
        level: matchRes.split(' ').join('').length,
        [typeof res === 'string' ? 'text' : 'children']: res
      }
    } else {
      // 默认
      const res = handleInlineEle(item) || ''
      return typeof res === 'string'
        ? {
          type: typeEnum['DEFAULT'],
          text: translateStr(res)
        }
        : res.length === 1
          ? res[0]
          : {
            type: typeEnum['DEFAULT'],
            children: res
          }
    }
  })
}

module.exports = {
  handInitialStr
} 