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

describe('truncate', function () {
  //
  // Simple truncate
  it('simple', function (fin) {
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Creates before truuncate
    seneca.act({role: role, cmd: 'create', entity: {title: 't1', content: 'c1'}}, function (ignore, result) {
      expect(result.success).to.equal(true)
      seneca.act({role: role, cmd: 'create', entity: {title: 't2', content: 'c2'}}, function (ignore, result) {
        expect(result.success).to.equal(true)
        seneca.act({role: role, cmd: 'create', entity: {title: 't3', content: 'c3'}}, function (ignore, result) {
          expect(result.success).to.equal(true)
          // Calls the query action
          seneca.act({role: role, cmd: 'query'}, function (ignore, queryResult) {
            // Checks result
            expect(queryResult.success).to.equal(true)
            expect(queryResult.count).to.equal(3)
            fin()
          })
        })
      })
    })
  })
  //
})
