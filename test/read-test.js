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

describe('read', function () {
  //
  // Simple read
  it('simple', function (fin) {
    // Initializes data
    var entity = {title: 'Life on Mars', content: 'Listen to this song written by David Bowie.'}
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Creates before read
    seneca.act({role: role, cmd: 'create', entity: entity}, function (ignore, result) {
      // Checks result
      expect(result.entity.id).to.not.equal(null)
      entity = result.entity
      // Read
      seneca.act({role: role, cmd: 'read', id: result.entity.id}, function (ignore, readResult) {
        // Checks result
        expect(readResult.success).to.equal(true)
        expect(readResult.entity.title).to.equal(entity.title)
        fin()
      })
    })
  })

  // Simple read with defaults values
  it('defaults', function (fin) {
    // Initializes data
    var content = 'Listen to this song written by David Bowie.'
    var entity = {title: 'Life on Mars', content: content}
    var release = 1971
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Creates before read
    seneca.act({role: role, cmd: 'create', entity: entity}, function (ignore, result) {
      // Checks result
      expect(result.entity.id).to.not.equal(null)
      entity = result.entity
      // Read
      seneca.act({role: role, cmd: 'read', id: result.entity.id, defaults: {content: 'default content', release: release}}, function (ignore, readResult) {
        // Checks result
        expect(readResult.success).to.equal(true)
        expect(readResult.entity.title).to.equal(entity.title)
        expect(readResult.entity.content).to.equal(content)
        expect(readResult.entity.release).to.equal(release)
        fin()
      })
    })
  })

  // No namespace
  it('no namespace', function (fin) {
    // Initializes data
    var entity = {title: 'Security', content: '<h1>Security</h1><p>We don\'t want namespaces!</p>'}
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Creates before read
    seneca.act({role: role, cmd: 'create', entity: entity}, function (ignore, createResult) {
      // Checks result
      expect(createResult.entity.id).to.not.equal(null)
      entity = createResult.entity
      // Read
      seneca.act({role: role, cmd: 'read', id: createResult.entity.id, nonamespace: true}, function (ignore, result) {
        // Checks result
        expect(result.success).to.equal(true)
        expect(result.entity.title).to.equal(entity.title)
        expect(result.entity.entity$).to.not.exist()
        fin()
      })
    })
  })

  // Read on error
  it('not found', function (fin) {
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Read
    seneca.act({role: role, cmd: 'read', id: 'this-is-not-a-good-id'}, function (ignore, result) {
      // Checks result
      expect(result.success).to.equal(false)
      fin()
    })
  })
  //
})
