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

describe('then getResultList', function () {
  /* Bad arguments */
  it('no args', function (fin) {
    /* Fires the test */
    var result = processThen.getResultList(null, null, null)
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
    var result = processThen.getResultList(null, args, null)
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
    var result = processThen.getResultList(getListResult(), args, null)
    /* Checks the result */
    expect(result.success).to.equal(true)
    expect(result.list).to.equal(getListResult())
    expect(result.count).to.equal(getListResult().length)
    expect(Object.keys(result).length).to.equal(3)
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
    var result = processThen.getResultList(getListResult(), args, getThenResult())
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
    var result = processThen.getResultList(getListResult(), args, getThenResult())
    /* Checks the result */
    expect(result.success).to.equal(true)
    expect(result.list).to.equal(getListResult())
    expect(result.count).to.equal(getListResult().length)
    expect(result.mytest).to.equal(getThenResult())
    expect(Object.keys(result).length).to.equal(4)
    fin()
  })
})

/* ---------- FUNCTIONS ---------- */

function getListResult () {
  return {
    success: true,
    list:[{ id: 'i1' }],
    count: 1
  }
}

function getThenResult () {
  return {
    success: true,
    entity: { id: 'i2' }
  }
}
