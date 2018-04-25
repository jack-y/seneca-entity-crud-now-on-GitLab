/* Copyright (c) 2017-2018 e-soa Jacques Desodt, MIT License */
'use strict'

/* Default plugin options */
const role = 'entity-crud-test'

/* Prerequisites */
const Seneca = require('seneca')
const testFunctions = require('./functions')

/* Test prerequisites */
const Code = require('code')
const Lab = require('lab', {timeout: testFunctions.timeout})
var lab = (exports.lab = Lab.script())
var describe = lab.describe
var it = lab.it
var expect = Code.expect

describe('query', function () {
  /* Simple */
  it('all', function (fin) {
    /* Gets the Seneca instance */
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    /* Creates the entities */
    testFunctions.createPosts(seneca, role, function (results) {
      /* Fires the test */
      seneca.act({role: role, cmd: 'query'}, function (ignore, result) {
        /* Checks the result */
        expect(result.success).to.equal(true)
        expect(result.list.length).to.equal(testFunctions.getPosts().length)
        expect(result.count).to.equal(testFunctions.getPosts().length)
        fin()
      })
    })
  })
  /* Select on one field */
  it('select title', function (fin) {
    /* Initializes */
    var title = 'Tuesday'
    /* Gets the Seneca instance */
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    /* Creates the entities */
    testFunctions.createPosts(seneca, role, function (results) {
      /* Fires the test */
      seneca.act({role: role, cmd: 'query', select: {title: title}}, function (ignore, result) {
        /* Checks the result */
        expect(result.success).to.equal(true)
        expect(result.list.length).to.equal(testFunctions.getTitleCount(title))
        expect(result.count).to.equal(testFunctions.getTitleCount(title))
        fin()
      })
    })
  })
  /* Sorts the result */
  it('sort', function (fin) {
    /* Gets the Seneca instance */
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    /* Creates the entities */
    testFunctions.createPosts(seneca, role, function (results) {
      /* Fires the test */
      seneca.act({role: role, cmd: 'query', select: {sort$: {title: 1}}}, function (ignore, result) {
        /* Checks the result */
        expect(result.success).to.equal(true)
        expect(result.list[0].title).to.equal('Life on Mars')
        expect(result.count).to.equal(testFunctions.getPosts().length)
        fin()
      })
    })
  })
  /* Query with defaults */
  it('defaults', function (fin) {
    /* Initializes */
    var author = 'John Deuf'
    var defaultAuthor = 'Mr Nobody'
    var defaultRelease = 2017
    var title = 'Tuesday'
    /* Gets the Seneca instance */
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    /* Creates the entities */
    testFunctions.createPosts(seneca, role, function (results) {
      /* Fires the test */
      seneca.act({role: role, cmd: 'query', defaults: {author: defaultAuthor, release: defaultRelease}}, function (ignore, result) {
        /* Checks the result */
        expect(result.success).to.equal(true)
        expect(result.list.length).to.equal(testFunctions.getPosts().length)
        expect(result.count).to.equal(testFunctions.getPosts().length)
        // Checks the defaults
        result.list.forEach(function (item) {
          expect(item.release).to.equal(defaultRelease)
          if (item.title === title) {
            expect(item.author).to.equal(author)
          } else {
            expect(item.author).to.equal(defaultAuthor)
          }
        })
        fin()
      })
    })
  })
  /* Query with no namespace */
  it('no namespace', function (fin) {
    /* Gets the Seneca instance */
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    /* Creates the entities */
    testFunctions.createPosts(seneca, role, function (results) {
      /* Fires the test */
      seneca.act({role: role, cmd: 'query', nonamespace: true}, function (ignore, result) {
        /* Checks the result */
        expect(result.success).to.equal(true)
        expect(result.list.length).to.equal(testFunctions.getPosts().length)
        expect(result.count).to.equal(testFunctions.getPosts().length)
        result.list.forEach(function (item) {
          expect(item.entity$).to.not.exist()
        })
        fin()
      })
    })
  })
  /* Deep query */
  it('deep query', function (fin) {
    /* Initializes */
    var zipcode = '59491'
    /* Gets the Seneca instance */
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    /* Creates the entities */
    testFunctions.createPosts(seneca, role, function (results) {
      /* Fires the test */
      seneca.act({
        role: role,
        cmd: 'query',
        deepselect: [{ property: 'data.zipcode', value: zipcode }]},
        function (ignore, result) {
          /* Checks the result */
          expect(result.success).to.equal(true)
          expect(result.list.length).to.equal(testFunctions.getZipcodeCount(zipcode))
          expect(result.count).to.equal(testFunctions.getZipcodeCount(zipcode))
          /* Another test which return no data.
             Fires the test */
          seneca.act({
            role: role,
            cmd: 'query',
            select: {title: 'Monday'},
            deepselect: [{property: 'data.zipcode', value: zipcode}]},
            function (ignore, result) {
              /* Checks the result */
              expect(result.success).to.equal(true)
              expect(result.list.length).to.equal(0)
              expect(result.count).to.equal(0)
              fin()
            })
        })
    })
  })
  /* Query with selection */
  it('selection', function (fin) {
    /* Initializes */
    var expected = 4
    /* Gets the Seneca instance */
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    /* Creates the entities */
    testFunctions.createPosts(seneca, role, function (results) {
      /* Sets the selection function */
      var mySelection = function (item) {
        return (item.title.indexOf('day') > -1) ||
          (item.content.indexOf('Maoww') > -1)
      }
      /* Fires the test */
      seneca.act({role: role, cmd: 'query', selection: mySelection}, function (ignore, result) {
        /* Checks the result */
        expect(result.success).to.equal(true)
        expect(result.list.length).to.equal(expected)
        expect(result.count).to.equal(expected)
        fin()
      })
    })
  })
  /* Query with selection code */
  it('selection code', function (fin) {
    /* Initializes */
    var expected = 4
    /* Gets the Seneca instance */
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    /* Creates the entities */
    testFunctions.createPosts(seneca, role, function (results) {
      /* Sets the selection code */
      var mySelectionCode = 'return (item.title.indexOf("day") > -1) || (item.content.indexOf("Maoww") > -1)'
      /* Fires the test */
      seneca.act({role: role, cmd: 'query', selectioncode: mySelectionCode}, function (ignore, result) {
        /* Checks the result */
        expect(result.success).to.equal(true)
        expect(result.list.length).to.equal(expected)
        expect(result.count).to.equal(expected)
        fin()
      })
    })
  })
})
