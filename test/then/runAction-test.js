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
  ['replaceValues', processThen.replaceValues.bind({})]
])

describe('then runAction', function () {
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
    processThen.runAction()
    .catch(function (err) {
      /* Checks the result */
      expect(err.message).to.equal('act is not a function')
      fin()
    })
  })
  /* Action */
  it('act on error', function (fin) {
    /* Initializes */
    var msg = 'action on error'
    var act = function (action) {
      return new Promise(function (resolve, reject) {
        return reject(new Error(msg))
      })
    }
    /* Mocks the replaceValues function */
    mockReplaceValues('test')
    /* Fires the test */
    processThen.runAction(act, null, null)
    .catch(function (err) {
      /* Checks the result */
      expect(err.message).to.equal('action on error')
      fin()
    })
  })
  it('act OK', function (fin) {
    /* Initializes */
    var act = function (action) {
      return new Promise(function (resolve, reject) {
        return resolve({success: true})
      })
    }
    /* Mocks the replaceValues function */
    mockReplaceValues('test')
    /* Fires the test */
    processThen.runAction(act, null, null)
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      fin()
    })
  })
})

/* ---------- MOCKS ---------- */

function mockReplaceValues (newValue) {
  processThen.replaceValues = function (entity, action) {
    return newValue
  }
  return false
}
