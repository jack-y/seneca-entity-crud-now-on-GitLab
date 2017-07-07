/* Copyright (c) 2016-2017 e-soa Jacques Desodt */
'use strict'

/* Default plugin options */
const pluginName = 'seneca-entity-crud'
const config = require('./config/' + pluginName)

/* Prerequisites */
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
  seneca.add({role: options.role, cmd: 'delete'}, delet)  // The 'delete' function is already defined in Javascript

  /* other database actions */
  seneca.add({role: options.role, cmd: 'validate'}, validate)
  seneca.add({role: options.role, cmd: 'deleterelationships'}, deleteRelationships)
  seneca.add({role: options.role, cmd: 'truncate'}, truncate)
  seneca.add({role: options.role, cmd: 'query'}, query)
  seneca.add({role: options.role, cmd: 'count'}, count)

  /* --------------- FUNCTIONS --------------- */

  function validateDefault (args) {
    return new Promise(function (resolve, reject) {
      resolve({success: true, errors: []})
    })
  }

  /**
   * Validate.
   *
   * The validation function is passed as argument.
   */
  function validate (args, done) {
    // Checks the arguments validate function
    var validateFunction = args.validate_function ? args.validate_function : validateDefault
    // Validates input data
    validateFunction(args)
    .then(function (result) {
      done(null, result)
    })
  }

  /**
   * Validate and create: new entity persistence.
   *
   * Before the insert, the entity data validation is called.
   * If the validation fail, return the errors array.
   * Otherwise the create command is called.
   */
  function validateAndCreate (args, done) {
    // Validates
    validate(args, function (err, validateResult) {
      if (err) { throw err }
      // Checks validation
      if (validateResult.success) {
        // Gets the namespace
        var zone = args.zone ? args.zone : options.zone
        var base = args.base ? args.base : options.base
        var name = args.name ? args.name : options.name
        // Creates the entity
        act({role: options.role, zone: zone, base: base, name: name, cmd: 'create', entity: args.entity})
        .then(function (result) {
          done(null, result)
        })
      } else {
        // Validation fail: returns errors
        done(null, validateResult)
      }
    })
  }

  /**
   * CRUD Create: new entity persistence.
   *
   * If the 'last_update' option is set to true, the field 'last_update'
   * is set on current date and added to the entity before insert.
   */
  function create (args, done) {
    var errors = args.errors ? args.errors : []
    // Checks if the entity is passed
    if (!args.entity) {
      errors.push({field: null, actual: null, error: options.msg_no_entity})
      done(null, {success: false, errors: errors})
    } else {
      // Gets the entity
      var entity = args.entity
      // Checks if last update date has to be set
      if (options.last_update) {
        entity.last_update = Date.now()
      }
      // Gets the namespace
      var zone = args.zone ? args.zone : options.zone
      var base = args.base ? args.base : options.base
      var name = args.name ? args.name : options.name
      // Saves the entity in the database
      var entityFactory = seneca.make$(zone, base, name)
      entityFactory.save$(entity, function (err, entity) {
        if (err) { throw err }
        // Removes the namespace
        if (args.nonamespace || args.nonamespace === 'true') {
          // Don't use delete entity.entity$ -> error
          delete entity['entity$']
        }
        // Returns the new entity with id set
        done(null, {success: true, errors: [], entity: entity})
      })
    }
  }

  /**
   * CRUD Read: reads an entity from its ID.
   *
   * If the entity is not found, return {success:false}.
   */
  function read (args, done) {
    // Gets the namespace
    var zone = args.zone ? args.zone : options.zone
    var base = args.base ? args.base : options.base
    var name = args.name ? args.name : options.name
    // Gets the optional defaults
    var defaults = args.defaults ? args.defaults : {}
    // Gets the entity factory
    var entityFactory = seneca.make$(zone, base, name)
    // Reads the entity in the database
    entityFactory.load$(args.id, (err, entity) => {
      if (err) { throw err }
      // Checks if the entity is found
      var success = entity !== null
      // Removes the namespace
      if (args.nonamespace || args.nonamespace === 'true') {
        // Don't use delete entity.entity$ -> error
        delete entity['entity$']
      }
      // Adds the defaults
      if (success && defaults) {
        for (let defaultName in defaults) {
          if (!entity[defaultName]) {
            entity[defaultName] = defaults[defaultName]
          }
        }
      }
      // Checks if joins are requested
      var joinsList = args.joins ? args.joins : null
      if (success && joinsList) {
        // Perform the joins reading
        readJoins(entity, joinsList)
        .then(function (result) {
          // Returns the read entity with joins
          return done(null, {success: success, entity: result.entity})
        })
      } else {
        // Returns the read entity or success=false
        done(null, {success: success, entity: entity})
      }
    })
  }

  /**
   * Validate and update: updated entity persistence.
   *
   * Before the update, the entity data validation is called.
   * If the validation fail, return the errors array.
   * Otherwise the Update command is called.
   */
  function validateAndUpdate (args, done) {
    // Validates
    validate(args, function (err, validateResult) {
      if (err) { throw err }
      // Checks validation
      if (validateResult.success) {
        // Gets the namespace
        var zone = args.zone ? args.zone : options.zone
        var base = args.base ? args.base : options.base
        var name = args.name ? args.name : options.name
        // Creates the entity
        act({role: options.role, zone: zone, base: base, name: name, cmd: 'update', entity: args.entity})
        .then(function (result) {
          done(null, result)
        })
      } else {
        // Validation fail: returns errors
        done(null, validateResult)
      }
    })
  }

  /**
  * CRUD Update: updated entity persistence.
  *
  * If the 'last_update' option is set to true, the field 'last_update'
  * is set on current date and added to the entity before update.
  */
  function update (args, done) {
    var errors = []
    // Gets the entity (ID must be set)
    var updateEntity = args.entity
    // Checks if last update date has to be set
    if (options.last_update) {
      updateEntity.last_update = Date.now()
    }
    // Gets the namespace
    var zone = args.zone ? args.zone : options.zone
    var base = args.base ? args.base : options.base
    var name = args.name ? args.name : options.name
    var entityFactory = seneca.make$(zone, base, name)
    // Reads the origin entity in the database
    entityFactory.load$(updateEntity.id, (err, readEntity) => {
      if (err) { throw err }
      // Checks if the entity is found
      var success = readEntity !== null
      if (success) {
        // Merges the fields
        Object.assign(readEntity, updateEntity)
        // Saves the entity in the database
        entityFactory.save$(readEntity, function (err, updatedEntity) {
          if (err) { throw err }
          // Removes the namespace
          if (args.nonamespace || args.nonamespace === 'true') {
            // Don't use delete entity.entity$ -> error
            delete updatedEntity['entity$']
          }
          // Returns the updated entity
          return done(null, {success: true, errors: errors, entity: updatedEntity})
        })
      } else {
        errors.push({field: 'id', actual: updateEntity.id, error: 'not found'})
        done(null, {success: false, errors: errors, entity: readEntity})
      }
    })
  }

  /**
  * CRUD Delete: deletes an entity from its ID.
  *
  * If the entity is not found, return {success:false}.
  */
  function delet (args, done) {
    // Gets the namespace
    var zone = args.zone ? args.zone : options.zone
    var base = args.base ? args.base : options.base
    var name = args.name ? args.name : options.name
    // Database entity creation
    var entityFactory = seneca.make$(zone, base, name)
    // Deletes the entity in the database
    entityFactory.remove$(args.id, (err, result) => {
      if (err) { throw err }
      // Returns success
      done(null, {success: true})
    })
  }

  /**
  * Delete relationships: deletes all relationships of an entity from its ID.
  *
  * All the deletions are in asynchronous mode.
  */
  function deleteRelationships (args, done) {
    // Checks if relationships are set
    if (args.relationships) {
      // Loops on each relationship
      args.relationships.forEach(function (aRelationship) {
        deleteOneRelationship(args, aRelationship)
      })
    }
    done(null, {success: true})
  }

  /**
  * Truncate: deletes all the entities from the database.
  *
  * TODO: find another optimized process for big data.
  */
  function truncate (args, done) {
    // Gets the namespace
    var zone = args.zone ? args.zone : options.zone
    var base = args.base ? args.base : options.base
    var name = args.name ? args.name : options.name
    // Gets the entity factory
    var entityFactory = seneca.make$(zone, base, name)
    // Gets the list of all the entities from the database
    entityFactory.list$({}, (err, list) => {
      if (err) { throw err }
      // Deletes each entity
      var cmds = []
      list.forEach(function (item) {
        var command = act({role: options.role, zone: zone, base: base, name: name, cmd: 'delete', id: item.id})
        cmds.push(command)
      })
      promise.all(cmds)
      .then(function (results) {
        // Returns success
        done(null, {success: true})
      })
    })
  }

  /**
  * Query: gets lists of entities from the database.
  *
  * See <a href="http://senecajs.org/docs/tutorials/understanding-query-syntax.html">the seneca syntax</a>
  * for filters, sorts and others options.
  */
  function query (args, done) {
    // Gets the namespace
    var zone = args.zone ? args.zone : options.zone
    var base = args.base ? args.base : options.base
    var name = args.name ? args.name : options.name
    // Gets the optional defaults
    var defaults = args.defaults ? args.defaults : {}
    // Gets the entity factory
    var entityFactory = seneca.make$(zone, base, name)
    // Gets the query options
    var select = args.select ? args.select : {}
    var deepSelect = args.deepselect ? args.deepselect : []
    // Gets the list from the database
    entityFactory.list$(select, (err, list) => {
      if (err) { throw err }
      var deepList = list
      var listCount = list.length
      var deepSelectCount = deepSelect.length
      // Process the list
      if (deepSelectCount > 0 && listCount > 0) {
        // Loops on each deep select
        deepSelect.forEach(function (item) {
          deepList = selectDeep(deepList, item)
        })
      }
      // Removes the namespace
      if ((args.nonamespace || args.nonamespace === 'true') && deepList.length > 0) {
        deepList.forEach(function (item) {
          // Don't use delete entity.entity$ -> error
          delete item['entity$']
        })
      }
      // Adds the defaults
      if (defaults) {
        for (let defaultName in defaults) {
          deepList.forEach(function (item) {
            if (!item[defaultName]) {
              item[defaultName] = defaults[defaultName]
            }
          })
        }
      }
      // Checks if joins are requested
      var joinsList = args.joins ? args.joins : null
      if (deepList.length > 0 && joinsList) {
        // Perform the joins reading
        readJoinsForList(deepList, joinsList)
        .then(function (result) {
          // Returns the read entity with joins
          return done(null, {success: true, list: result.list, count: result.list.length})
        })
      } else {
        // Returns the list
        done(null, {success: true, list: deepList, count: deepList.length})
      }
    })
  }

  /**
  * Count: gets count from lists of entities from the database.
  *
  * See <a href="http://senecajs.org/docs/tutorials/understanding-query-syntax.html">the seneca syntax</a>
  * for filters, sorts and others options.
  */
  function count (args, done) {
    // Gets the namespace
    var zone = args.zone ? args.zone : options.zone
    var base = args.base ? args.base : options.base
    var name = args.name ? args.name : options.name
    // Gets the entity factory
    var entityFactory = seneca.make$(zone, base, name)
    // Gets the query options
    var select = args.select ? args.select : {}
    var deepSelect = args.deepselect ? args.deepselect : []
    // Gets the list from the database
    entityFactory.list$(select, (err, list) => {
      if (err) { throw err }
      var deepList = list
      var listCount = list.length
      var deepSelectCount = deepSelect.length
      // Process the list
      if (deepSelectCount > 0 && listCount > 0) {
        // Loops on each deep select
        deepSelect.forEach(function (item) {
          deepList = selectDeep(deepList, item)
        })
      }
      // Returns the list
      done(null, {success: true, count: deepList.length})
    })
  }

  /* Selects on a deep query */
  function selectDeep (list, select) {
    var deepList = []
    list.forEach(function (item) {
      let value = fetchFromObject(item, select.property)
      if (value === select.value) {
        deepList.push(item)
      }
    })
    return deepList
  }

  /* Finds value in a nested object */
  function fetchFromObject (anObject, property) {
    if (typeof anObject === 'undefined') {
      return false
    }
    var _index = property.indexOf('.')
    if (_index > -1) {
      return fetchFromObject(anObject[property.substring(0, _index)], property.substr(_index + 1))
    }
    return anObject[property]
  }

  /* --------------- RELATIONSHIPS --------------- */

  /**
  * Deletes one relationship in asynchronous mode
  * The master ID is in the args
  * The master may be already deleted
  **/
  function deleteOneRelationship (args, relationship) {
    // Gets the namespace
    var zone = relationship.location.zone ? relationship.location.zone : options.zone
    var base = relationship.location.base ? relationship.location.base : options.base
    var name = relationship.location.name ? relationship.location.name : options.name
    // Sets the query select to find relational entities
    var select = {}
    select[relationship.in_idname] = args.id
    // Finds the relational entities
    act({role: relationship.location.role, zone: zone, base: base, name: name, cmd: 'query', select})
    .then(function (result) {
      // Checks if query OK
      if (result.success) {
        // Loops on each relationship data
        result.list.forEach(function (item) {
          // Deletes one relationship data in asynchronous mode
          deleteOneRelationshipData(item, relationship)
        })
      }
    })
  }

  /**
  * Deletes one relationship data in asynchronous mode
  **/
  function deleteOneRelationshipData (item, relationship) {
    // Gets the namespace
    var zone = relationship.location.zone ? relationship.location.zone : options.zone
    var base = relationship.location.base ? relationship.location.base : options.base
    var name = relationship.location.name ? relationship.location.name : options.name
    // Deletes the relationship data in asynchronous mode
    seneca.act({role: relationship.location.role, zone: zone, base: base, name: name, cmd: 'delete', id: item.id})
    // Gets the slave entity ID
    var outId = item[relationship.out.idname]
    // Gets the out namespace
    var outZone = relationship.out.location.zone ? relationship.out.location.zone : options.zone
    var outBase = relationship.out.location.base ? relationship.out.location.base : options.base
    var outName = relationship.out.location.name ? relationship.out.location.name : options.name
    // Checks if relationship slave must also be deleted
    if (relationship.out.delete) {
    // Asynchronous slave delete: no return
      seneca.act({role: relationship.out.location.role, zone: outZone, base: outBase, name: outName, cmd: 'delete', id: outId})
    }
    // RECURSION: Checks if a subrelationship exists
    if (relationship.relationships) {
      // Fires the subrelationship deletion in asynchronous mode
      seneca.act({
        role: relationship.out.location.role,
        zone: outZone,
        base: outBase,
        name: outName,
        cmd: 'deleterelationships',
        id: outId,
        relationships: relationship.relationships
      })
    }
  }

  /* --------------- JOINS --------------- */

  /* Process joins on one entity */
  function readJoins (entity, joinsList) {
    return new Promise(function (resolve, reject) {
      var joinread = 0
      // Loops on each join
      joinsList.forEach(function (join, index) {
        readOneJoin(entity, join)
        .then(function (result) {
          if (++joinread === joinsList.length) {
            // When all joins are done, returns the full entity
            resolve({entity: entity})
          }
        })
      })
    })
  }

  /* Process joins on a list of entities */
  function readJoinsForList (list, joinsList) {
    return new Promise(function (resolve, reject) {
      var newList = []
      var itemread = 0
      // Loops on each entity of the list
      list.forEach(function (entity, index) {
        // Process joins on the entity
        readJoins(entity, joinsList)
        .then(function (result) {
          newList.push(result.entity)
          if (++itemread === list.length) {
            // When all joins are done, returns the full entity
            resolve({list: newList})
          }
        })
      })
    })
  }

  /* Reads the entity specified by the join */
  function readOneJoin (originEntity, join) {
    return new Promise(function (resolve, reject) {
      // Gets the namespace
      var zone = join.zone ? join.zone : null
      var base = join.base ? join.base : null
      var name = join.name ? join.name : null
      // Sets the ID and new field name
      var id = originEntity[join.idname]
      var fieldname = join.resultname ? join.resultname : join.role
      // Reads the entity by its ID
      act({role: join.role, zone: zone, base: base, name: name, cmd: 'read', id: id, joins: join.joins, nonamespace: join.nonamespace})
      .then(function (result) {
        if (result.success) {
          // Adds the result to the origin entity
          originEntity[fieldname] = result.entity
        }
        // When read is done, returns the full entity
        resolve({entity: originEntity})
      })
    })
  }

  /* plugin ends */
  return {
    name: 'entity-crud'
  }
}
