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

describe('then getResultEntity', function () {
  /* Bad arguments */
  it('no args', function (fin) {
    /* Fires the test */
    var result = processThen.getResultEntity(null, null, null)
    /* Checks the result */
    expect(result.success).to.equal(true)
    expect(Object.keys(result).length).to.equal(1)
    fin()
  })
  /* With arguments */
  it('no start, no name', function (fin) {
    /* Initializes */
    var args = {
      results: {}
    }
    /* Fires the test */
    var result = processThen.getResultEntity(getEntity(), args, null)
    /* Checks the result */
    expect(result.success).to.equal(true)
    expect(Object.keys(result).length).to.equal(1)
    fin()
  })
  it('with start, no name', function (fin) {
    /* Initializes */
    var args = {
      results: {
        includes_start: true
      }
    }
    /* Fires the test */
    var result = processThen.getResultEntity(getEntity(), args, null)
    /* Checks the result */
    expect(result.success).to.equal(true)
    expect(result.entity).to.equal(getEntity())
    expect(Object.keys(result).length).to.equal(2)
    fin()
  })
  it('no start, with name', function (fin) {
    /* Initializes */
    var args = {
      results: {
        name: 'mytest'
      }
    }
    /* Fires the test */
    var result = processThen.getResultEntity(getEntity(), args, getThenResult())
    /* Checks the result */
    expect(result.success).to.equal(true)
    expect(result.mytest).to.equal(getThenResult())
    expect(Object.keys(result).length).to.equal(2)
    fin()
  })
  it('with start, with name', function (fin) {
    /* Initializes */
    var args = {
      results: {
        includes_start: true,
        name: 'mytest'
      }
    }
    /* Fires the test */
    var result = processThen.getResultEntity(getEntity(), args, getThenResult())
    /* Checks the result */
    expect(result.success).to.equal(true)
    expect(result.entity).to.equal(getEntity())
    expect(result.mytest).to.equal(getThenResult())
    expect(Object.keys(result).length).to.equal(3)
    fin()
  })
})

/* ---------- FUNCTIONS ---------- */

function getEntity () {
  return { id: 'i1' }
}

function getThenResult () {
  return {
    success: true,
    entity: { id: 'i2' }
  }
}
