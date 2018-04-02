/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

var processCreate = {}

/* CRUD Create: new entity persistence
   If the 'last_update' option is set to true, the field 'last_update'
   is set on current date and added to the entity before insert. */
processCreate.create = function (seneca, act, options, args, done) {
  /* Initializes */
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

/* Exports this plugin */
module.exports = processCreate
