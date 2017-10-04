/* Copyright (c) 2017 e-soa Jacques Desodt */
'use strict'
const promise = require('bluebird')

exports.setSeneca = function (Seneca, role, fin, print) {
  return Seneca({
    log: 'test',
    timeout: 5000
  })
    // Activates unit test mode. Errors provide additional stack tracing context.
    // The fin callback is called when an error occurs anywhere.
    .test(fin, print)
    // Loads the microservice business logic
    .use('basic')
    .use('entity')
    .use('mem-store')
    .use('../entity-crud', {
      role: role,
      name: 'entity_test',
      last_update: true
    })
    .error(fin)
    .gate()
}

exports.validatePost = function (args) {
  return new Promise(function (resolve, reject) {
    var errors = []
    if (!args.entity) {
      errors.push({field: null, actual: null, error: 'no data'})
    } else {
      if (!args.entity.title) {
        errors.push({field: 'title', actual: null, error: 'required'})
      }
      if (!args.entity.content) {
        errors.push({field: 'content', actual: null, error: 'required'})
      }
    }
    var success = errors.length === 0
    resolve({success: success, errors: errors})
  })
}

exports.createPosts = function (seneca, role, done) {
  var cmds = []
  getAllPosts().forEach(function (item) {
    var command = createOnePost(seneca, role, item)
    cmds.push(command)
  })
  promise.all(cmds)
  .then(function (results) {
    return done(results)
  })
}

function createOnePost (seneca, role, entity) {
  return new Promise(function (resolve, reject) {
    seneca.act({role: role, cmd: 'create', entity: entity}, function (ignore, result) {
      return resolve(result)
    })
  })
}

exports.getPosts = function () {
  return getAllPosts()
}

function getAllPosts () {
  var author = 'John Deuf'
  var zipcode = '59491'
  return [
    {title: 'The life of cats', content: '<h1>This is a great post about cats</h1><p>Maoww</p>', data: {zipcode: zipcode, number: 15}},
    {title: 'Monday', content: 'The week begins!', data: {jobi: 'joba'}},
    {title: 'Tuesday', content: 'Ruby tuesday?', author: author, data: {zipcode: zipcode, number: 7}},
    {title: 'Life on Mars', content: 'Listen to this song written by David Bowie.', data: {zipcode: zipcode, number: 15}},
    {title: 'Tuesday', content: 'The week continues...', author: author, data: {zipcode: zipcode, number: 69}}
  ]
}

exports.getTitleCount = function (title) {
  var count = 0
  getAllPosts().forEach(function (item) {
    if (item.title === title) {
      count++
    }
  })
  return count
}

exports.getZipcodeCount = function (zipcode) {
  var count = 0
  getAllPosts().forEach(function (item) {
    if (item.data.zipcode === zipcode) {
      count++
    }
  })
  return count
}

exports.createJoinsEntities = function (seneca, role) {
  return new Promise(function (resolve, reject) {
    // Initializes
    var brand = {name: 'Fender'}
    var guitar = {name: 'Stratocaster'}
    var supplier = {name: 'Guitar Solo'}
    var city = {name: 'San Francisco', zipcode: '94107'}
    /* Creates city */
    seneca.act({role: role, cmd: 'create', entity: city}, function (ignore, result) {
      city = result.entity
      /* Creates supplier */
      supplier.id_city = city.id
      seneca.act({role: role, cmd: 'create', entity: supplier}, function (ignore, result) {
        supplier = result.entity
        /* Creates brand */
        guitar.id_supplier = supplier.id
        seneca.act({role: role, cmd: 'create', entity: brand}, function (ignore, result) {
          brand = result.entity
          /* Creates guitar */
          guitar.id_supplier = supplier.id
          guitar.id_brand = brand.id
          seneca.act({role: role, cmd: 'create', entity: guitar}, function (ignore, result) {
            guitar = result.entity
            return resolve({
              brand: brand,
              guitar: guitar,
              supplier: supplier,
              city: city
            })
          })
        })
      })
    })
  })
}

exports.createJoinsFirstEntities = function (seneca, role, zipcode, productName) {
  return new Promise(function (resolve, reject) {
    // Entities
    var supplier1 = { name: 'John Doo', zipcode: '94107' }
    var supplier2 = { name: 'Paul Hisson', zipcode: zipcode }
    var product1 = { name: 'foo' }
    var product2 = { name: productName }
    // Creates suppliers
    seneca.act({role: role, name: 'supplier', cmd: 'create', entity: supplier1}, function (ignore, resultA) {
      supplier1 = resultA.entity
      seneca.act({role: role, name: 'supplier', cmd: 'create', entity: supplier2}, function (ignore, resultB) {
        supplier2 = resultB.entity
        // Memorizes suppliers IDs
        product1.id_supplier = supplier1.id
        product2.id_supplier = supplier2.id // joins productName with zipcode
        // Creates products
        seneca.act({role: role, name: 'product', cmd: 'create', entity: product1}, function (ignore, resultC) {
          product1 = resultC.entity
          seneca.act({role: role, name: 'product', cmd: 'create', entity: product2}, function (ignore, resultD) {
            product2 = resultD.entity
            return resolve({ success: true })
          })
        })
      })
    })
  })
}
