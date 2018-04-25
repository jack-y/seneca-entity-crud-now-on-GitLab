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

describe('then replaceValuesForString', function () {
  /* Bad arguments */
  it('no args', function (fin) {
    /* Fires the test */
    var newValue = processThen.replaceValuesForString(null, null)
    /* Checks the result */
    expect(newValue).to.not.exist()
    fin()
  })
  it('no string value', function (fin) {
    /* Fires the test */
    var newValue = processThen.replaceValuesForString(null, 12345)
    /* Checks the result */
    expect(newValue).to.not.exist()
    fin()
  })
  it('no entity object', function (fin) {
    /* Fires the test */
    var newValue = processThen.replaceValuesForString(null, getValue())
    /* Checks the result */
    expect(newValue).to.equal(getValue())
    fin()
  })
  /* Patterns don't match */
  it('no pattern', function (fin) {
    /* Initializes */
    var value = 'abc'
    /* Fires the test */
    var newValue = processThen.replaceValuesForString(getEntity(), value)
    /* Checks the result */
    expect(newValue).to.equal(value)
    fin()
  })
  it('others patterns', function (fin) {
    /* Initializes */
    var value = '%other% and %another%'
    /* Fires the test */
    var newValue = processThen.replaceValuesForString(getEntity(), value)
    /* Checks the result */
    expect(newValue).to.equal(value)
    fin()
  })
  /* Patterns match */
  it('patterns match', function (fin) {
    /* Fires the test */
    var newValue = processThen.replaceValuesForString(getEntity(), getValue())
    /* Checks the result */
    expect(newValue).to.equal('My kingdom for a bottle!')
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

function getValue () {
  return 'My %role% for a %product%!'
}
