/* Copyright (c) 2016 e-soa Jacques Desodt */
'use strict'

/* Default plugin options */
const pluginName = 'entity-crud'
const role = 'entity-crud-test'
const entityName = 'entity-test'
const entityCrud = require('./entity-crud')

/* Node modules */
const promise = require('bluebird')
const seneca = require('seneca')()
const assert = require('assert')

// .act() method as promise; to learn more about this technique see:
// http://bluebirdjs.com/docs/features.html#promisification-on-steroids
const act = promise.promisify(seneca.act, {context: seneca})

/* Initializations */
seneca
  .use('entity')
  .use('mem-store')
  .use(entityCrud, {
    name: entityName,
    role: role,
    last_update: false
  })
  .error(assert.fail)

seneca.ready(function (err) {
  if (err) { throw err }
  /* Begins */
  console.log('seneca started and running joins tests for plug-in "' + pluginName + '"...')

  var brand = {name: 'Fender'}
  var supplier = {name: 'Guitar Solo'}
  var city = {name: 'San Francisco', zipcode: '94107'}
  var guitar = {name: 'Stratocaster'}

  /* Actions */
  seneca.add({role: role, cmd: 'test_simple_joins'}, testSimpleJoins)
  seneca.add({role: role, cmd: 'test_multi_joins'}, testMultiJoins)
  seneca.add({role: role, cmd: 'test_query_joins'}, testQueryJoins)

  /* Run tests */
  act({role: role, cmd: 'test_simple_joins'})
  .then(function (result) {
    act({role: role, cmd: 'test_multi_joins'})
    .then(function (result) {
      act({role: role, cmd: 'test_query_joins'})
      .then(function (result) {
        console.log('entity-crud: joins tests successful.')
        return result
      })
    })
  })

  /* Functions */

  function testSimpleJoins (args, done) {
    /* Creates entities */
    act({role: role, cmd: 'create', entity: brand})
    .then(function (result) {
      brand.id = result.entity.id
      guitar.id_brand = brand.id
      act({role: role, cmd: 'create', entity: guitar})
      .then(function (result) {
        guitar.id = result.entity.id
        /* Reads guitar with joins */
        act({role: role, cmd: 'read', id: guitar.id, joins: [{role: role, idname: 'id_brand', resultname: 'brand'}]})
        .then(function (result) {
          assert.equal(result.entity.brand.name, brand.name)
          console.log('entity-crud: test_simple_joins successful.')
          done(null, {success: true})
        })
      })
    })
  }

  function testMultiJoins (args, done) {
    /* Resets the database */
    act({role: role, cmd: 'truncate'})
    .then(function (result) {
      /* Creates entities */
      brand = {name: 'Gibson'}
      guitar = {name: 'DeLuxe'}
      /* Creates city */
      act({role: role, cmd: 'create', entity: city})
      .then(function (result) {
        city = result.entity
        /* Creates supplier */
        supplier.id_city = city.id
        act({role: role, cmd: 'create', entity: supplier})
        .then(function (result) {
          supplier = result.entity
          /* Creates brand */
          guitar.id_supplier = supplier.id
          act({role: role, cmd: 'create', entity: brand})
          .then(function (result) {
            brand = result.entity
            /* Creates guitar */
            guitar.id_supplier = supplier.id
            guitar.id_brand = brand.id
            act({role: role, cmd: 'create', entity: guitar})
            .then(function (result) {
              guitar = result.entity
              /* Reads guitar with multi joins */
              act({
                role: role,
                cmd: 'read',
                id: guitar.id,
                joins: [
                  {role: role, idname: 'id_brand', resultname: 'brand'},
                  {
                    role: role,
                    idname: 'id_supplier',
                    resultname: 'supplier',
                    joins: [{role: role, idname: 'id_city', resultname: 'city'}]
                  }
                ]
              })
              .then(function (result) {
                assert.equal(result.entity.supplier.city.zicode, city.zicode)
                console.log('entity-crud: test_multi_joins successful.')
                done(null, {success: true})
              })
            })
          })
        })
      })
    })
  }

  function testQueryJoins (args, done) {
    /* Resets the database */
    act({role: role, cmd: 'truncate'})
    .then(function (result) {
      /* Creates entities */
      var brand01 = {name: 'Gibson'}
      var brand02 = {name: 'Fender'}
      var guitar01 = {name: 'DeLuxe', type: 'Electric'}
      var guitar02 = {name: 'Stratocaster', type: 'Electric'}
      var guitar03 = {name: 'Folk', type: 'Acoustic'}
      act({role: role, cmd: 'create', entity: brand01})
      .then(function (result) {
        guitar01.id_brand = result.entity.id
        act({role: role, cmd: 'create', entity: brand02})
        .then(function (result) {
          guitar02.id_brand = result.entity.id
          guitar03.id_brand = result.entity.id
          act({role: role, cmd: 'create', entity: guitar01})
          .then(function (result) {
            act({role: role, cmd: 'create', entity: guitar02})
            .then(function (result) {
              act({role: role, cmd: 'create', entity: guitar03})
              .then(function (result) {
                act({role: role, cmd: 'query', select: {type: 'Electric'}, joins: [{role: role, idname: 'id_brand', resultname: 'brand'}]})
                .then(function (result) {
                  assert.equal(result.list.length, 2)
                  result.list.forEach(function (guitar, index) {
                    if (guitar.name === 'DeLuxe') {
                      assert.equal(guitar.brand.name, 'Gibson')
                    }
                    if (guitar.name === 'Stratocaster') {
                      assert.equal(guitar.brand.name, 'Fender')
                    }
                  })
                  console.log('entity-crud: test_query_joins successful.')
                  done(null, {success: true})
                })
              })
            })
          })
        })
      })
    })
  }

  /* Ends seneca */
  seneca.close((err) => {
    if (err) { console.log(err) }
  })
})
