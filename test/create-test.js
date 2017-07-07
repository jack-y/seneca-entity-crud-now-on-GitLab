/* Copyright (c) 2017 e-soa Jacques Desodt, MIT License */
'use strict'

/* Default plugin options */
const role = 'entity-crud-test'

/* Prerequisites */
const Seneca = require('seneca') // eslint-disable-line no-unused-vars
const testFunctions = require('./functions')

/* Test prerequisites */
const Code = require('code')
const Lab = require('lab', {timeout: testFunctions.timeout})
var lab = (exports.lab = Lab.script())
var describe = lab.describe
var it = lab.it
var expect = Code.expect

describe('create', function () {
  //
  // Create with no data
  it('no data', function (fin) {
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Calls the create action
    seneca.act({role: role, cmd: 'create'}, function (ignore, result) {
      // Checks result
      expect(result.success).to.equal(false)
      fin()
    })
  })

  // Create with no validation function
  it('no validation function', function (fin) {
    // Initializes the data
    var entity = {title: 'A post without content'}
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Calls the create action
    seneca.act({role: role, cmd: 'create', entity: entity, validate: true}, function (ignore, result) {
      // Checks result
      expect(result.success).to.equal(true)
      fin()
    })
  })

  // Create with bad validation
  it('bad validation', function (fin) {
    // Initializes the data
    var entity = {title: 'A post without content'}
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Calls the create action
    seneca.act({role: role, cmd: 'create', entity: entity, validate: true, validate_function: testFunctions.validatePost}, function (ignore, result) {
      // Checks result
      expect(result.success).to.equal(false)
      expect(result.errors.length).to.equal(1)
      fin()
    })
  })

  // Create with validation OK
  it('validation OK', function (fin) {
    // Initializes the data
    var entity = {title: 'A good post', content: 'lorem ipsum'}
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Calls the create action
    seneca.act({role: role, cmd: 'create', entity: entity, validate: true, validate_function: testFunctions.validatePost}, function (ignore, result) {
      // Checks result
      expect(result.success).to.equal(true)
      expect(result.entity.id).to.not.equal(null)
      expect(result.entity.last_update).to.not.equal(null)
      fin()
    })
  })
  // Create OK with no validation
  it('simple OK', function (fin) {
    // Initializes the data
    var entity = {title: 'The life of cats', content: '<h1>This is a great post about cats</h1><p>Maoww...</p>'}
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Calls the create action
    seneca.act({role: role, cmd: 'create', entity: entity}, function (ignore, result) {
      // Checks result
      expect(result.success).to.equal(true)
      expect(result.entity.id).to.not.equal(null)
      expect(result.entity.last_update).to.not.equal(null)
      fin()
    })
  })
  //
})
