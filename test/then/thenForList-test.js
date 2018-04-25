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
  ['thenForListAsync', processThen.thenForListAsync.bind({})],
  ['thenForListSync', processThen.thenForListSync.bind({})]
])

describe('then thenForList', function () {
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
    processThen.thenForList()
    .then(function (result) {
      /* Checks the result */
      expect(result.count).to.equal(0)
      expect(result.success).to.equal(true)
      fin()
    })
  })
  it('empty list', function (fin) {
    /* Fires the test */
    processThen.thenForList(null, [], getThenArgsDefault())
    .then(function (result) {
      /* Checks the result */
      expect(result.count).to.equal(0)
      expect(result.success).to.equal(true)
      fin()
    })
  })
  it('no then arguments', function (fin) {
    /* Fires the test */
    processThen.thenForList(null, getListResult(), null)
    .then(function (result) {
      /* Checks the result */
      expect(result.count).to.equal(getListResult().length)
      expect(result.success).to.equal(true)
      fin()
    })
  })
  it('no then action', function (fin) {
    /* Fires the test */
    processThen.thenForList(null, getListResult(), {actions: []})
    .then(function (result) {
      /* Checks the result */
      expect(result.count).to.equal(getListResult().length)
      expect(result.success).to.equal(true)
      fin()
    })
  })
  /* Defaults arguments */
  it('default args and run error', function (fin) {
    /* Initializes */
    var msg = 'Oops, an action error!'
    /* Mocks the run actions */
    mockThenForListSyncError(msg)
    /* Fires the test */
    processThen.thenForList(null, getListResult(), getThenArgsDefault())
    .catch(function (err) {
      /* Checks the result */
      expect(err.message).to.equal(msg)
      fin()
    })
  })
  it('default args and run OK', function (fin) {
    /* Mocks the run actions */
    var thenName = 'jobi'
    mockThenForListSyncOk(thenName)
    /* Fires the test */
    processThen.thenForList(null, getListResult(), getThenArgsDefault())
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
    mockThenForListSyncOk(thenName)
    /* Fires the test */
    processThen.thenForList(null, getListResult(), getThenArgsIncludesStart())
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      expect(result.list).to.equal(getListResult())
      expect(result.count).to.equal(getListResult().length)
      expect(Object.keys(result).length).to.equal(3)
      fin()
    })
  })
  it('default sync and name', function (fin) {
    /* Mocks the run actions */
    var thenName = 'jobi'
    var resultName = 'then_result'
    mockThenForListSyncOk(thenName)
    /* Fires the test */
    processThen.thenForList(null, getListResult(), getThenArgsName(resultName))
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
    mockThenForListSyncOk(thenName)
    /* Fires the test */
    processThen.thenForList(null, getListResult(), getThenArgsFull(resultName))
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      expect(result.list).to.equal(getListResult())
      expect(result.count).to.equal(getListResult().length)
      expect(result[resultName].length).to.equal(getThenArgsDefault().actions.length)
      expect(result[resultName][0].name).to.equal(thenName)
      expect(Object.keys(result).length).to.equal(4)
      fin()
    })
  })
  /* Async process */
  it('async error', function (fin) {
    /* Initializes */
    var msg = 'Oops, an action error!'
    /* Mocks the run actions */
    mockThenForListAsyncError(msg)
    /* Fires the test */
    processThen.thenForList(null, getListResult(), getThenArgsAsync())
    .catch(function (err) {
      /* Checks the result */
      expect(err.message).to.equal(msg)
      fin()
    })
  })
  it('async, default args and run OK', function (fin) {
    /* Mocks the run actions */
    var thenName = 'jobi'
    mockThenForListAsyncOk(thenName)
    /* Fires the test */
    processThen.thenForList(null, getListResult(), getThenArgsAsync())
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
    mockThenForListAsyncOk(thenName)
    /* Fires the test */
    processThen.thenForList(null, getListResult(), getThenArgsAsyncIncludesStart())
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      expect(result.list).to.equal(getListResult())
      expect(result.count).to.equal(getListResult().length)
      expect(Object.keys(result).length).to.equal(3)
      fin()
    })
  })
  it('async and name', function (fin) {
    /* Mocks the run actions */
    var thenName = 'jobi'
    var resultName = 'then_result'
    mockThenForListAsyncOk(thenName)
    /* Fires the test */
    processThen.thenForList(null, getListResult(), getThenArgsAsyncName(resultName))
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
    mockThenForListAsyncOk(thenName)
    /* Fires the test */
    processThen.thenForList(null, getListResult(), getThenArgsAsyncFull(resultName))
    .then(function (result) {
      /* Checks the result */
      expect(result.success).to.equal(true)
      expect(result.list).to.equal(getListResult())
      expect(result.count).to.equal(getListResult().length)
      expect(result[resultName].length).to.equal(getThenArgsDefault().actions.length)
      expect(result[resultName][0].name).to.equal(thenName)
      expect(Object.keys(result).length).to.equal(4)
      fin()
    })
  })
})

/* ---------- MOCKS ---------- */

function mockThenForListAsyncError (msg) {
  processThen.thenForListAsync = function (act, listResult, thenArgs) {
    return new Promise(function (resolve, reject) {
      return reject(new Error(msg))
    })
  }
  return false
}

function mockThenForListAsyncOk (thenName) {
  processThen.thenForListAsync = function (act, listResult, thenArgs) {
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

function mockThenForListSyncError (msg) {
  processThen.thenForListSync = function (act, listResult, thenArgs) {
    return new Promise(function (resolve, reject) {
      return reject(new Error(msg))
    })
  }
  return false
}

function mockThenForListSyncOk (thenName) {
  processThen.thenForListSync = function (act, listResult, thenArgs) {
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
