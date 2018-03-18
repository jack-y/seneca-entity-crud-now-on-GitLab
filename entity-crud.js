/* Copyright (c) 2016-2018 e-soa Jacques Desodt */
'use strict'

/* Default plugin options */
const pluginName = 'seneca-entity-crud'
const config = require('./config/' + pluginName)

/* Prerequisites */
const processAppend = require('./process/append')
const processDefault = require('./process/default')
const processFormat = require('./process/format')
const processJoin = require('./process/join')
const processRelationship = require('./process/relationship')
const processSelect = require('./process/select')
const promise = require('bluebird')

/* Plugin begins */
module.exports = function (options) {
  /* Initializations */
  const seneca = this
  seneca.log.debug('Loading plugin:', seneca.context.full)
  seneca.log.debug('Default options:', config)
  seneca.log.debug('User options:', options)

  /* Merge default options with options passed in seneca.use('plugin', options) */
  options = seneca.util.deepextend(config, options)
  seneca.log.debug('Options:', options)

  /* Promisify seneca actions */
  const act = promise.promisify(seneca.act, {context: seneca})

  /* --------------- ACTIONS --------------- */

  /* CRUD actions */
  seneca.add({role: options.role, cmd: 'create', validate: true}, validateAndCreate)
  seneca.add({role: options.role, cmd: 'create'}, create)
  seneca.add({role: options.role, cmd: 'read'}, read)
  seneca.add({role: options.role, cmd: 'update', validate: true}, validateAndUpdate)
  seneca.add({role: options.role, cmd: 'update'}, update)
  seneca.add({role: options.role, cmd: 'delete'}, delet)  /* The 'delete' function name is already used in Javascript */

  /* Others database actions */
  seneca.add({role: options.role, cmd: 'validate'}, validate)
  seneca.add({role: options.role, cmd: 'deleterelationships'}, deleteRelationships)
  seneca.add({role: options.role, cmd: 'truncate'}, truncate)
  seneca.add({role: options.role, cmd: 'query'}, query)
  seneca.add({role: options.role, cmd: 'count'}, count)
  seneca.add({role: options.role, cmd: 'check'}, check)

  /* --------------- FUNCTIONS --------------- */

  function validateDefault (args) {
    return new Promise(function (resolve, reject) {
      resolve({success: true, errors: []})
    })
  }

  /* Validate
     The validation function is passed as argument. */
  function validate (args, done) {
    /* Checks the arguments validate function */
    var validateFunction = args.validate_function ? args.validate_function : validateDefault
    /* Validates input data */
    validateFunction(args)
    .then(function (result) {
      done(null, result)
    })
  }

  /* Validate and create: new entity persistence
     Before the insert, the entity data validation is called.
     If the validation fail, return the errors array.
     Otherwise the create command is called. */
  function validateAndCreate (args, done) {
    /* Validates */
    validate(args, function (err, validateResult) {
      if (err) { throw err }
      /* Checks validation */
      if (validateResult.success) {
        /* Gets the namespace */
        var zone = args.zone ? args.zone : options.zone
        var base = args.base ? args.base : options.base
        var name = args.name ? args.name : options.name
        /* Creates the entity */
        act({role: options.role, zone: zone, base: base, name: name, cmd: 'create', entity: args.entity})
        .then(function (result) {
          done(null, result)
        })
        .catch(function (err) { throw err })
      } else {
        /* Validation fails: returns the errors */
        done(null, validateResult)
      }
    })
  }

  /* CRUD Create: new entity persistence
     If the 'last_update' option is set to true, the field 'last_update'
     is set on current date and added to the entity before insert. */
  function create (args, done) {
    var errors = args.errors ? args.errors : []
    /* Checks if the entity is passed */
    if (!args.entity) {
      errors.push({field: null, actual: null, error: options.msg_no_entity})
      done(null, {success: false, errors: errors})
    } else {
      /* Gets the entity */
      var entity = args.entity
      /* Checks if the last update date has to be set */
      if (options.last_update) {
        entity.last_update = Date.now()
      }
      /* Gets the namespace */
      var zone = args.zone ? args.zone : options.zone
      var base = args.base ? args.base : options.base
      var name = args.name ? args.name : options.name
      /* Saves the entity in the database */
      var entityFactory = seneca.make$(zone, base, name)
      entityFactory.save$(entity, function (err, entity) {
        if (err) { throw err }
        /* Removes the namespace */
        if (args.nonamespace || args.nonamespace === 'true') {
          /* Removes the seneca field
             Don't use delete entity.entity$ -> error */
          delete entity['entity$']
        }
        /* Returns the new entity with its id set */
        done(null, {success: true, errors: [], entity: entity})
      })
    }
  }

  /* CRUD Read: reads an entity from its ID
     If the entity is not found, return {success:false}. */
  function read (args, done) {
    /* Gets the namespace */
    var zone = args.zone ? args.zone : options.zone
    var base = args.base ? args.base : options.base
    var name = args.name ? args.name : options.name
    /* Gets the optional default values */
    var defaults = args.defaults ? args.defaults : {}
    /* Gets the entity factory */
    var entityFactory = seneca.make$(zone, base, name)
    /* Reads the entity in the database */
    entityFactory.load$(args.id, (err, entity) => {
      if (err) { throw err }
      /* Removes the namespace */
      if (entity && (args.nonamespace || args.nonamespace === 'true')) {
        /* Removes the seneca field
           Don't use delete entity.entity$ -> error */
        delete entity['entity$']
      }
      /* Adds the default values */
      processDefault.add(entity, defaults)
      .then(function (entity_1) {
        /* Adds the joins data */
        processJoin.join(act, entity_1, args.joins)
        .then(function (entity_2) {
          /* Adds the appends data */
          processAppend.append(act, entity_2, args.appends)
          .then(function (entity_3) {
            /* Returns the read entity or success = false */
            done(null, {success: (entity !== null), entity: entity_3})
          })
          .catch(function (err) { throw err })
        })
        .catch(function (err) { throw err })
      })
      .catch(function (err) { throw err })
    })
  }

  /* Validate and update: updated entity persistence
     Before the update, the entity data validation is called.
     If the validation fail, return the errors array.
     Otherwise the Update command is called. */
  function validateAndUpdate (args, done) {
    /* Validates */
    validate(args, function (err, validateResult) {
      if (err) { throw err }
      /* Checks the validation */
      if (validateResult.success) {
        /* Gets the namespace */
        var zone = args.zone ? args.zone : options.zone
        var base = args.base ? args.base : options.base
        var name = args.name ? args.name : options.name
        /* Updates the entity */
        act({role: options.role, zone: zone, base: base, name: name, cmd: 'update', entity: args.entity})
        .then(function (result) {
          done(null, result)
        })
        .catch(function (err) { throw err })
      } else {
        /* Validation fails: returns the errors */
        done(null, validateResult)
      }
    })
  }

  /* CRUD Update: updated entity persistence
     If the 'last_update' option is set to true, the field 'last_update'
     is set on current date and added to the entity before update. */
  function update (args, done) {
    var errors = []
    /* Gets the entity (ID must be set) */
    var updateEntity = args.entity
    /* Checks if the last update date has to be set */
    if (options.last_update) {
      updateEntity.last_update = Date.now()
    }
    /* Gets the namespace */
    var zone = args.zone ? args.zone : options.zone
    var base = args.base ? args.base : options.base
    var name = args.name ? args.name : options.name
    /* Gets the entity factory */
    var entityFactory = seneca.make$(zone, base, name)
    /* Reads the origin entity in the database */
    entityFactory.load$(updateEntity.id, (err, readEntity) => {
      if (err) { throw err }
      /* Checks if the entity is found */
      var success = readEntity !== null
      if (success) {
        /* Merges the fields */
        Object.assign(readEntity, updateEntity)
        /* Saves the entity in the database */
        entityFactory.save$(readEntity, function (err, updatedEntity) {
          if (err) { throw err }
          /* Removes the namespace */
          if (args.nonamespace || args.nonamespace === 'true') {
            /* Removes the seneca field
               Don't use delete entity.entity$ -> error */
            delete updatedEntity['entity$']
          }
          /* Returns the updated entity */
          return done(null, {success: true, errors: errors, entity: updatedEntity})
        })
      } else {
        errors.push({field: 'id', actual: updateEntity.id, error: 'not found'})
        done(null, {success: false, errors: errors, entity: readEntity})
      }
    })
  }

  /* CRUD Delete: deletes an entity from its ID
     If the entity is not found, return {success:false}. */
  function delet (args, done) {
    /* Gets the namespace */
    var zone = args.zone ? args.zone : options.zone
    var base = args.base ? args.base : options.base
    var name = args.name ? args.name : options.name
    /* Gets the entity factory */
    var entityFactory = seneca.make$(zone, base, name)
    /* Deletes the entity in the database */
    entityFactory.remove$(args.id, (err, result) => {
      if (err) { throw err }
      /* Returns success */
      done(null, {success: true})
    })
  }

  /* Delete relationships: deletes all relationships of an entity from its ID
    All the deletions are in asynchronous mode. */
  function deleteRelationships (args, done) {
    /* Checks if the relationships are set */
    if (args.relationships) {
      var promises = []
      /* Loops on each relationship */
      args.relationships.forEach(function (aRelationship) {
        promises.push(processRelationship.deleteOneRelationship(act, options, args, aRelationship))
      })
      /* Fires all the promises */
      promise.all(promises)
      .then(function (results) {
        return done(null, {success: true, results: results})
      })
      .catch(function (err) { throw err })
    } else {
      /* No relationships */
      return done(null, {success: true, results: []})
    }
  }

  /* Truncate: deletes all the entities from the database
     TODO: find another optimized process for big data. */
  function truncate (args, done) {
    /* Gets the namespace */
    var zone = args.zone ? args.zone : options.zone
    var base = args.base ? args.base : options.base
    var name = args.name ? args.name : options.name
    /* Gets the entity factory */
    var entityFactory = seneca.make$(zone, base, name)
    /* Gets the list of all the entities from the database */
    entityFactory.list$({}, (err, list) => {
      if (err) { throw err }
      /* Deletes each entity */
      var promises = []
      list.forEach(function (item) {
        promises.push(act({role: options.role, zone: zone, base: base, name: name, cmd: 'delete', id: item.id}))
      })
      promise.all(promises)
      .then(function (results) {
        /* Returns success */
        done(null, {success: true})
      })
      .catch(function (err) { throw err })
    })
  }

  /* Query: gets lists of entities from the database
     See: http://senecajs.org/docs/tutorials/understanding-query-syntax.html
    for filters, sorts and others options. */
  function query (args, done) {
    /* Gets the namespace */
    var zone = args.zone ? args.zone : options.zone
    var base = args.base ? args.base : options.base
    var name = args.name ? args.name : options.name
    /* Gets the optional defaults */
    var defaults = args.defaults ? args.defaults : {}
    /* Gets the entity factory */
    var entityFactory = seneca.make$(zone, base, name)
    /* Gets the query options */
    var select = args.select ? args.select : {}
    var deepSelect = args.deepselect ? args.deepselect : []
    var joins = args.joins ? args.joins : []
    var nonamespace = args.nonamespace || args.nonamespace === 'true'
    var selection = args.selection ? args.selection : null
    /* Gets the list from the database */
    entityFactory.list$(select, (err, list) => {
      if (err) { throw err }
      /* Checks if the joins are to be performed first */
      if (args.joinfirst) {
        /* First: performs the joins */
        processJoin.readJoinsForList(act, list, joins)
        .then(function (result) {
          /* Formats: deep select, selection, nonamespace and defaults */
          var formattedList = processFormat.formatList(result.list, deepSelect, selection, nonamespace, defaults)
          /* Adds the appends data */
          processAppend.readAppendsForList(act, formattedList, args.appends)
          .then(function (appendResult) {
            /* Returns the query result with joins */
            return done(null, {success: true, list: appendResult.list, count: appendResult.list.length})
          })
          .catch(function (err) { throw err })
        })
        .catch(function (err) { throw err })
      } else {
        /* No joins first
           Formats: deep select, selection, nonamespace and defaults */
        var formattedList = processFormat.formatList(list, deepSelect, selection, nonamespace, defaults)
        /* Performs the joins */
        processJoin.readJoinsForList(act, formattedList, joins)
        .then(function (result) {
          /* Adds the appends data */
          processAppend.readAppendsForList(act, result.list, args.appends)
          .then(function (appendResult) {
            /* Returns the query result with joins */
            return done(null, {success: true, list: appendResult.list, count: appendResult.list.length})
          })
          .catch(function (err) { throw err })
        })
        .catch(function (err) { throw err })
      }
    })
  }

  /* Count: gets count from lists of entities from the database
     See: http://senecajs.org/docs/tutorials/understanding-query-syntax.html
     for filters, sorts and others options. */
  function count (args, done) {
    /* Gets the namespace */
    var zone = args.zone ? args.zone : options.zone
    var base = args.base ? args.base : options.base
    var name = args.name ? args.name : options.name
    /* Gets the entity factory */
    var entityFactory = seneca.make$(zone, base, name)
    /* Gets the query options */
    var select = args.select ? args.select : {}
    var deepSelect = args.deepselect ? args.deepselect : []
    /* Gets the list from the database */
    entityFactory.list$(select, (err, list) => {
      if (err) { throw err }
      var deepList = list
      var listCount = list.length
      var deepSelectCount = deepSelect.length
      // Process the list
      if (deepSelectCount > 0 && listCount > 0) {
        // Loops on each deep select
        deepSelect.forEach(function (item) {
          deepList = processSelect.selectDeep(deepList, item)
        })
      }
      /* Returns the list */
      done(null, {success: true, count: deepList.length})
    })
  }

  /* Check: to verify that the store is OK
     This is done using create and delete operations. */
  function check (args, done) {
    /* Initializes */
    var entity = args.entity ? args.entity : {check: 'check'}
    /* Gets the namespace */
    var zone = args.zone ? args.zone : options.zone
    var base = args.base ? args.base : options.base
    var name = args.name ? args.name : options.name
    /* Creates the entity */
    act({role: options.role, zone: zone, base: base, name: name, cmd: 'create', entity: entity})
    .then(function (result) {
      /* Checks if the create operation is successful */
      if (result.success && result.entity && result.entity.id) {
        /* Deletes the entity */
        act({role: options.role, zone: zone, base: base, name: name, cmd: 'delete', id: result.entity.id})
        .then(function (result) {
          /* Checks if the delete operation is successful */
          if (result.success) {
            done(null, {success: true})
          } else {
            /* Error on delete */
            done(null, {success: false, errors: result.errors, command: 'delete'})
          }
        })
        .catch(function (err) {
          done(null, {success: false, errors: [err], command: 'delete'})
        })
      } else {
        /* Error on create */
        done(null, {success: false, errors: result.errors, command: 'create'})
      }
    })
    .catch(function (err) {
      console.log('catch create')
      done(null, {success: false, errors: [err], command: 'create'})
    })
  }

  /* plugin ends */
  return {
    name: 'entity-crud'
  }
}
