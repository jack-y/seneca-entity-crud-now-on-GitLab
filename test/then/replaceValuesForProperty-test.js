/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

/* Prerequisites */
const processThen = require('../../process/then')
const testFunctions = require('../functions')

/* Test prerequisites */
const Code = require('code')
const Lab = require('lab', {timeout: testFunctions.timeout})
const lab = (exports.lab = Lab.script())
const describe = lab.describe
const it = lab.it
const expect = Code.expect

describe('then replaceValuesForProperty', function () {
  /* Bad arguments */
  it('no args', function (fin) {
    /* Fires the test */
    var newValue = processThen.replaceValuesForProperty(null, null)
    /* Checks the result */
    expect(newValue).to.not.exist()
    fin()
  })
  it('no string nor object value', function (fin) {
    /* Initializes */
    var value = 12345
    /* Fires the test */
    var newValue = processThen.replaceValuesForProperty(null, value)
    /* Checks the result */
    expect(newValue).to.equal(value)
    fin()
  })
  it('no entity object', function (fin) {
    /* Fires the test */
    var newValue = processThen.replaceValuesForProperty(null, getStringValue())
    /* Checks the result */
    expect(newValue).to.equal(getStringValue())
    fin()
  })
  /* String */
  it('string', function (fin) {
    /* Fires the test */
    var newValue = processThen.replaceValuesForProperty(getEntity(), getStringValue())
    /* Checks the result */
    expect(newValue).to.equal('My kingdom for a bottle!')
    fin()
  })
  /* Object */
  it('object', function (fin) {
    /* Fires the test */
    var newValue = processThen.replaceValuesForProperty(getEntity(), getObjectValue())
    /* Checks the result */
    expect(newValue.comment).to.equal('My kingdom for a bottle!')
    fin()
  })
})

/* ---------- FUNCTIONS ---------- */

function getEntity () {
  return {
    command: 'test',
    data: {
      id: '123'
    },
    product: 'bottle',
    role: 'kingdom'
  }
}

function getObjectValue () {
  return {
    comment: 'My %role% for a %product%!'
  }
}

function getStringValue () {
  return 'My %role% for a %product%!'
}
