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
  ['runAction', processThen.runAction.bind({})]
])

describe('then thenForListSync', function () {
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
    processThen.thenForListSync()
    .then(function (result) {
      /* Checks the result */
      expect(result.length).to.equal(0)
      fin()
    })
  })
  it('empty list', function (fin) {
    /* Fires the test */
    processThen.thenForListSync(null, [], getThenArgsDefault())
    .then(function (result) {
      /* Checks the result */
      expect(result.length).to.equal(0)
      fin()
    })
  })
  it('no then arguments', function (fin) {
    /* Fires the test */
    processThen.thenForListSync(null, getListResult(), null)
    .then(function (result) {
      /* Checks the result */
      expect(result.length).to.equal(0)
      fin()
    })
  })
  it('no then action', function (fin) {
    /* Fires the test */
    processThen.thenForListSync(null, getListResult(), {actions: []})
    .then(function (result) {
      /* Checks the result */
      expect(result.length).to.equal(0)
      fin()
    })
  })
  /* run action on error */
  it('then action on error', function (fin) {
    /* Initializes */
    var msg = 'Oops, an action error!'
    /* Mocks the run actions */
    mockRunActionError(msg)
    /* Fires the test */
    processThen.thenForListSync(null, getListResult(), getThenArgsDefault())
    .catch(function (err) {
      /* Checks the result */
      expect(err.message).to.equal(msg)
      fin()
    })
  })
  /* run action OK */
  it('then action OK', function (fin) {
    /* Initializes */
    var expected = getListResult().length * getThenArgsDefault().actions.length
    /* Mocks the run actions */
    mockRunActionOk()
    /* Fires the test */
    processThen.thenForListSync(null, getListResult(), getThenArgsDefault())
    .then(function (result) {
      /* Checks the result */
      expect(result.length).to.equal(expected)
      expect(result[0].entity.id).to.equal('i1')
      expect(result[0].action.role).to.equal('r1')
      expect(result[expected - 1].entity.id).to.equal('i3')
      expect(result[expected - 1].action.role).to.equal('r2')
      fin()
    })
  })
})

/* ---------- MOCKS ---------- */

function mockRunActionError (msg) {
  processThen.runAction = function (act, entity, action) {
    return new Promise(function (resolve, reject) {
      return reject(new Error(msg))
    })
  }
  return false
}

function mockRunActionOk () {
  processThen.runAction = function (act, entity, action) {
    return new Promise(function (resolve, reject) {
      return resolve({ success: true, entity: entity, action: action })
    })
  }
  return false
}

/* ---------- FUNCTIONS ---------- */

function getListResult () {
  return [
    {id: 'i1', name: 'John Doo'},
    {id: 'i2', name: 'Jack Foof'},
    {id: 'i3', name: 'Jo Bijoba'}
  ]
}

function getThenArgsDefault () {
  return {
    actions: [
      { role: 'r1', cmd: 'c1' },
      { role: 'r2', cmd: 'c2' }
    ]
  }
}
