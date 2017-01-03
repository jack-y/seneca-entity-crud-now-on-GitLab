/* Copyright (c) 2016 e-soa Jacques Desodt */
'use strict'

/* Default plugin options */
const pluginName = 'seneca-entity-crud'
const config = require('./config/' + pluginName + '.js')

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
   * Validate and create: new entity persistence.
   * <p>
   * Before the insert, the entity data validation is called.
   * If the validation fail, return the errors array.
   * Otherwise the create command is called.
   *
   */
  function validateAndCreate (args, done) {
    // Checks the arguments validate function
    var validateFunction = args.validate_function ? args.validate_function : validateDefault
    // Validates input data
    validateFunction(args)
    .then(function (result) {
      // Checks validation
      if (result.success) {
        // Creates the entity
        act({role: options.role, cmd: 'create', entity: args.entity})
        .then(function (result) {
          done(null, result)
        })
      } else {
        // Validation fail: returns errors
        done(null, result)
      }
    })
  }

  /**
   * CRUD Create: new entity persistence.
   * <p>
   * Before the insert, the entity data validation is called.
   * If the validation is not successful, return the errors array.
   * <p>
   * If the 'last_update' option is set to true, the field 'last_update'
   * is set on current date and added to the entity before insert.
   */
  function create (args, done) {
    // Checks if entity is passed
    var errors = args.errors ? args.errors : []
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
      // Saves the entity in the database
      var entityFactory = seneca.make$(options.zone, options.base, options.name)
      entityFactory.save$(entity, function (err, entity) {
        if (err) { throw err }
        // Returns the new entity with id set
        done(null, {success: true, errors: [], entity: entity})
      })
    }
  }

  /**
   * CRUD Read: reads an entity from its ID.
   * <p>
   * If the entity is not found, return {success:false}.
   */
  function read (args, done) {
    // Gets the entity factory
    var entityFactory = seneca.make$(options.zone, options.base, options.name)
    // Reads the entity in the database
    entityFactory.load$(args.id, (err, entity) => {
      if (err) { throw err }
      // Checks if the entity is found
      var success = entity !== null
      // Returns the read entity or success=false
      done(null, {success: success, entity: entity})
    })
  }

  /**
   * Validate and update: updated entity persistence.
   * <p>
   * Before the update, the entity data validation is called.
   * If the validation fail, return the errors array.
   * Otherwise the Update command is called.
   *
   */
  function validateAndUpdate (args, done) {
    // Checks the arguments validate function
    var validateFunction = args.validate_function ? args.validate_function : validateDefault
    // Validates input data
    validateFunction(args)
    .then(function (result) {
      // Checks validation
      if (result.success) {
        // Creates the entity
        act({role: options.role, cmd: 'update', entity: args.entity})
        .then(function (result) {
          done(null, result)
        })
      } else {
        // Validation fail: returns errors
        done(null, result)
      }
    })
  }

  /**
  * CRUD Update: updated entity persistence.
  * <p>
  * Before the update, the entity data is validated.
  * If the validation is not successful, return the errors array.
  * <p>
  * If the 'last_update' option is set to true, the field 'last_update'
  * is set on current date and added to the entity before update.
  */
  function update (args, done) {
    // Gets the entity (ID must be set)
    var entity = args.entity
    // Checks if last update date has to be set
    if (options.last_update) {
      entity.last_update = Date.now()
    }
    // Saves the entity in the database
    var entityFactory = seneca.make$(options.zone, options.base, options.name)
    entityFactory.save$(entity, function (err, entity) {
      if (err) { throw err }
      // Returns the updated entity
      done(null, {success: true, errors: [], entity: entity})
    })
  }

  /**
  * CRUD Delete: deletes an entity from its ID.
  * <p>
  * If the entity is not found, return {success:false}.
  */
  function delet (args, done) {
    // Database entity creation
    var entityFactory = seneca.make$(options.zone, options.base, options.name)
    // Deletes the entity in the database
    entityFactory.remove$(args.id, (err, result) => {
      if (err) { throw err }
      // Returns success
      done(null, {success: true})
    })
  }

  /**
  * Truncate: deletes all the entities from the database.
  * <p>
  * TODO: find another optimized process for big data.
  *
  */
  function truncate (args, done) {
  // Gets the entity factory
    var entityFactory = seneca.make$(options.zone, options.base, options.name)
    // Gets the list of all the entities from the database
    entityFactory.list$({}, (err, list) => {
      if (err) { throw err }
      // Deletes each entity
      var cmds = []
      list.forEach(function (item) {
        var command = act({role: options.role, cmd: 'delete', id: item.id})
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
  * <p>
  * See <a href="http://senecajs.org/docs/tutorials/understanding-query-syntax.html">the seneca syntax</a>
  * for filters, sorts and others options.
  */
  function query (args, done) {
    // Gets the entity factory
    var entityFactory = seneca.make$(options.zone, options.base, options.name)
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
      done(null, {success: true, list: deepList})
    })
  }

  /**
  * Count: gets count from lists of entities from the database.
  * <p>
  * See <a href="http://senecajs.org/docs/tutorials/understanding-query-syntax.html">the seneca syntax</a>
  * for filters, sorts and others options.
  */
  function count (args, done) {
    // Gets the entity factory
    var entityFactory = seneca.make$(options.zone, options.base, options.name)
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

  /* plugin ends */
  return {
    name: 'entity-crud'
  }
}
