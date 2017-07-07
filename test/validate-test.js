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

describe('validate', function () {
  //
  // Validation OK
  it('ok', function (fin) {
    // Initializes the data
    var entity = {title: 'A post', content: 'Hi guys!'}
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Calls the validate action
    seneca.act({role: role, cmd: 'validate', entity: entity, validate_function: testFunctions.validatePost}, function (ignore, result) {
      // Checks result
      expect(result.success).to.equal(true)
      fin()
    })
  })
  // Validation bad
  it('bad', function (fin) {
    // Initializes the data
    var entity = {title: 'A post without content'}
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Calls the validate action
    seneca.act({role: role, cmd: 'validate', entity: entity, validate_function: testFunctions.validatePost}, function (ignore, result) {
      // Checks result
      expect(result.success).to.equal(false)
      expect(result.errors.length).to.equal(1)
      fin()
    })
  })
  //
})
