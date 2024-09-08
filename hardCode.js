const typeEnum = {
  'TITLE': 'title',
  'UNORDERLIST': 'unOrderList',
  'ORDERLIST': 'orderList',
  'BOLD': 'bold',
  'ITALIC': 'italic',
  'DELETE': 'delete',
  'UNDERLINE': 'underline',
  'LINK': 'link',
  'CODE': 'code',
  'CODEBLOCK': 'codeBlock',
  'QUOTE': 'quote',
  'IMAGE': 'image',
  'TABLE': 'table',
  'DEFAULTINLINE': 'defaultInline',
  'DEFAULT': 'default',
  'CLEAR': 'clear'
}

const domEnum = {
  [typeEnum.BOLD]: 'strong',
  [typeEnum.ITALIC]: 'em',
  [typeEnum.DELETE]: 'del',
  [typeEnum.UNDERLINE]: 'u',
  [typeEnum.DEFAULTINLINE]: 'span'
}

module.exports = {
  typeEnum,
  domEnum
}