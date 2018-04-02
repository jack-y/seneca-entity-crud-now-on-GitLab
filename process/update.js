/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

var processUpdate = {}

/* CRUD Update: updated entity persistence
   If the 'last_update' option is set to true, the field 'last_update'
   is set on current date and added to the entity before update. */
processUpdate.update = function (seneca, act, options, args, done) {
  /* Initializes */
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

/* Exports this plugin */
module.exports = processUpdate
