/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

var processSelect = {}

/* Selects on a deep query */
processSelect.selectDeep = function (list, select) {
  var deepList = []
  list.forEach(function (item) {
    let value = processSelect.fetchFromObject(item, select.property)
    if (value === select.value) {
      deepList.push(item)
    }
  })
  return deepList
}

/* Finds a value in a nested object */
processSelect.fetchFromObject = function (anObject, property) {
  if (typeof anObject === 'undefined') {
    return false
  }
  var _index = property.indexOf('.')
  if (_index > -1) {
    return processSelect.fetchFromObject(anObject[property.substring(0, _index)], property.substr(_index + 1))
  }
  return anObject[property]
}

/* Exports this plugin */
module.exports = processSelect
