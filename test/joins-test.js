/* Copyright (c) 2017 e-soa Jacques Desodt, MIT License */
'use strict'

/* Default plugin options */
const role = 'entity-crud-test'

/* Prerequisites */
const Seneca = require('seneca') // eslint-disable-line no-unused-vars
const testFunctions = require('./functions')

/* Test prerequisites */
const Code = require('code')
const Lab = require('lab', {timeout: testFunctions.timeout})
var lab = (exports.lab = Lab.script())
var describe = lab.describe
var it = lab.it
var expect = Code.expect

describe('joins', function () {
  //
  // Simple
  it('simple', function (fin) {
    // Initializes
    var brand = {name: 'Fender'}
    var guitar = {name: 'Stratocaster'}
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    /* Creates entities */
    seneca.act({role: role, cmd: 'create', entity: brand}, function (ignore, result) {
      brand.id = result.entity.id
      guitar.id_brand = brand.id
      seneca.act({role: role, cmd: 'create', entity: guitar}, function (ignore, result) {
        guitar.id = result.entity.id
        /* Reads guitar with joins */
        seneca.act({
          role: role,
          cmd: 'read',
          id: guitar.id,
          joins: [{role: role, idname: 'id_brand', resultname: 'brand'}]},
        function (ignore, result) {
          expect(result.entity.brand.name).to.equal(brand.name)
          fin()
        })
      })
    })
  })
  // Simple with no namespace
  it('no namespace', function (fin) {
    // Initializes
    var brand = {name: 'Fender'}
    var guitar = {name: 'Stratocaster'}
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    /* Creates entities */
    seneca.act({role: role, cmd: 'create', entity: brand}, function (ignore, result) {
      brand.id = result.entity.id
      guitar.id_brand = brand.id
      seneca.act({role: role, cmd: 'create', entity: guitar}, function (ignore, result) {
        guitar.id = result.entity.id
        /* Reads guitar with joins */
        seneca.act({
          role: role,
          cmd: 'read',
          id: guitar.id,
          joins: [{role: role, idname: 'id_brand', resultname: 'brand', nonamespace: true}]},
        function (ignore, result) {
          expect(result.entity.brand.name).to.equal(brand.name)
          expect(result.entity.entity$).to.exist()
          expect(result.entity.brand.entity$).to.not.exist()
          fin()
        })
      })
    })
  })
  // Multiple
  it('multiple', function (fin) {
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    testFunctions.createJoinsEntities(seneca, role)
    .then(function (createResult) {
      /* Reads guitar with multi joins */
      seneca.act({
        role: role,
        cmd: 'read',
        id: createResult.guitar.id,
        joins: [
          {role: role, idname: 'id_brand', resultname: 'brand'},
          {
            role: role,
            idname: 'id_supplier',
            resultname: 'supplier',
            joins: [{role: role, idname: 'id_city', resultname: 'city'}]
          }
        ]
      },
      function (ignore, result) {
        expect(result.entity.supplier.city.zicode).to.equal(createResult.city.zicode)
        fin()
      })
    })
  })
  // Multiple with no namespace
  it('multiple no namespace', function (fin) {
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    testFunctions.createJoinsEntities(seneca, role)
    .then(function (createResult) {
      /* Reads guitar with multi joins */
      seneca.act({
        role: role,
        cmd: 'read',
        id: createResult.guitar.id,
        nonamespace: true,
        joins: [
          {role: role, idname: 'id_brand', resultname: 'brand'},
          {
            role: role,
            idname: 'id_supplier',
            resultname: 'supplier',
            joins: [{role: role, idname: 'id_city', resultname: 'city', nonamespace: true}]
          }
        ]
      },
      function (ignore, result) {
        expect(result.entity.supplier.city.zicode).to.equal(createResult.city.zicode)
        expect(result.entity.entity$).to.not.exist()
        expect(result.entity.brand.entity$).to.exist()
        expect(result.entity.supplier.entity$).to.exist()
        expect(result.entity.supplier.city.entity$).to.not.exist()
        fin()
      })
    })
  })
  // Query with joins first and then deep select
  it('query with joins first', function (fin) {
    // Initializes
    var zipcode = '59491'
    var productName = 'bar'
    // Gets the Seneca instance
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    testFunctions.createJoinsFirstEntities(seneca, role, zipcode, productName)
    .then(function (createResult) {
      // Query with joins first
      seneca.act({
        role: role,
        name: 'product',
        cmd: 'query',
        joinfirst: true,
        joins: [{ role: role, name: 'supplier', idname: 'id_supplier', resultname: 'supplier' }],
        deepselect: [{ property: 'supplier.zipcode', value: zipcode }]
      },
      function (ignore, result) {
        expect(result.success).to.equal(true)
        expect(result.list.length).to.equal(1)
        expect(result.list[0].supplier.zipcode).to.equal(zipcode)
        expect(result.list[0].name).to.equal(productName)
        fin()
      })
    })
  })
  //
})
