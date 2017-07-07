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

describe('delete', function () {
  //
  // Simple delete
  it('simple', function (fin) {
    // Initializes the data
    var entity = {title: 'I want to be removed', content: 'Goodbye Cruel World.'}
    var id = null
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Creates before read
    seneca.act({role: role, cmd: 'create', entity: entity}, function (ignore, result) {
      // Checks result
      expect(result.entity.id).to.not.equal(null)
      id = result.entity.id
      // Delete
      seneca.act({role: role, cmd: 'delete', id: id}, function (ignore, deleteResult) {
        // Checks result
        expect(deleteResult.success).to.equal(true)
        // Read
        seneca.act({role: role, cmd: 'read', id: id}, function (ignore, readResult) {
          expect(readResult.success).to.equal(false)
          fin()
        })
      })
    })
  })
  //
})
