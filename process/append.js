/* Copyright (c) 2018 e-soa Jacques Desodt */
'use strict'

/* APPEND PATTERN
   appends: [ {resultname: 'myname', action: {role: aRole, cmd: 'read/query', ...}, select: {idname: anIdName, valuename: aValueName}}, { ... }, ...]
   See: https://github.com/jack-y/seneca-entity-crud/blob/master/README-APPENDS.md
*/

var processAppend = {}

/* Proceeds all the appends */
processAppend.append = function (act, entity, appends) {
  return new Promise(function (resolve, reject) {
    /* Checks if the entity and the appends array are defined */
    if (entity && appends && appends.length) {
      /* Performs the appends reading */
      processAppend.readAppends(act, entity, appends)
      .then(function (result) {
        /* Returns the read entity with appends */
        return resolve(result.entity)
      })
      .catch(function (err) { return reject(err) })
    } else {
      return resolve(entity)
    }
  })
}

/* Reads the appends for one entity */
processAppend.readAppends = function (act, entity, appends) {
  return new Promise(function (resolve, reject) {
    var count = 0
    var updatedEntity = entity
    /* Loops on each join */
    appends.forEach(function (append, index) {
      processAppend.readOneAppend(act, updatedEntity, append)
      .then(function (result) {
        updatedEntity = result.entity
        if (++count === appends.length) {
          /* When all appends are done, returns the full entity */
          return resolve({entity: updatedEntity})
        }
      })
      .catch(function (err) { return reject(err) })
    })
  })
}

/* Process appends on a list of entities */
processAppend.readAppendsForList = function (act, list, appends) {
  return new Promise(function (resolve, reject) {
    if (list.length > 0 && appends && appends.length > 0) {
      var newList = []
      var itemread = 0
      /* Loops on each entity */
      list.forEach(function (entity, index) {
        /* Proceeds the appends on the entity */
        processAppend.readAppends(act, entity, appends)
        .then(function (result) {
          newList.push(result.entity)
          if (++itemread === list.length) {
            /* When all appends are done, returns the full list */
            return resolve({list: newList})
          }
        })
      })
    } else {
      return resolve({list: list})
    }
  })
}

/* Reads the data specified by the append */
processAppend.readOneAppend = function (act, originEntity, append) {
  return new Promise(function (resolve, reject) {
    /* Gets the action */
    var action = append.action
    /* Adds the optional select to the action */
    if (append.select) {
      /* Initializes */
      if (!action.select) { action.select = {}}
      /* Adds the select */
      action.select[append.select.idname] = originEntity[append.select.valuename]
    }
    /* Sets the new field name */
    var fieldname = append.resultname ? append.resultname : append.action.role
    /* Performs the action */
    act(action)
    .then(function (result) {
      /* Adds the result to the origin entity */
      originEntity[fieldname] = result
      return resolve({entity: originEntity})
    })
    .catch(function (err) { return reject(err) })
  })
}

/* Exports this plugin */
module.exports = processAppend
