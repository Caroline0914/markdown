const { typeEnum, domEnum } = require('../../hardCode')

function getQuoteBlockChildren(blockChildren) {
  let str = ''
  blockChildren.forEach(item => {
    if (Array.isArray(item)) {
      str += `<div class="blockquote">${getQuoteBlockChildren(item) || ''}</div>`
    } else {
      if (item.children && item.children.length > 0) {
        str += `<div class="blockquote">${innerGetHtmlStr(item.children) || ''}</div>`
      } else {
        str += `<div class="blockquote">${item.text || ''}</div>`
      }
    }
  })
  return str
}

function getHtmlStr(astArr, isFirstLevel = true) {
  let htmlStr = ''
  function innerGetHtmlStr(astArr, isFirstLevel = false) {
    let innerHtmlStr = ''
    astArr.forEach(item => {
      switch (item.type) {
        case typeEnum['DEFAULT']:
          if (item.children && item.children.length > 0) {
            innerHtmlStr += `<p>${innerGetHtmlStr(item.children)}</p>`
          } else {
            innerHtmlStr += `<p>${item.text || ''}</p>`
          }
          break;
        case typeEnum['TITLE']:
          if (item.children && item.children.length > 0) {
            innerHtmlStr += `<h${item.level}>${innerGetHtmlStr(item.children)}</h${item.level}>`
          } else {
            innerHtmlStr += `<h${item.level}>${item.text || ''}</h${item.level}>`
          }
          break;
        case typeEnum['BOLD']:
        case typeEnum['ITALIC']:
        case typeEnum['DELETE']:
        case typeEnum['UNDERLINE']:
        case typeEnum['DEFAULTINLINE']:
          let tempStr = ''
          if (item.children && item.children.length > 0) {
            tempStr = `<${domEnum[item.type]}>${innerGetHtmlStr(item.children)}</${domEnum[item.type]}>`
          } else {
            tempStr = `<${domEnum[item.type]}>${item.text || ''}</${domEnum[item.type]}>`
          }
          if (isFirstLevel) {
            innerHtmlStr += `<p>${tempStr}</p>`
          } else {
            innerHtmlStr += tempStr
          }
          break;
        case typeEnum['CODE']:
          let codeStr = ''
          if (item.children && item.children.length > 0) {
            codeStr = `<span class="code">${innerGetHtmlStr(item.children)}</span>`
          } else {
            codeStr = `<span class="code">${item.text || ''}</span>`
          }
          if (isFirstLevel) {
            innerHtmlStr += `<p>${codeStr}</p>`
          } else {
            innerHtmlStr += codeStr
          }
          break;
        case typeEnum['IMAGE']:
          if (isFirstLevel) {
            innerHtmlStr += `<p><img title="${item.title}" src="${item.src}" /></p>`
          } else {
            innerHtmlStr += `<img title="${item.title}" src="${item.src}" />`
          }
          break;
        case typeEnum['LINK']:
          if (isFirstLevel) {
            innerHtmlStr += `<p><a href="${item.href}" target="_blank">${item.name || ''}</a></p>`
          } else {
            innerHtmlStr += `<a href="${item.href}" target="_blank">${item.name || ''}</a>`
          }
          break;
        case typeEnum['UNORDERLIST']:
          if (item.children && item.children.length > 0) {
            innerHtmlStr += `<div class="${item.level % 2 === 1 ? 'unOrderListOdd' : 'unorderListEven'}" style="padding-left: ${40 * item.level}px;">${innerGetHtmlStr(item.children) || ''}</div>`
          } else {
            innerHtmlStr += `<div class="${item.level % 2 === 1 ? 'unOrderListOdd' : 'unorderListEven'}" style="padding-left: ${40 * item.level}px;">${item.text || ''}</div>`
          }
          break;
        case typeEnum['ORDERLIST']:
          if (item.children && item.children.length > 0) {
            innerHtmlStr += `<div style="display: flex;">
              <div style="display: inline-block;width: ${item.level * 40 - 4}px; text-align: right;margin-right: 4px;">1.</div>
              <div style="display: inline-block;">${innerGetHtmlStr(item.children)}</div>
            </div>`
          } else {
            innerHtmlStr += `<div style="display: flex;">
              <div style="display: inline-block;width: ${item.level * 40 - 4}px; text-align: right;margin-right: 4px;">1.</div>
              <div style="display: inline-block;">${item.text}</div>
            </div>`
          }
          break;
        case typeEnum['QUOTE']:
          if (item.blockChildren && item.blockChildren.length > 0) {
            innerHtmlStr = getQuoteBlockChildren(item.blockChildren)
          }
          break;
        case typeEnum['CODEBLOCK']:
          innerHtmlStr += `<pre class="blockCode">${item.text}</pre>`
          break;
        default:
          break;
      }
    })
    return innerHtmlStr
  }
  htmlStr = innerGetHtmlStr(astArr, isFirstLevel)
  return htmlStr
}

module.exports = {
  getHtmlStr
}
