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
  .use('basic')
  .use('entity')
  .use('mem-store')
  .use(entityCrud, {
    name: entityName,
    role: role,
    last_update: true
  })
  .error(assert.fail)

seneca.ready(function (err) {
  if (err) { throw err }
  /* Begins */
  console.log('seneca started and running tests for plug-in "' + pluginName + '"...')

  /* Input data validation */
  function validatePost (args) {
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

  /* Actions */
  seneca.add({role: role, cmd: 'test_create_no_data'}, testCreateNoData)
  seneca.add({role: role, cmd: 'test_create_no_validation_function'}, testCreateNoValidationFunction)
  seneca.add({role: role, cmd: 'test_create_bad_validation'}, testCreateBadValidation)
  seneca.add({role: role, cmd: 'test_create_validation_ok'}, testCreateValidationOk)
  seneca.add({role: role, cmd: 'test_create'}, testCreate)
  seneca.add({role: role, cmd: 'test_create_nonamespace'}, testCreateNoNamespace)
  seneca.add({role: role, cmd: 'test_read'}, testRead)
  seneca.add({role: role, cmd: 'test_read_nonamespace'}, testReadNoNamespace)
  seneca.add({role: role, cmd: 'test_read_not_found'}, testReadNotFound)
  seneca.add({role: role, cmd: 'test_update'}, testUpdate)
  seneca.add({role: role, cmd: 'test_update_nonamespace'}, testUpdateNoNamespace)
  seneca.add({role: role, cmd: 'test_delete'}, testDelete)
  seneca.add({role: role, cmd: 'test_truncate'}, testTruncate)
  seneca.add({role: role, cmd: 'test_query'}, testQuery)
  seneca.add({role: role, cmd: 'test_query_nonamespace'}, testQueryNoNamespace)
  seneca.add({role: role, cmd: 'test_deep_query'}, testDeepQuery)

  /* Run tests */
  act({role: role, cmd: 'test_create_no_data'})
  .then(function (result) {
    act({role: role, cmd: 'test_create_no_validation_function'})
    .then(function (result) {
      act({role: role, cmd: 'test_create_bad_validation'})
      .then(function (result) {
        act({role: role, cmd: 'test_create_validation_ok'})
        .then(function (result) {
          act({role: role, cmd: 'test_create'})
          .then(function (result) {
            act({role: role, cmd: 'test_create_nonamespace'})
            .then(function (result) {
              act({role: role, cmd: 'test_read'})
              .then(function (result) {
                act({role: role, cmd: 'test_read_nonamespace'})
                .then(function (result) {
                  act({role: role, cmd: 'test_read_not_found'})
                  .then(function (result) {
                    act({role: role, cmd: 'test_update'})
                    .then(function (result) {
                      act({role: role, cmd: 'test_update_nonamespace'})
                      .then(function (result) {
                        act({role: role, cmd: 'test_delete'})
                        .then(function (result) {
                          act({role: role, cmd: 'test_truncate'})
                          .then(function (result) {
                            act({role: role, cmd: 'test_query'})
                            .then(function (result) {
                              act({role: role, cmd: 'test_query_nonamespace'})
                              .then(function (result) {
                                act({role: role, cmd: 'test_deep_query'})
                                .then(function (result) {
                                  console.log('entity-crud: tests successful.')
                                  return result
                                })
                              })
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })

    /* CREATE */

  function testCreateNoData (args, done) {
    // Calls the create action
    act({role: role, cmd: 'create'})
    .then(function (result) {
      // Checks result
      assert.ok(!result.success)
      console.log('entity-crud: test_create_no_data successful.')
      done(null, {success: true})
    })
  }

  function testCreateNoValidationFunction (args, done) {
    // Initializes the data
    var entity = {title: 'A post without content'}
    // Calls the create action
    act({role: role, cmd: 'create', entity: entity, validate: true})
    .then(function (result) {
      // Checks result
      assert.ok(result.success)
      console.log('entity-crud: test_create_no_validation_function successful.')
      done(null, {success: true})
    })
  }

  function testCreateBadValidation (args, done) {
    // Initializes the data
    var entity = {title: 'A post without content'}
    // Calls the create action
    act({role: role, cmd: 'create', entity: entity, validate: true, validate_function: validatePost})
    .then(function (result) {
      // Checks result
      assert.ok(!result.success)
      console.log('entity-crud: test_create_bad_validation successful.')
      done(null, {success: true})
    })
  }

  function testCreateValidationOk (args, done) {
    // Initializes the data
    var entity = {title: 'A good post', content: 'lorem ipsum'}
    // Calls the create action
    act({role: role, cmd: 'create', entity: entity, validate: true, validate_function: validatePost})
    .then(function (result) {
      // Checks result
      assert.ok(result.success)
      assert.notEqual(result.entity.id, null)
      assert.notEqual(result.entity.last_update, null)
      console.log('entity-crud: test_create_validation_ok successful.')
      done(null, {success: true})
    })
  }

  function testCreate (args, done) {
    // Initializes the data
    var entity = {title: 'The life of cats', content: '<h1>This is a great post about cats</h1><p>Maoww...</p>'}
    // Calls the create action
    act({role: role, cmd: 'create', entity: entity})
    .then(function (result) {
      // Checks result
      assert.ok(result.success)
      assert.notEqual(result.entity.id, null)
      assert.notEqual(result.entity.last_update, null)
      console.log('entity-crud: test_create successful.')
      done(null, {success: true})
    })
  }

  function testCreateNoNamespace (args, done) {
    // Initializes the data
    var entity = {title: 'Security', content: '<h1>Security</h1><p>We don\'t want namespaces!</p>'}
    // Calls the create action
    act({role: role, cmd: 'create', entity: entity, nonamespace: true})
    .then(function (result) {
      // Checks result
      assert.ok(result.success)
      assert.equal(result.entity.entity$, null)
      assert.notEqual(result.entity.id, null)
      assert.notEqual(result.entity.last_update, null)
      console.log('entity-crud: test_create_nonamespace successful.')
      done(null, {success: true})
    })
  }

  /* READ */

  function testRead (args, done) {
    // Initializes the data
    var entity = {title: 'Life on Mars', content: 'Listen to this song written by  David Bowie.'}
    // Calls the create action
    act({role: role, cmd: 'create', entity: entity})
    .then(function (result) {
      // Checks result
      assert.notEqual(result.entity.id, null)
         // Calls the read action
      act({role: role, cmd: 'read', id: result.entity.id})
      .then(function (result) {
        // Checks result
        assert.ok(result.success)
        assert.equal(result.entity.title, entity.title)
        console.log('entity-crud: test_read successful.')
        done(null, {success: true})
      })
    })
  }

  function testReadNoNamespace (args, done) {
    // Initializes the data
    var entity = {title: 'Security', content: '<h1>Security</h1><p>We don\'t want namespaces!</p>'}
    // Calls the create action
    act({role: role, cmd: 'create', entity: entity})
    .then(function (result) {
      // Checks result
      assert.notEqual(result.entity.id, null)
         // Calls the read action
      act({role: role, cmd: 'read', id: result.entity.id, nonamespace: true})
      .then(function (result) {
        // Checks result
        assert.ok(result.success)
        assert.equal(result.entity.entity$, null)
        assert.equal(result.entity.title, entity.title)
        console.log('entity-crud: test_read_nonamespace successful.')
        done(null, {success: true})
      })
    })
  }

  function testReadNotFound (args, done) {
     // Calls the read action
    act({role: role, cmd: 'read', id: 'this-is-not-a-good-id'})
    .then(function (result) {
         // Checks result
      assert.ok(!result.success)
      console.log('entity-crud: test_read_not_found successful.')
      done(null, {success: true})
    })
  }

  /* UPDATE */

  function testUpdate (args, done) {
    // Initializes the data
    var content = 'Listen to this song written by David Bowie.'
    var updateTitle = 'Life on Mars'
    var updateTag = 'A tag'
    var entity = {title: 'Life on Venus', content: content}
    // Calls the create action
    act({role: role, cmd: 'create', entity: entity})
    .then(function (result) {
         // Checks result
      assert.notEqual(result.entity.id, null)
        // Calls the update action
      var updateEntity = {id: result.entity.id, title: updateTitle, tag: updateTag}
      act({role: role, cmd: 'update', entity: updateEntity})
      .then(function (result) {
             // Checks result
        assert.ok(result.success)
          // Calls the read action
        act({role: role, cmd: 'read', id: result.entity.id})
        .then(function (result) {
          // Checks result
          assert.ok(result.success)
          assert.equal(result.entity.title, updateTitle)
          assert.equal(result.entity.content, content)
          assert.equal(result.entity.tag, updateTag)
          console.log('entity-crud: test_update successful.')
          done(null, {success: true})
        })
      })
    })
  }

  function testUpdateNoNamespace (args, done) {
    // Initializes the data
    var content = 'Listen to this song written by David Bowie.'
    var updateTitle = 'Life on Mars'
    var updateTag = 'A tag'
    var entity = {title: 'Life on Venus', content: content}
    // Calls the create action
    act({role: role, cmd: 'create', entity: entity})
    .then(function (result) {
         // Checks result
      assert.notEqual(result.entity.id, null)
        // Calls the update action
      var updateEntity = {id: result.entity.id, title: updateTitle, tag: updateTag}
      act({role: role, cmd: 'update', entity: updateEntity, nonamespace: true})
      .then(function (result) {
             // Checks result
        assert.ok(result.success)
        assert.equal(result.entity.entity$, null)
          // Calls the read action
        act({role: role, cmd: 'read', id: result.entity.id})
        .then(function (result) {
          // Checks result
          assert.ok(result.success)
          assert.equal(result.entity.title, updateTitle)
          assert.equal(result.entity.content, content)
          assert.equal(result.entity.tag, updateTag)
          console.log('entity-crud: test_update_nonamespace successful.')
          done(null, {success: true})
        })
      })
    })
  }

  /* DELETE */

  function testDelete (args, done) {
    // Initializes the data
    var entity = {title: 'I want to be removed', content: 'Goodbye Cruel World.'}
    // Calls the create action
    act({role: role, cmd: 'create', entity: entity})
    .then(function (result) {
         // Checks result
      assert.notEqual(result.entity.id, null)
           // Calls the delete action
      var id = result.entity.id
      act({role: role, cmd: 'delete', id: id})
      .then(function (result) {
             // Checks result
        assert.ok(result.success)
          // Calls the read action
        act({role: role, cmd: 'read', id: id})
        .then(function (result) {
          // Checks result
          assert.ok(!result.success)
          console.log('entity-crud: test_delete successful.')
          done(null, {success: true})
        })
      })
    })
  }

  /* TRUNCATE */

  function testTruncate (args, done) {
     // Calls the create action
    act({role: role, cmd: 'create', entity: {title: 't1', content: 'c1'}})
    .then(function (result) {
      // Calls the query action
      act({role: role, cmd: 'query'})
      .then(function (result) {
             // Checks result
        assert.ok(result.success)
        assert.ok(result.list.length > 0)
        // Calls the truncate action
        act({role: role, cmd: 'truncate'})
        .then(function (result) {
          // Checks result
          assert.ok(result.success)
          // Calls the query action
          act({role: role, cmd: 'query'})
          .then(function (result) {
            // Checks result
            assert.ok(result.success)
            assert.equal(result.list.length, 0)
            console.log('entity-crud: test_truncate successful.')
            done(null, {success: true})
          })
        })
      })
    })
  }

  /* QUERY */

  function testQuery (args, done) {
     // Calls the truncate action
    act({role: role, cmd: 'truncate'})
    .then(function (result) {
        // Checks result
      assert.ok(result.success)
      // Creates data
      var posts = [
        {title: 'The life of cats', content: '<h1>This is a great post about cats</h1><p>Maoww</p>'},
        {title: 'Monday', content: 'The week begins!'},
        {title: 'Tuesday', content: 'Ruby tuesday?'},
        {title: 'Life on Mars', content: 'Listen to this song written by David Bowie.'},
        {title: 'Tuesday', content: 'The week continues...'}
      ]
      var cmds = []
      posts.forEach(function (item) {
        var command = act({role: role, cmd: 'create', entity: item})
        cmds.push(command)
      })
      promise.all(cmds)
      .then(function (results) {
        // Tuesday titles count
        var tuesdayCount = 0
        for (let post of posts) {
          if (post.title === 'Tuesday') {
            tuesdayCount++
          }
        }
        // Retrieves all data
        act({role: role, cmd: 'query'})
        .then(function (result) {
               // Checks result
          assert.ok(result.success)
          assert.equal(result.list.length, posts.length)
          assert.equal(result.count, posts.length)
          return result
        })
        .then(function (result) {
          // Retrieves Tuesday titles
          act({role: role, cmd: 'query', select: {title: 'Tuesday'}})
          .then(function (result) {
                 // Checks result
            assert.ok(result.success)
            assert.equal(result.list.length, tuesdayCount)
            assert.equal(result.count, tuesdayCount)
            return result
          })
        })
        .then(function (result) {
          // Sorts data
          act({role: role, cmd: 'query', select: {sort$: {title: 1}}})
          .then(function (result) {
                 // Checks result
            assert.ok(result.success)
            assert.equal(result.count, posts.length)
            assert.equal(result.list[0].title, 'Life on Mars')
            return result
          })
        })
        .then(function (result) {
          // Count
          act({role: role, cmd: 'count', select: {title: 'Tuesday'}})
          .then(function (result) {
            // Checks result
            assert.ok(result.success)
            assert.equal(result.count, tuesdayCount)
            console.log('entity-crud: test_query successful.')
            // Returns success
            done(null, {success: true})
          })
        })
      })
    })
  }

  function testQueryNoNamespace (args, done) {
     // Calls the truncate action
    act({role: role, cmd: 'truncate'})
    .then(function (result) {
        // Checks result
      assert.ok(result.success)
      // Creates data
      var posts = [
        {title: 'The life of cats', content: '<h1>This is a great post about cats</h1><p>Maoww</p>'},
        {title: 'Monday', content: 'The week begins!'},
        {title: 'Tuesday', content: 'Ruby tuesday?'},
        {title: 'Life on Mars', content: 'Listen to this song written by David Bowie.'},
        {title: 'Tuesday', content: 'The week continues...'}
      ]
      var cmds = []
      posts.forEach(function (item) {
        var command = act({role: role, cmd: 'create', entity: item})
        cmds.push(command)
      })
      promise.all(cmds)
      .then(function (results) {
        // Retrieves all data
        act({role: role, cmd: 'query', nonamespace: true})
        .then(function (result) {
               // Checks result
          assert.ok(result.success)
          assert.equal(result.list.length, posts.length)
          assert.equal(result.count, posts.length)
          result.list.forEach(function (item) {
            assert.equal(item.entity$, null)
          })
          console.log('entity-crud: test_query_nonamespace successful.')
          // Returns success
          done(null, {success: true})
        })
      })
    })
  }

  function testDeepQuery (args, done) {
     // Calls the truncate action
    act({role: role, cmd: 'truncate'})
    .then(function (result) {
        // Checks result
      assert.ok(result.success)
      // Creates data
      var posts = [
        {title: 'The life of cats', content: '<h1>This is a great post about cats</h1><p>Maoww</p>', data: {zipcode: '59491', number: 15}},
        {title: 'Monday', content: 'The week begins!', data: {jobi: 'joba'}},
        {title: 'Tuesday', content: 'Ruby tuesday?', data: {zipcode: '59491', number: 7}},
        {title: 'Life on Mars', content: 'Listen to this song written by David Bowie.', data: {zipcode: '59491', number: 15}},
        {title: 'Tuesday', content: 'The week continues...', data: {zipcode: '59491', number: 69}}
      ]
      var cmds = []
      posts.forEach(function (item) {
        var command = act({role: role, cmd: 'create', entity: item})
        cmds.push(command)
      })
      promise.all(cmds)
      .then(function (results) {
        // Tuesday titles count
        var zipcodeCount = 0
        for (let post of posts) {
          if (post.data.zipcode === '59491') {
            zipcodeCount++
          }
        }
        // Retrieves all data
        act({
          role: role,
          cmd: 'query',
          deepselect: [
            {property: 'data.zipcode', value: '59491'}
          ]
        })
        .then(function (result) {
               // Checks result
          assert.ok(result.success)
          assert.equal(result.list.length, zipcodeCount)
          return result
        })
        .then(function (result) {
          // Count
          act({
            role: role,
            cmd: 'query',
            select: {title: 'Monday'},
            deepselect: [
              {property: 'data.zipcode', value: '59491'}
            ]
          })
          .then(function (result) {
            // Checks result
            assert.ok(result.success)
            assert.equal(result.list.length, 0)
            console.log('entity-crud: test_deep_query successful.')
            // Returns success
            done(null, {success: true})
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
