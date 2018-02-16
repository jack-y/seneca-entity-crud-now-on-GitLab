/* Copyright (c) 2018 e-soa Jacques Desodt */
'use strict'

/* JOIN PATTERN
   joins: [ {role: 'myrole', idname: anIdName, resultname: anotherName }, { ... }, ...]
   See: https://github.com/jack-y/seneca-entity-crud/blob/master/README-JOINS.md
*/

var processJoin = {}

/* Proceeds all the joins */
processJoin.join = function (act, entity, joins) {
  return new Promise(function (resolve, reject) {
    /* Checks if the entity and the joins array are defined */
    if (entity && joins) {
      /* Performs the joins reading */
      processJoin.readJoins(act, entity, joins)
      .then(function (result) {
        /* Returns the read entity with joins */
        return resolve(result.entity)
      })
      .catch(function (err) { return reject(err) })
    } else {
      return resolve(entity)
    }
  })
}

/* Reads the joins for one entity */
processJoin.readJoins = function (act, entity, joins) {
  return new Promise(function (resolve, reject) {
    var count = 0
    /* Loops on each join */
    joins.forEach(function (join, index) {
      processJoin.readOneJoin(act, entity, join)
      .then(function (result) {
        if (++count === joins.length) {
          /* When all joins are done, returns the full entity */
          return resolve({entity: result.entity})
        }
      })
      .catch(function (err) { return reject(err) })
    })
  })
}

/* Process joins on a list of entities */
processJoin.readJoinsForList = function (act, list, joins) {
  return new Promise(function (resolve, reject) {
    if (list.length > 0 && joins && joins.length > 0) {
      var newList = []
      var itemread = 0
      /* Loops on each entity */
      list.forEach(function (entity, index) {
        /* Proceeds the joins on the entity */
        processJoin.readJoins(act, entity, joins)
        .then(function (result) {
          newList.push(result.entity)
          if (++itemread === list.length) {
            /* When all joins are done, returns the full list */
            return resolve({list: newList})
          }
        })
      })
    } else {
      return resolve({list: list})
    }
  })
}

/* Reads the entity specified by the join */
processJoin.readOneJoin = function (act, originEntity, join) {
  return new Promise(function (resolve, reject) {
    /* Gets the namespace */
    var zone = join.zone ? join.zone : null
    var base = join.base ? join.base : null
    var name = join.name ? join.name : null
    /* Sets the ID and the new field name */
    var id = originEntity[join.idname]
    var fieldname = join.resultname ? join.resultname : join.role
    /* Reads the entity by its ID */
    act({role: join.role, zone: zone, base: base, name: name, cmd: 'read', id: id, joins: join.joins, nonamespace: join.nonamespace})
    .then(function (result) {
      if (result.success) {
        /* Adds the result to the origin entity */
        originEntity[fieldname] = result.entity
      }
      /* When read is done, returns the full entity */
      return resolve({entity: originEntity})
    })
    .catch(function (err) { return reject(err) })
  })
}

/* Exports this plugin */
module.exports = processJoin
