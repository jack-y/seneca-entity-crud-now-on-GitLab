/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

var processDelete = {}

/* CRUD Delete: deletes an entity from its ID
   If the entity is not found, return {success:false}. */
processDelete.delete = function (seneca, act, options, args, done) {
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

/* Exports this plugin */
module.exports = processDelete
