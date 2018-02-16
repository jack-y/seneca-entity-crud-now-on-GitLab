/* Copyright (c) 2017 e-soa Jacques Desodt, MIT License */
'use strict'

/* Default plugin options */
const role = 'entity-crud-test'

/* Prerequisites */
const processAppend = require('../process/append')
const testFunctions = require('./functions')

/* Test prerequisites */
const Code = require('code')
const Lab = require('lab', {timeout: testFunctions.timeout})
var lab = (exports.lab = Lab.script())
var describe = lab.describe
var it = lab.it
var expect = Code.expect

describe('append', function () {
  /* No data */
  it('no data', function (fin) {
    /* Initializes */
    var act = getAct()
    /* Fires the test */
    processAppend.append(act, null, null)
    .then(function (result) {
      /* Checks the result */
      expect(result).to.not.exist()
      fin()
    })
  })
  it('no entity', function (fin) {
    /* Initializes */
    var act = getAct()
    /* Fires the test */
    processAppend.append(act, null, [{jobi: 'joba'}])
    .then(function (result) {
      /* Checks the result */
      expect(result).to.not.exist()
      fin()
    })
  })
  it('no appends', function (fin) {
    /* Initializes */
    var act = getAct()
    var entity = {id: 'jobijoba'}
    /* Fires the test */
    processAppend.append(act, entity, null)
    .then(function (result) {
      /* Checks the result */
      expect(result).to.equal(entity)
      fin()
    })
  })
  /* One entity, no select */
  it('one entity, one append, no select', function (fin) {
    /* Initializes */
    var act = getAct()
    var entity = {id: 'jobijoba'}
    var appends = getAppendsNoSelect()
    /* Fires the test */
    processAppend.append(act, entity, appends)
    .then(function (result) {
      /* Checks the result */
      expect(result.id).to.equal(entity.id)
      expect(result.query).to.exist()
      expect(result.query.list.length).to.equal(3)
      expect(result.query.list[2].id).to.equal('i3')
      fin()
    })
  })
  it('one entity, more appends, no select', function (fin) {
    /* Initializes */
    var act = getAct()
    var entity = {id: 'jobijoba'}
    var appends = getAppendsNoSelectMulti()
    /* Fires the test */
    processAppend.append(act, entity, appends)
    .then(function (result) {
      /* Checks the result */
      expect(result.id).to.equal(entity.id)
      expect(result.query_1.list.length).to.equal(3)
      expect(result.query_1.list[0].id).to.equal('i1')
      expect(result.query_2.list.length).to.equal(3)
      expect(result.query_2.list[1].id).to.equal('i2')
      expect(result.query_3.list.length).to.equal(3)
      expect(result.query_3.list[2].id).to.equal('i3')
      fin()
    })
  })
  /* One entity with select */
  it('one entity, one append with select', function (fin) {
    /* Initializes */
    var act = getAct()
    var entity = {id: 'i15', v1: 'jobijoba'}
    var appends = getAppendsSelect()
    /* Fires the test */
    processAppend.append(act, entity, appends)
    .then(function (result) {
      /* Checks the result */
      expect(result.id).to.equal(entity.id)
      expect(result.query).to.exist()
      expect(result.query.list.length).to.equal(1)
      expect(result.query.list[0].id).to.equal('i69')
      fin()
    })
  })
  /* List of entities with select */
  it('List of entities with select', function (fin) {
    /* Initializes */
    var act = getAct()
    var list = [
      {id: 'id01', v1: 'value_1'},
      {id: 'id02', v1: 'value_2'}
    ]
    var appends = getAppendsSelect()
    /* Fires the test */
    processAppend.readAppendsForList(act, list, appends)
    .then(function (result) {
      /* Checks the result */
      expect(result.list.length).to.equal(list.length)
      expect(result.list[0].id).to.equal('id01')
      expect(result.list[0].query.list.length).to.equal(1)
      expect(result.list[0].query.list[0].id).to.equal('i69')
      expect(result.list[1].id).to.equal('id02')
      expect(result.list[1].query.list.length).to.equal(1)
      expect(result.list[1].query.list[0].id).to.equal('i69')
      fin()
    })
  })
})

/* ---------- FUNCTIONS ---------- */

function getAct() {
  return function (args) {
    return new Promise(function (resolve, reject) {
      if (args.select) {
        return resolve({
          success: true,
          list:[{ id: 'i69' }]
        })
      } else {
        return resolve({
          success: true,
          list: [{ id: 'i1'}, { id: 'i2'}, { id: 'i3'}]
        })
      }
    })
  }
}

function getAppendsNoSelect() {
  return [
    {
      resultname: 'query',
      action: {
        role: 'myRole',
        cmd: 'query'
      }
    }
  ]
}

function getAppendsNoSelectMulti() {
  return [
    {
      resultname: 'query_1',
      action: {
        role: 'myRole',
        cmd: 'query'
      }
    },
    {
      resultname: 'query_2',
      action: {
        role: 'myRole',
        cmd: 'query'
      }
    },
    {
      resultname: 'query_3',
      action: {
        role: 'myRole',
        cmd: 'query'
      }
    }
  ]
}

function getAppendsSelect() {
  return [
    {
      resultname: 'query',
      action: {
        role: 'myRole',
        cmd: 'query'
      },
      select: {
        idname: 'aField',
        valuename: 'v1'
      }
    }
  ]
}
