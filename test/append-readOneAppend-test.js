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

describe('append readOneAppend', function () {
  it('one result', function (fin) {
    /* Initializes */
    var act = getAct()
    var entity = {id: 'i1', name: 'Doo', id_city: 'c1'}
    /* Fires the test */
    processAppend.readOneAppend(act, entity, getAppend())
    .then(function (result) {
      /* Checks the result */
      expect(result.entity.id).to.equal(entity.id)
      expect(result.entity[getAppend().resultname]).to.exist()
      expect(result.entity[getAppend().resultname].list.length).to.equal(1)
      expect(result.entity[getAppend().resultname].list[0].id).to.equal(entity.id_city)
      fin()
    })
  })
})

/* ---------- FUNCTIONS ---------- */

function getAct() {
  return function (args) {
    return new Promise(function (resolve, reject) {
      if (args.role === 'city' && args.select) {
        var list = [ { id: args.select.id } ]
        return resolve({
          success: true,
          count: list.length,
          list: list
        })
      } else {
        return reject(new Error('bad args'))
      }
    })
  }
}

function getAppend() {
  return {
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
}
