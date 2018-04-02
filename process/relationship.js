/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

/* Prerequisites */
const promise = require('bluebird')

var processRelationship = {}

/* Deletes one relationship in asynchronous mode
   The master ID is in the args
   The master may be already deleted */
processRelationship.deleteOneRelationship = function (act, options, args, relationship) {
  return new Promise(function (resolve, reject) {
    /* Gets the namespace */
    var zone = relationship.location.zone ? relationship.location.zone : options.zone
    var base = relationship.location.base ? relationship.location.base : options.base
    var name = relationship.location.name ? relationship.location.name : options.name
    /* Sets the query select objet used to find the relational entities */
    var select = {}
    select[relationship.in_idname] = args.id
    /* Finds the relational entities */
    act({role: relationship.location.role, zone: zone, base: base, name: name, cmd: 'query', select})
    .then(function (result) {
      var queryResult = {success: result.success, role: relationship.location.role, zone: zone, base: base, name: name, count: result.count}
      /* Checks if the query is successful */
      if (result.success) {
        /* Loops on each relationship data */
        var promises = []
        result.list.forEach(function (item) {
          promises.push(processRelationship.deleteOneRelationshipData(act, options, item, relationship))
        })
        /* Runs all the promises */
        promise.all(promises)
        .then(function (results) {
          /* Returns the query result before delete */
          return resolve(queryResult)
        })
      } else {
        /* The query returns bad result
           Returns the query result before delete */
        return resolve(queryResult)
      }
    })
    .catch(function (err) { return reject(err) })
  })
}

/* Deletes one relationship data in asynchronous mode */
processRelationship.deleteOneRelationshipData = function (act, options, item, relationship) {
  return new Promise(function (resolve, reject) {
    /* Gets the namespace */
    var zone = relationship.location.zone ? relationship.location.zone : options.zone
    var base = relationship.location.base ? relationship.location.base : options.base
    var name = relationship.location.name ? relationship.location.name : options.name
    /* Deletes the relationship data in asynchronous mode */
    act({role: relationship.location.role, zone: zone, base: base, name: name, cmd: 'delete', id: item.id})
    /* Gets the slave entity ID */
    var outId = item[relationship.out.idname]
    /* Gets the out namespace */
    var outZone = relationship.out.location.zone ? relationship.out.location.zone : options.zone
    var outBase = relationship.out.location.base ? relationship.out.location.base : options.base
    var outName = relationship.out.location.name ? relationship.out.location.name : options.name
    /* Checks if the relationship slave must also be deleted */
    if (relationship.out.delete) {
    /* Asynchronous slave delete: no return */
      act({role: relationship.out.location.role, zone: outZone, base: outBase, name: outName, cmd: 'delete', id: outId})
    }
    /* RECURSION: Checks if a subrelationship exists */
    if (relationship.relationships) {
      /* Fires the subrelationship deletion in asynchronous mode */
      act({
        role: relationship.out.location.role,
        zone: outZone,
        base: outBase,
        name: outName,
        cmd: 'deleterelationships',
        id: outId,
        relationships: relationship.relationships
      })
    }
    return resolve({success: true})
  })
}

/* Exports this plugin */
module.exports = processRelationship
