/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

/* Prerequisites */
const processAppend = require('./append')
const processDefault = require('./default')
const processJoin = require('./join')

var processRead = {}

/* CRUD Read: reads an entity from its ID
   If the entity is not found, return {success:false}. */
processRead.read = function (seneca, act, options, args, done) {
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
          done(null, {success: (entity_3 !== null), entity: entity_3})
        })
        .catch(function (err) { throw err })
      })
      .catch(function (err) { throw err })
    })
    .catch(function (err) { throw err })
  })
}

/* Exports this plugin */
module.exports = processRead
