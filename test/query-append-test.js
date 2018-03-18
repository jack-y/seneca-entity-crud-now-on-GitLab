/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
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

describe('query + appends', function () {
  it('no select in the query, one append', function (fin) {
    /* Initializes */
    var authorRole = 'author'
    var appends = [
      {
        action: {role: authorRole, cmd: 'query'},
        resultname: 'append_author',
        select: {idname: 'author', valuename: 'author'}
      }
    ]
    /* Gets the Seneca instance */
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    /* Creates the posts */
    testFunctions.createPosts(seneca, role, function (createPostsResults) {
      /* Creates the authors */
      testFunctions.createAuthors(seneca, authorRole, function (createAuthorsResults) {
        /* Fires the test */
        seneca.act({role: role, cmd: 'query', appends: appends}, function (ignore, result) {
          /* Checks the result */
          expect(result.success).to.equal(true)
          expect(result.list.length).to.equal(testFunctions.getPosts().length)
          expect(result.count).to.equal(testFunctions.getPosts().length)
          result.list.forEach(function (item) {
            if (item.author) {
              expect(item.append_author.list[0].author).to.equal(item.author)
            } else {
              expect(item.append_author).to.not.exist()
            }
          })
          fin()
        })
      })
    })
  })
  it('select in the query and append', function (fin) {
    /* Initializes */
    var authorRole = 'author'
    var appends = [
      {
        action: {role: authorRole, cmd: 'query'},
        resultname: 'append_author',
        select: {idname: 'author', valuename: 'author'}
      }
    ]
    var select = { title: 'Tuesday'}
    /* Gets the Seneca instance */
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    /* Creates the posts */
    testFunctions.createPosts(seneca, role, function (createPostsResults) {
      /* Creates the authors */
      testFunctions.createAuthors(seneca, authorRole, function (createAuthorsResults) {
        /* Fires the test */
        seneca.act({role: role, cmd: 'query', select: select, appends: appends}, function (ignore, result) {
          /* Checks the result */
          expect(result.success).to.equal(true)
          expect(result.list.length).to.equal(2)
          expect(result.count).to.equal(2)
          result.list.forEach(function (item) {
            if (item.author) {
              expect(item.append_author.list[0].author).to.equal(item.author)
            } else {
              expect(item.append_author).to.not.exist()
            }
          })
          fin()
        })
      })
    })
  })
  it('select in the query and append with no result', function (fin) {
    /* Initializes */
    var authorRole = 'author'
    var appends = [
      {
        action: {role: authorRole, cmd: 'query'},
        resultname: 'append_author',
        select: {idname: 'author', valuename: 'author'}
      }
    ]
    var select = { title: 'Monday'}
    /* Gets the Seneca instance */
    var seneca = testFunctions.setSeneca(Seneca, role, fin) // Add 'print' for debug
    /* Creates the posts */
    testFunctions.createPosts(seneca, role, function (createPostsResults) {
      /* Creates the authors */
      testFunctions.createAuthors(seneca, authorRole, function (createAuthorsResults) {
        /* Fires the test */
        seneca.act({role: role, cmd: 'query', select: select, appends: appends}, function (ignore, result) {
          /* Checks the result */
          expect(result.success).to.equal(true)
          expect(result.list.length).to.equal(1)
          expect(result.count).to.equal(1)
          result.list.forEach(function (item) {
            if (item.author) {
              expect(item.append_author.list[0].author).to.equal(item.author)
            } else {
              expect(item.append_author).to.not.exist()
            }
          })
          fin()
        })
      })
    })
  })
})
