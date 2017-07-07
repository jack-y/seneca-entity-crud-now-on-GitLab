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

describe('update', function () {
  //
  // Simple update
  it('simple', function (fin) {
    // Initializes the data
    var content = 'Listen to this song written by David Bowie.'
    var updateTitle = 'Life on Mars'
    var updateTag = 'A tag'
    var entity = {title: 'Life on Venus', content: content}
    var updateEntity = null
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Creates before read
    seneca.act({role: role, cmd: 'create', entity: entity}, function (ignore, result) {
      // Checks result
      expect(result.entity.id).to.not.equal(null)
      entity = result.entity
      updateEntity = {id: result.entity.id, title: updateTitle, tag: updateTag}
      // Update
      seneca.act({role: role, cmd: 'update', entity: updateEntity}, function (ignore, updateResult) {
        // Checks result
        expect(updateResult.success).to.equal(true)
        // Read
        seneca.act({role: role, cmd: 'read', id: entity.id}, function (ignore, readResult) {
          expect(readResult.success).to.equal(true)
          expect(readResult.entity.title).to.equal(updateTitle)
          expect(readResult.entity.content).to.equal(content)
          expect(readResult.entity.tag).to.equal(updateTag)
          fin()
        })
      })
    })
  })

  // Update returns no namespace
  it('no namespace', function (fin) {
    // Initializes the data
    var content = 'Listen to this song written by David Bowie.'
    var updateTitle = 'Life on Mars'
    var updateTag = 'A tag'
    var entity = {title: 'Life on Venus', content: content}
    var updateEntity = null
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    // Creates before read
    seneca.act({role: role, cmd: 'create', entity: entity}, function (ignore, result) {
      // Checks result
      expect(result.entity.id).to.not.equal(null)
      entity = result.entity
      updateEntity = {id: result.entity.id, title: updateTitle, tag: updateTag}
      // Update
      seneca.act({role: role, cmd: 'update', entity: updateEntity, nonamespace: true}, function (ignore, updateResult) {
        // Checks result
        expect(updateResult.success).to.equal(true)
        expect(updateResult.entity.entity$).to.not.exist()
      // Read
        seneca.act({role: role, cmd: 'read', id: entity.id}, function (ignore, readResult) {
          expect(readResult.success).to.equal(true)
          expect(readResult.entity.title).to.equal(updateTitle)
          expect(readResult.entity.content).to.equal(content)
          expect(readResult.entity.tag).to.equal(updateTag)
          fin()
        })
      })
    })
  })
  //
})
