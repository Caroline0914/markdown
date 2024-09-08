const fs = require('fs')
const path = require('path')
const { handInitialStr } = require('./token')
const { token2AST } = require('./AST')
const { getHtmlStr } = require('./toHtml')

const str = fs.readFileSync(path.join(__dirname, '/test.md'), {
  encoding: 'utf-8'
})

function transfer(str) {
  const tokenArr = handInitialStr(str)
  const ASTArr = token2AST(tokenArr)
  const htmlStr = getHtmlStr(ASTArr)
  return htmlStr
}

transfer(str)

module.exports = {
  transfer
}
