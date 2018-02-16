/* Copyright (c) 2018 e-soa Jacques Desodt */
'use strict'

/* Prerequisites */
const processSelect = require('./select')

var processFormat = {}

/* Formats the list: deep select, selection, nonamespace and defaults */
processFormat.formatList = function (list, deepSelect, selection, nonamespace, defaults) {
  /* Initializes */
  var deepList = list
  /* Proceeds the deep selects */
  if (deepSelect.length > 0 && list.length > 0) {
    /* Loops on each deep select */
    deepSelect.forEach(function (item) {
      deepList = processSelect.selectDeep(deepList, item)
    })
  }
  /* Proceeds the selection function */
  if (selection && typeof selection == 'function') {
    var selectionList = []
    for (let i = 0; i < deepList.length; i++) {
      if (selection(deepList[i])) {
        selectionList.push(deepList[i])
      }
    }
    deepList = selectionList
  }
  /* Removes the namespace */
  if (nonamespace && deepList.length > 0) {
    deepList.forEach(function (item) {
      /* Removes the seneca field
         Don't use delete entity.entity$ -> error */
      delete item['entity$']
    })
  }
  /* Adds the default values */
  if (defaults && deepList.length > 0) {
    for (let defaultName in defaults) {
      deepList.forEach(function (item) {
        if (!item[defaultName]) {
          item[defaultName] = defaults[defaultName]
        }
      })
    }
  }
  return deepList
}

/* Exports this plugin */
module.exports = processFormat
