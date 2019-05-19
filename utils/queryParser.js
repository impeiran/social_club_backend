module.exports = function (url) {
  if (url.indexOf('?') == -1) return {}
  const queryStr = url.slice(url.indexOf('?') + 1)
  let result = {}
  queryStr.split('&').forEach(item => {
    const itemSplit = item.split('=')
    result[itemSplit[0]] = itemSplit[1]
  })
  return result
}