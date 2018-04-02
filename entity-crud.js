/* Copyright (c) 2016-2018 e-soa Jacques Desodt, MIT License */
'use strict'

/* Default plugin options */
const pluginName = 'seneca-entity-crud'
const config = require('./config/' + pluginName)

/* Prerequisites */
const processCheck = require('./process/check')
const processCount = require('./process/count')
const processCreate = require('./process/create')
const processDelete = require('./process/delete')
const processDeleterelationships = require('./process/deleterelationships')
const processFirst = require('./process/first')
const processQuery = require('./process/query')
const processRead = require('./process/read')
const processTruncate = require('./process/truncate')
const processUpdate = require('./process/update')
const processValidate = require('./process/validate')
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
  seneca.add({role: options.role, cmd: 'check'}, check)
  seneca.add({role: options.role, cmd: 'count'}, count)
  seneca.add({role: options.role, cmd: 'deleterelationships'}, deleteRelationships)
  seneca.add({role: options.role, cmd: 'first'}, first)
  seneca.add({role: options.role, cmd: 'query'}, query)
  seneca.add({role: options.role, cmd: 'truncate'}, truncate)
  seneca.add({role: options.role, cmd: 'validate'}, validate)

  /* --------------- FUNCTIONS ---------------
     --------- In alphabetical order ----------*/

  /* Check: to verify that the store is OK
     This is done using create and delete operations. */
  function check (args, done) {
    return processCheck.check(seneca, act, options, args, done)
  }

  /* Count: gets count from lists of entities from the database
     See: http://senecajs.org/docs/tutorials/understanding-query-syntax.html
     for filters, sorts and others options. */
  function count (args, done) {
    return processCount.count(seneca, act, options, args, done)
  }

  /* CRUD Create: new entity persistence
     If the 'last_update' option is set to true, the field 'last_update'
     is set on current date and added to the entity before insert. */
  function create (args, done) {
    return processCreate.create(seneca, act, options, args, done)
  }

  /* CRUD Delete: deletes an entity from its ID
     If the entity is not found, return {success:false}. */
  function delet (args, done) {
    return processDelete.delete(seneca, act, options, args, done)
  }

  /* Delete relationships: deletes all relationships of an entity from its ID
    All the deletions are in asynchronous mode. */
  function deleteRelationships (args, done) {
    return processDeleterelationships.delete(seneca, act, options, args, done)
  }

  /* First: retrieves the first entity of a query. */
  function first (args, done) {
    return processFirst.first(seneca, act, options, args, done)
  }

  /* Query: gets lists of entities from the database
     See: http://senecajs.org/docs/tutorials/understanding-query-syntax.html
    for filters, sorts and others options. */
  function query (args, done) {
    return processQuery.query(seneca, act, options, args, done)
  }

  /* CRUD Read: reads an entity from its ID
     If the entity is not found, return {success:false}. */
  function read (args, done) {
    return processRead.read(seneca, act, options, args, done)
  }

  /* Truncate: deletes all the entities from the database */
  function truncate (args, done) {
    return processTruncate.truncate(seneca, act, options, args, done)
  }

  /* CRUD Update: updated entity persistence
     If the 'last_update' option is set to true, the field 'last_update'
     is set on current date and added to the entity before update. */
  function update (args, done) {
    return processUpdate.update(seneca, act, options, args, done)
  }

  /* Validate
     The validation function is passed as argument. */
  function validate (args, done) {
    return processValidate.validate(seneca, act, options, args, done)
  }

  /* Validate and create: new entity persistence
     Before the insert, the entity data validation is called.
     If the validation fail, return the errors array.
     Otherwise the create command is called. */
  function validateAndCreate (args, done) {
    return processValidate.validateAndExecute('create', seneca, act, options, args, done)
  }

  /* Validate and update: updated entity persistence
     Before the update, the entity data validation is called.
     If the validation fail, return the errors array.
     Otherwise the Update command is called. */
  function validateAndUpdate (args, done) {
    return processValidate.validateAndExecute('update', seneca, act, options, args, done)
  }

  /* plugin ends */
  return {
    name: 'entity-crud'
  }
}
