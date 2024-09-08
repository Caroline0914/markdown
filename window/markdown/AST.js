const { typeEnum } = require('../../hardCode')

function handleQuoteChildren(prevChildren, level, content) {
  let curLevel = level
  const children = [...prevChildren]
  let prevChild = children
  while (curLevel) {
    if (curLevel === 1) {
      prevChild.push({
        ...content
      })
    } else {
      prevChild.push([])
      prevChild = prevChild[prevChild.length - 1]
    }
    curLevel--
  }
  return children
}

function token2AST(tokenArr) {
  const ASTArr = []
  let quoteBaseLevel = 1
  tokenArr.forEach(item => {
    if (item.type === typeEnum['QUOTE']) {
      // 处理连续引用
      if (!item.text.trim()) {
        if (item.level < quoteBaseLevel) {
          quoteBaseLevel = item.level
        }
        return
      }
      const lastItem = ASTArr.length > 0 ? ASTArr[ASTArr.length - 1] : {}
      if (lastItem.type === typeEnum['QUOTE']) {
        // 插入
        quoteBaseLevel = Math.max(item.level, quoteBaseLevel)
        lastItem.blockChildren = handleQuoteChildren(lastItem.blockChildren, quoteBaseLevel, item)
      } else {
        // 添加
        ASTArr.push({
          type: item.type,
          blockChildren: handleQuoteChildren([], item.level, item)
        })
        quoteBaseLevel = item.level
      }
    } else {
      ASTArr.push(item)
    }
  })
  return ASTArr
}

module.exports = {
  token2AST
}