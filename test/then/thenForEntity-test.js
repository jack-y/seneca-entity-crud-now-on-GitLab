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
  ['thenForEntityAsync', processThen.thenForEntityAsync.bind({})],
  ['thenForEntitySync', processThen.thenForEntitySync.bind({})]
])

describe('then thenForEntity', function () {
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
    processThen.thenForEntity(null, null)
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(false)
      expect(Object.keys(result).length).to.equal(2)
      fin()
    })
  })
  it('no then arguments', function (fin) {
    /* Fires the test */
    processThen.thenForEntity(null, getEntity(), null)
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      expect(result.entity).to.equal(getEntity())
      expect(Object.keys(result).length).to.equal(2)
      fin()
    })
  })
  it('no then action', function (fin) {
    /* Fires the test */
    processThen.thenForEntity(null, getEntity(), {actions: []})
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      expect(result.entity).to.equal(getEntity())
      expect(Object.keys(result).length).to.equal(2)
      fin()
    })
  })
  /* Defaults arguments */
  it('default args and run error', function (fin) {
    /* Initializes */
    var msg = 'Oops, an action error!'
    /* Mocks the run actions */
    mockthenForEntitySyncError(msg)
    /* Fires the test */
    processThen.thenForEntity(null, getEntity(), getThenArgsDefault())
    .catch(function (err) {
      /* Checks the result */
      expect(err.message).to.equal(msg)
      fin()
    })
  })
  it('default args and run OK', function (fin) {
    /* Mocks the run actions */
    var thenName = 'jobi'
    mockthenForEntitySyncOk(thenName)
    /* Fires the test */
    processThen.thenForEntity(null, getEntity(), getThenArgsDefault())
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      expect(Object.keys(result).length).to.equal(1)
      fin()
    })
  })
  /* Sync process */
  it('default sync and includes start', function (fin) {
    /* Mocks the run actions */
    var thenName = 'jobi'
    mockthenForEntitySyncOk(thenName)
    /* Fires the test */
    processThen.thenForEntity(null, getEntity(), getThenArgsIncludesStart())
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      expect(result.entity).to.equal(getEntity())
      expect(Object.keys(result).length).to.equal(2)
      fin()
    })
  })
  it('default sync and name', function (fin) {
    /* Mocks the run actions */
    var thenName = 'jobi'
    var resultName = 'then_result'
    mockthenForEntitySyncOk(thenName)
    /* Fires the test */
    processThen.thenForEntity(null, getEntity(), getThenArgsName(resultName))
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      expect(result[resultName].length).to.equal(getThenArgsDefault().actions.length)
      expect(Object.keys(result).length).to.equal(2)
      fin()
    })
  })
  it('default sync, includes start and name', function (fin) {
    /* Initializes */
    var thenName = 'jobi'
    var resultName = 'then_result'
    /* Mocks the run actions */
    mockthenForEntitySyncOk(thenName)
    /* Fires the test */
    processThen.thenForEntity(null, getEntity(), getThenArgsFull(resultName))
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      expect(result.entity).to.equal(getEntity())
      expect(result[resultName].length).to.equal(getThenArgsDefault().actions.length)
      expect(result[resultName][0].name).to.equal(thenName)
      expect(Object.keys(result).length).to.equal(3)
      fin()
    })
  })
  /* Async process */
  it('async error', function (fin) {
    /* Initializes */
    var msg = 'Oops, an action error!'
    /* Mocks the run actions */
    mockthenForEntityAsyncError(msg)
    /* Fires the test */
    processThen.thenForEntity(null, getEntity(), getThenArgsAsync())
    .catch(function (err) {
      /* Checks the result */
      expect(err.message).to.equal(msg)
      fin()
    })
  })
  it('async, default args and run OK', function (fin) {
    /* Mocks the run actions */
    var thenName = 'jobi'
    mockthenForEntityAsyncOk(thenName)
    /* Fires the test */
    processThen.thenForEntity(null, getEntity(), getThenArgsAsync())
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      expect(Object.keys(result).length).to.equal(1)
      fin()
    })
  })
  it('async and includes start', function (fin) {
    /* Mocks the run actions */
    var thenName = 'jobi'
    mockthenForEntityAsyncOk(thenName)
    /* Fires the test */
    processThen.thenForEntity(null, getEntity(), getThenArgsAsyncIncludesStart())
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      expect(result.entity).to.equal(getEntity())
      expect(Object.keys(result).length).to.equal(2)
      fin()
    })
  })
  it('async and name', function (fin) {
    /* Mocks the run actions */
    var thenName = 'jobi'
    var resultName = 'then_result'
    mockthenForEntityAsyncOk(thenName)
    /* Fires the test */
    processThen.thenForEntity(null, getEntity(), getThenArgsAsyncName(resultName))
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      expect(result[resultName].length).to.equal(getThenArgsDefault().actions.length)
      expect(Object.keys(result).length).to.equal(2)
      fin()
    })
  })
  it('async, includes start and name', function (fin) {
    /* Initializes */
    var thenName = 'jobi'
    var resultName = 'then_result'
    /* Mocks the run actions */
    mockthenForEntityAsyncOk(thenName)
    /* Fires the test */
    processThen.thenForEntity(null, getEntity(), getThenArgsAsyncFull(resultName))
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      expect(result.entity).to.equal(getEntity())
      expect(result[resultName].length).to.equal(getThenArgsDefault().actions.length)
      expect(result[resultName][0].name).to.equal(thenName)
      expect(Object.keys(result).length).to.equal(3)
      fin()
    })
  })
})

