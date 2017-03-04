/* Copyright (c) 2017 e-soa Jacques Desodt */
'use strict'

/* Prerequisites */
const promise = require('bluebird')
const seneca = require('seneca')()
const entityCrud = require('./entity-crud')

/* Promisify seneca actions */
const act = promise.promisify(seneca.act, {context: seneca})

/* Initializations */
seneca
  .use('entity')
  .use(entityCrud, {
    name: 'join'
  })

/* JOINS feature */
var joins = {}

/* Process joins on one entity */
joins.read = function (entity, joinsList) {
  return new Promise(function (resolve, reject) {
    // Loops on each join
    joinsList.forEach(function (join, index) {
      console.log('joins read a join: ' + JSON.stringify(join))
      readJoin(entity, join)
    })
    // When all joins are done, returns the full entity
    resolve({entity: entity})
  })
}

/* Process joins on a list of entities */
joins.readList = function (list, joinsList) {
  return new Promise(function (resolve, reject) {
    var newList = []
    // Loops on each entity of the list
    list.forEach(function (entity, index) {
      // Process joins on the entity
      joins.read(entity, joinsList)
      .then(function (result) {
        newList.push(result.entity)
      })
    })
    // When all joins are done, returns the full list
    resolve({list: newList})
  })
}

/* Reads the entity specified by the join */
function readJoin (originEntity, join) {
  // Sets the ID and new field name
  var id = originEntity[join.idname]
  var fieldname = join.resultname ? join.resultname : join.role
  console.log('joins readJoin: ' + JSON.stringify(join))
  // Reads the entity by its ID
  act({role: join.role, cmd: 'read', id: id, joins: join.joins})
  .then(function (result) {
    if (result.succes) {
      // Adds the result to the origin entity
      originEntity[fieldname] = result.entity
    }
  })
}

// Exports the module
module.exports = joins
