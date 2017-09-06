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

describe('check', function () {
  //
  // All is OK
  it('ok', function (fin) {
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Test
    seneca.act({role: role, cmd: 'check'}, function (ignore, result) {
      // Checks result
      expect(result.success).to.equal(true)
      fin()
    })
  })
  // Error on create
  it('error on create', function (fin) {
    // Initializes
    var error = 'error on create'
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Mocks the create action
    seneca.add('role:' + role + ',name:entity_test,cmd:create', function (args, done) {
      return done(null, {success: false, errors: [error]})
    })
    // Test
    seneca.act({role: role, cmd: 'check'}, function (ignore, result) {
      // Checks result
      expect(result.success).to.equal(false)
      expect(result.errors[0]).to.equal(error)
      expect(result.command).to.equal('create')
      fin()
    })
  })
  // Error on delete
  it('error on delete', function (fin) {
    // Initializes
    var error = 'error on delete'
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Mocks the delete action
    seneca.add('role:' + role + ',name:entity_test,cmd:delete', function (args, done) {
      // Returns the delete on error
      return done(null, {success: false, errors: [error]})
    })
    // Test
    seneca.act({role: role, cmd: 'check'}, function (ignore, result) {
      // Checks result
      expect(result.success).to.equal(false)
      expect(result.errors[0]).to.equal(error)
      expect(result.command).to.equal('delete')
      fin()
    })
  })
  //
})