/* ---------- MOCKS ---------- */

function mockthenForEntityAsyncError (msg) {
  processThen.thenForEntityAsync = function (act, entity, thenArgs) {
    return new Promise(function (resolve, reject) {
      return reject(new Error(msg))
    })
  }
  return false
}

function mockthenForEntityAsyncOk (thenName) {
  processThen.thenForEntityAsync = function (act, entity, thenArgs) {
    return new Promise(function (resolve, reject) {
      var results = []
      for (var i = 0; i < thenArgs.actions.length; i++) {
        results.push({ success: true, name: thenName })
      }
      return resolve(results)
    })
  }
  return false
}

function mockthenForEntitySyncError (msg) {
  processThen.thenForEntitySync = function (act, entity, thenArgs) {
    return new Promise(function (resolve, reject) {
      return reject(new Error(msg))
    })
  }
  return false
}

function mockthenForEntitySyncOk (thenName) {
  processThen.thenForEntitySync = function (act, entity, thenArgs) {
    return new Promise(function (resolve, reject) {
      var results = []
      for (var i = 0; i < thenArgs.actions.length; i++) {
        results.push({ success: true, name: thenName })
      }
      return resolve(results)
    })
  }
  return false
}

/* ---------- FUNCTIONS ---------- */

function getThenArgsAsync () {
  var args = getThenArgsDefault()
  args.async = true
  return args
}

function getThenArgsAsyncFull (resultName) {
  var args = getThenArgsAsync()
  args.results = {
    includes_start: true,
    name: resultName
  }
  return args
}

function getThenArgsAsyncIncludesStart () {
  var args = getThenArgsAsync()
  args.results = {
    includes_start: true
  }
  return args
}

function getThenArgsAsyncName (resultName) {
  var args = getThenArgsAsync()
  args.results = {
    name: resultName
  }
  return args
}

function getEntity () {
  return {id: 'i1', name: 'John Doo'}
}

function getThenArgsDefault () {
  return {
    actions: [
      { role: 'r1', cmd: 'c1' },
      { role: 'r2', cmd: 'c2' }
    ]
  }
}

function getThenArgsFull (resultName) {
  var args = getThenArgsDefault()
  args.results = {
    includes_start: true,
    name: resultName
  }
  return args
}

function getThenArgsIncludesStart () {
  var args = getThenArgsDefault()
  args.results = {
    includes_start: true
  }
  return args
}

function getThenArgsName (resultName) {
  var args = getThenArgsDefault()
  args.results = {
    name: resultName
  }
  return args
}
