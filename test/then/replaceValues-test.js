/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

/* Prerequisites */
const processThen = require('../../process/then')
const testFunctions = require('../functions')

/* Test prerequisites */
const Code = require('code')
const Lab = require('lab', {timeout: testFunctions.timeout})
const lab = (exports.lab = Lab.script())
const after = lab.after
const describe = lab.describe
const it = lab.it
const expect = Code.expect

/* Backups functions before mock */
const backups = new Map()
backups.set(processThen, [
  ['replaceValuesForProperty', processThen.replaceValuesForProperty.bind({})]
])

describe('then replaceValues', function () {
  after((done) => {
    /* Restores the origin functions */
    for (var [key, values] of backups) {
      values.forEach(function (item) { key[item[0]] = item[1] })
    }
    done()
  })
  /* Bad arguments */
  it('no args', function (fin) {
    /* Fires the test */
    var newObject = processThen.replaceValues(null, null)
    /* Checks the result */
    expect(newObject).to.equal({})
    fin()
  })
  /* Object without properties */
  it('not an object', function (fin) {
    /* Fires the test */
    var newObject = processThen.replaceValues(null, 12345)
    /* Checks the result */
    expect(newObject).to.equal({})
    fin()
  })
  it('empty object', function (fin) {
    /* Fires the test */
    var newObject = processThen.replaceValues(null, {})
    /* Checks the result */
    expect(newObject).to.equal({})
    fin()
  })
  /* Object with properties */
  it('simple object', function (fin) {
    /* Mocks the process */
    var newValue = 'abc'
    mockReplaceValuesForProperty(newValue)
    /* Fires the test */
    var newObject = processThen.replaceValues(null, getObject())
    /* Checks the result */
    expect(newObject.role).to.equal(newValue)
    expect(newObject.name).to.equal(newValue)
    expect(newObject.data).to.equal(newValue)
    expect(Object.keys(newObject).length).to.equal(3)
    fin()
  })
})

/* ---------- MOCKS ---------- */

function mockReplaceValuesForProperty (newValue) {
  processThen.replaceValuesForProperty = function (entity, value) {
    return newValue
  }
  return false
}

/* ---------- FUNCTIONS ---------- */

function getObject () {
  return {
    role: 'my_%role%',
    name: '%name%',
    data: {
      id: '123',
      type: '%type%',
      entity: '%_entity%'
    }
  }
}
