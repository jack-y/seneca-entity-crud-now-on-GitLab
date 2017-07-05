/* Copyright (c) 2017 e-soa Jacques Desodt */
'use strict'

/* Default plugin options */
const role = 'entity-crud-test'
const entityName = 'entity_test'
const entityCrud = require('./entity-crud')
const config = require('./config/test-relationships')

/* Node modules */
const promise = require('bluebird')
const seneca = require('seneca')()
const assert = require('assert')

// .act() method as promise; to learn more about this technique see:
// http://bluebirdjs.com/docs/features.html#promisification-on-steroids
const act = promise.promisify(seneca.act, {context: seneca})

seneca
  .use('basic')
  .use('entity')
  .use('mem-store')
  .use(entityCrud, {
    name: entityName,
    role: role,
    last_update: false
  })
  .error(assert.fail)

seneca.ready(function (err) {
  if (err) { throw err }
  /* Creates the basic entities */
  createBasicEntities()
  .then(function (result) {
    /* Creates the relationships */
    createRelationships()
    .then(function (result) {
      /* Output entities before delete */
      console.log('******************** BEFORE DELETE BRAND **********************')
      outResults()
      .then(function (result) {
        /* Runs the delete */
        runDelete()
        .then(function (result) {
          /* Timeout as deletion is in asynchronous mode */
          setTimeout(function () {
            /* Checks the results */
            console.log('******************** AFTER DELETE BRAND **********************')
            outResults()
            .then(function (result) {
              checkResults()
              .then(function (result) {
                console.log('entity-crud: relationships tests successful.')
                /* Ends seneca */
                seneca.close((err) => {
                  if (err) { console.log(err) }
                })
              })
            })
          }, 1000)
        })
      })
    })
  })
})

/* Entities creation */
/* The configuration file contains the entities declarations */
function createBasicEntities () {
  return new Promise(function (resolve, reject) {
    var cmds = []
    config.entities.forEach(function (item) {
      var command = act({role: role, name: item.name, cmd: 'create', entity: item.entity})
      cmds.push(command)
    })
    promise.all(cmds)
    .then(function (results) {
      return resolve({success: true})
    })
  })
}

/* Relationships creation */
/* The configuration file contains the relationships declarations */
function createRelationships () {
  return new Promise(function (resolve, reject) {
    var cmds = []
    config.entitiesrelationships.forEach(function (item) {
      var command = createOneRelationship(item)
      cmds.push(command)
    })
    promise.all(cmds)
    .then(function (results) {
      return resolve({success: true})
    })
  })
}

/* Creates a single relationship */
function createOneRelationship (relationship) {
  return new Promise(function (resolve, reject) {
    // Reads in
    act({role: role, name: relationship.in.name, cmd: 'query', select: {'name': relationship.in.data}})
    .then(function (result) {
      var inId = result.list[0].id
      // Reads out
      act({role: role, name: relationship.out.name, cmd: 'query', select: {'name': relationship.out.data}})
      .then(function (result) {
        var outId = result.list[0].id
        // Creates relationship
        var entity = {}
        entity['id_' + relationship.in.name] = inId
        entity['id_' + relationship.out.name] = outId
        act({role: role, name: relationship.name, cmd: 'create', entity: entity})
        .then(function (result) {
          return resolve({success: true})
        })
      })
    })
  })
}

/* Deletes the entity and its relationships */
/* The configuration file contains the name of the entity to be deleted */
function runDelete () {
  return new Promise(function (resolve, reject) {
    // Reads the brand to delete
    act({role: role, name: 'brand', cmd: 'query', select: {'name': config.deletebrandname}})
    .then(function (result) {
      // Deletes the brand
      var idBrand = result.list[0].id
      act({role: role, name: 'brand', cmd: 'delete', id: idBrand})
      .then(function (result) {
        // Deletes the relationships
        act({role: role, cmd: 'deleterelationships', deleteresult: result, id: idBrand, relationships: config.relationships})
        .then(function (result) {
          return resolve({success: true})
        })
      })
    })
  })
}

/* Outputs the entities and relationships count */
function outResults () {
  return new Promise(function (resolve, reject) {
    var cmds = []
    config.names.forEach(function (item) {
      var command = act({role: role, name: item, cmd: 'query'})
      cmds.push(command)
    })
    promise.all(cmds)
    .then(function (results) {
      results.forEach(function (result) {
        console.log(result.count, JSON.stringify(result.list))
      })
      return resolve({success: true})
    })
  })
}

/* Checks if the entity and its relationships are deleted */
/* The configuration file contains the name of the entity to be deleted */
function checkResults () {
  return new Promise(function (resolve, reject) {
    // Checks deleted brand
    act({role: role, name: 'brand', cmd: 'query', select: {'name': config.deletebrandname}})
    .then(function (result) {
      assert.ok(result.success)
      assert.equal(result.count, 0)
      // Loops on results
      var cmds = []
      config.results.forEach(function (item) {
        var command = chekOneResult(item)
        cmds.push(command)
      })
      promise.all(cmds)
      .then(function (results) {
        return resolve({success: true})
      })
    })
  })
}

function chekOneResult (expected) {
  return new Promise(function (resolve, reject) {
    // Checks
    act({role: role, name: expected.name, cmd: 'query'})
    .then(function (result) {
      assert.ok(result.success)
      assert.equal(result.count, expected.count)
      return resolve({success: true})
    })
  })
}
