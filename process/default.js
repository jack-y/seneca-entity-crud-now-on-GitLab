/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

var processDefault = {}

/* Adds the default values */
processDefault.add = function (entity, defaults) {
  return new Promise(function (resolve, reject) {
    if (entity && defaults) {
      for (let defaultName in defaults) {
        if (!entity[defaultName]) {
          entity[defaultName] = defaults[defaultName]
        }
      }
    }
    return resolve(entity)
  })
}

/* Exports this plugin */
module.exports = processDefault
