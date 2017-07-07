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

describe('count', function () {
  //
  // Simple
  it('all', function (fin) {
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Creates posts
    testFunctions.createPosts(seneca, role, function (results) {
      // Retrieves all data
      seneca.act({role: role, cmd: 'count'}, function (ignore, result) {
        // Checks result
        expect(result.success).to.equal(true)
        expect(result.count).to.equal(testFunctions.getPosts().length)
        fin()
      })
    })
  })

  // Select on field
  it('count title', function (fin) {
    /* Initializes */
    var title = 'Tuesday'
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Creates posts
    testFunctions.createPosts(seneca, role, function (results) {
      // Retrieves all data
      seneca.act({role: role, cmd: 'count', select: {title: title}}, function (ignore, result) {
        // Checks result
        expect(result.success).to.equal(true)
        expect(result.count).to.equal(testFunctions.getTitleCount(title))
        fin()
      })
    })
  })

  // Deep count
  it('deep count', function (fin) {
    // Initializes
    var zipcode = '59491'
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Creates posts
    testFunctions.createPosts(seneca, role, function (results) {
      // Retrieves all data
      seneca.act({
        role: role,
        cmd: 'count',
        deepselect: [{ property: 'data.zipcode', value: zipcode }]},
        function (ignore, result) {
          // Checks result
          expect(result.success).to.equal(true)
          expect(result.count).to.equal(testFunctions.getZipcodeCount(zipcode))
          // Another test which return no data
          // Retrieves all data
          seneca.act({
            role: role,
            cmd: 'count',
            select: {title: 'Monday'},
            deepselect: [{property: 'data.zipcode', value: zipcode}]},
            function (ignore, result) {
              // Checks result
              expect(result.success).to.equal(true)
              expect(result.count).to.equal(0)
              fin()
            })
        })
    })
  })
  //
})
