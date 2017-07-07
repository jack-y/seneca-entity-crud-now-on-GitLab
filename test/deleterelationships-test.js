/* Copyright (c) 2017 e-soa Jacques Desodt, MIT License */
'use strict'

/* Default plugin options */
const role = 'entity-crud-test'
const promise = require('bluebird')

/* Prerequisites */
const Seneca = require('seneca') // eslint-disable-line no-unused-vars
const testFunctions = require('./functions')
const config = require('./relationships-config')

/* Test prerequisites */
const Code = require('code')
const Lab = require('lab', {timeout: testFunctions.timeout})
var lab = (exports.lab = Lab.script())
var describe = lab.describe
var it = lab.it
var expect = Code.expect

describe('deleterelationships', function () {
  //
  // Simple delete
  it('simple', function (fin) {
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    /* Creates the basic entities */
    createBasicEntities(seneca)
    .then(function (result) {
      /* Creates the relationships */
      createRelationships(seneca)
      .then(function (result) {
        /* Runs the delete */
        runDelete(seneca)
        .then(function (result) {
          /* Checks the results */
          checkResults(seneca)
          .then(function (result) {
            fin()
          })
        })
      })
    })
  })
})

/* Entities creation */
/* The configuration file contains the entities declarations */
function createBasicEntities (seneca) {
  return new Promise(function (resolve, reject) {
    var cmds = []
    config.entities.forEach(function (item) {
      var command = createOneEntity(seneca, item)
      cmds.push(command)
    })
    promise.all(cmds)
    .then(function (results) {
      return resolve({success: true})
    })
  })
}

/* Creates a single entity */
function createOneEntity (seneca, item) {
  return new Promise(function (resolve, reject) {
    seneca.act({role: role, name: item.name, cmd: 'create', entity: item.entity}, function (ignore, result) {
      return resolve(result)
    })
  })
}

/* Relationships creation */
/* The configuration file contains the relationships declarations */
function createRelationships (seneca) {
  return new Promise(function (resolve, reject) {
    var cmds = []
    config.entitiesrelationships.forEach(function (item) {
      var command = createOneRelationship(seneca, item)
      cmds.push(command)
    })
    promise.all(cmds)
    .then(function (results) {
      return resolve({success: true})
    })
  })
}

/* Creates a single relationship */
function createOneRelationship (seneca, relationship) {
  return new Promise(function (resolve, reject) {
    // Reads in
    seneca.act({role: role, name: relationship.in.name, cmd: 'query', select: {'name': relationship.in.data}}, function (ignore, result) {
      var inId = result.list[0].id
      // Reads out
      seneca.act({role: role, name: relationship.out.name, cmd: 'query', select: {'name': relationship.out.data}}, function (ignore, result) {
        var outId = result.list[0].id
        // Creates relationship
        var entity = {}
        entity['id_' + relationship.in.name] = inId
        entity['id_' + relationship.out.name] = outId
        seneca.act({role: role, name: relationship.name, cmd: 'create', entity: entity}, function (ignore, result) {
          return resolve(result)
        })
      })
    })
  })
}

/* Deletes the entity and its relationships */
/* The configuration file contains the name of the entity to be deleted */
function runDelete (seneca) {
  return new Promise(function (resolve, reject) {
    // Reads the brand to delete
    seneca.act({role: role, name: 'brand', cmd: 'query', select: {'name': config.deletebrandname}}, function (ignore, result) {
      // Deletes the brand
      var idBrand = result.list[0].id
      seneca.act({role: role, name: 'brand', cmd: 'delete', id: idBrand}, function (ignore, result) {
        // Deletes the relationships
        seneca.act({role: role, cmd: 'deleterelationships', id: idBrand, relationships: config.relationships}, function (ignore, result) {
          return resolve(result)
        })
      })
    })
  })
}

/* Checks if the entity and its relationships are deleted */
/* The configuration file contains the name of the entity to be deleted */
function checkResults (seneca) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      // Checks deleted brand
      seneca.act({role: role, name: 'brand', cmd: 'query', select: {'name': config.deletebrandname}}, function (ignore, result) {
        expect(result.success).to.equal(true)
        expect(result.count).to.equal(0)
        // Loops on results
        var cmds = []
        config.results.forEach(function (item) {
          var command = chekOneResult(seneca, item)
          cmds.push(command)
        })
        promise.all(cmds)
        .then(function (results) {
          return resolve({success: true})
        })
      })
    }, 500)
  })
}

function chekOneResult (seneca, expected) {
  return new Promise(function (resolve, reject) {
    // Checks
    seneca.act({role: role, name: expected.name, cmd: 'query'}, function (ignore, result) {
      expect(result.success).to.equal(true)
      expect(result.count).to.equal(expected.count)
      return resolve({success: true})
    })
  })
}
