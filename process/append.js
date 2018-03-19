/* Copyright (c) 2018 e-soa Jacques Desodt */
'use strict'

/* APPEND PATTERN
   appends: [ {resultname: 'myname', action: {role: aRole, cmd: 'read/query', ...}, select: {idname: anIdName, valuename: aValueName}}, { ... }, ...]
   See: https://github.com/jack-y/seneca-entity-crud/blob/master/README-APPENDS.md
*/

const promise = require('bluebird')

/* Prerequisites */
var processAppend = {}

/* Proceeds all the appends */
processAppend.append = function (act, entity, appends) {
  return new Promise(function (resolve, reject) {
    /* Checks if the entity and the appends array are defined */
    if (entity && appends && appends.length) {
      /* Performs the appends reading */
      processAppend.readAppends(act, entity, appends)
      .then(function (result) { return resolve(result) })
      .catch(function (err) {return reject(err) })
    } else {
      return resolve(entity)
    }
  })
}

/* Reads the appends for one entity */
processAppend.readAppends = function (act, entity, appends) {
  return new Promise(function (resolve, reject) {
    /* Checks if the appends are set */
    if (appends && appends.length) {
      /* Initializes */
      var promises = []
      /* Sets the promises */
      for (var i = 0; i < appends.length; i++) {
        promises.push(processAppend.readOneAppend(act, entity, appends[i]))
      }
      /* Runs the promises */
      if (promises.length > 0) {
        promise.all(promises)
        .then(function (results) {
          /* Loops on each append result */
          for (var i = 0; i < results.length; i++) {
            if (results[i]) {
              entity = Object.assign(results[i], entity)
            }
          }
          return resolve(entity)
        })
      } else {
        return resolve(entity)
      }
    } else {
      return resolve(entity)
    }
  })
}

/* Proceeds appends on a list of entities */
processAppend.readAppendsForList = function (act, list, appends) {
  return new Promise(function (resolve, reject) {
    /* Initializes */
    var promises = []
    /* Loops on the entites */
    for (var i = 0; i < list.length; i++) {
      promises.push(processAppend.readAppends(act, list[i], appends))
    }
    /* Runs the promises */
    if (promises.length > 0) {
      promise.all(promises)
      .then(function (results) { return resolve(results) })
    } else {
      return resolve(list)
    }
  })
}

/* Reads the data specified by the append */
processAppend.readOneAppend = function (act, entity, append) {
  return new Promise(function (resolve, reject) {
    /* Initializes */
    var action = Object.assign({}, append.action)
    var fieldname = append.resultname ? append.resultname : append.action.role
    /* Adds the optional select to the action */
    if (append.select) {
      /* The selection value must be set in the entity */
      if (entity[append.select.valuename]) {
        /* Initializes */
        if (!action.select) { action.select = {}}
        /* Adds the select */
        action.select[append.select.idname] = entity[append.select.valuename]
        /* Performs the action */
        act(action)
        .then(function (result) {
          /* Returns the result */
          var response = {}
          response[fieldname] = result
          return resolve(response)
        })
        .catch(function (err) { return reject(err) })
      } else {
        /* The selection value is not set in the entity: the selection cannot be performed */
        return resolve(null)
      }
    } else {
      /* No select required: performs the action */
      act(action)
      .then(function (result) {
        /* Returns the result */
        var response = {}
        response[fieldname] = result
        return resolve(response)
      })
      .catch(function (err) { return reject(err) })
    }
  })
}

/* Exports this plugin */
module.exports = processAppend
