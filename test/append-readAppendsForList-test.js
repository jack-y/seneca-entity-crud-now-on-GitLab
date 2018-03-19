/* Copyright (c) 2017-2018 e-soa Jacques Desodt, MIT License */
'use strict'

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

describe('append readAppendsForList', function () {
  it('one entity, one append', function (fin) {
    /* Initializes */
    var act = getAct()
    var entities = [{id: 'i1', name: 'Doo', id_city: 'c1'}]
    var appends = getOneAppend()
    /* Fires the test */
    processAppend.readAppendsForList(act, entities, appends)
    .then(function(result) {
      /* Checks the result */
      expect(result.length).to.equal(entities.length)
      expect(result[0][getOneAppend()[0].resultname]).to.exist()
      expect(result[0][getOneAppend()[0].resultname].list.length).to.equal(1)
      expect(result[0][getOneAppend()[0].resultname].list[0].id).to.equal(entities[0].id_city)
      fin()
    })
  })
  it('one entity, more appends', function (fin) {
    /* Initializes */
    var act = getAct()
    var entities = [{id: 'i1', name: 'Doo', id_city: 'c1', id_brand: 'b1'}]
    var appends = getAppends()
    /* Fires the test */
    processAppend.readAppendsForList(act, entities, appends)
    .then(function(result) {
      /* Checks the result */
      expect(result.length).to.equal(entities.length)
      expect(result[0][getAppends()[0].resultname]).to.exist()
      expect(result[0][getAppends()[0].resultname].list.length).to.equal(1)
      expect(result[0][getAppends()[0].resultname].list[0].id).to.equal(entities[0].id_brand)
      expect(result[0][getAppends()[0].resultname].list[0].name).to.equal('Dior')
      expect(result[0][getAppends()[1].resultname]).to.exist()
      expect(result[0][getAppends()[1].resultname].list.length).to.equal(1)
      expect(result[0][getAppends()[1].resultname].list[0].id).to.equal(entities[0].id_city)
      expect(result[0][getAppends()[1].resultname].list[0].name).to.equal('Paris')
      fin()
    })
  })
  it('more entities, more appends', function (fin) {
    /* Initializes */
    var act = getAct()
    var entities = [
      {id: 'i1', name: 'Doo', id_city: 'c1', id_brand: 'b1'},
      {id: 'i2', name: 'Foo', id_city: 'c1', id_brand: 'b1'},
    ]
    var appends = getAppends()
    /* Fires the test */
    processAppend.readAppendsForList(act, entities, appends)
    .then(function (result) {
      /* Checks the result */
      expect(result.length).to.equal(entities.length)
      expect(result[0][getAppends()[0].resultname]).to.exist()
      expect(result[0][getAppends()[0].resultname].list.length).to.equal(1)
      expect(result[0][getAppends()[0].resultname].list[0].id).to.equal(entities[0].id_brand)
      expect(result[0][getAppends()[0].resultname].list[0].name).to.equal('Dior')
      expect(result[0][getAppends()[1].resultname]).to.exist()
      expect(result[0][getAppends()[1].resultname].list.length).to.equal(1)
      expect(result[0][getAppends()[1].resultname].list[0].id).to.equal(entities[0].id_city)
      expect(result[0][getAppends()[1].resultname].list[0].name).to.equal('Paris')
      expect(result[1][getAppends()[0].resultname]).to.exist()
      expect(result[1][getAppends()[0].resultname].list.length).to.equal(1)
      expect(result[1][getAppends()[0].resultname].list[0].id).to.equal(entities[1].id_brand)
      expect(result[1][getAppends()[0].resultname].list[0].name).to.equal('Dior')
      expect(result[1][getAppends()[1].resultname]).to.exist()
      expect(result[1][getAppends()[1].resultname].list.length).to.equal(1)
      expect(result[1][getAppends()[1].resultname].list[0].id).to.equal(entities[1].id_city)
      expect(result[1][getAppends()[1].resultname].list[0].name).to.equal('Paris')
      fin()
    })
  })
})

/* ---------- FUNCTIONS ---------- */

function getAct() {
  return function (args) {
    return new Promise(function (resolve, reject) {
      switch (args.role) {
        case 'brand':
          var list = [ { id: args.select.id, name: 'Dior' } ]
          return resolve({
            success: true,
            count: list.length,
            list: list
          })
          break
        case 'city':
          var list = [ { id: args.select.id, name: 'Paris' } ]
          return resolve({
            success: true,
            count: list.length,
            list: list
          })
          break
        default:
          return reject(new Error('bad args'))
      }
    })
  }
}

function getOneAppend() {
  return [{
    resultname: 'city',
    action: {
      role: 'city',
      cmd: 'query'
    },
    select: {
      idname: 'id',
      valuename: 'id_city'
    }
  }]
}

function getAppends() {
  return [
    {
      resultname: 'brand',
      action: {
        role: 'brand',
        cmd: 'query'
      },
      select: {
        idname: 'id',
        valuename: 'id_brand'
      }
    },
    {
      resultname: 'city',
      action: {
        role: 'city',
        cmd: 'query'
      },
      select: {
        idname: 'id',
        valuename: 'id_city'
      }
    }
  ]
}
