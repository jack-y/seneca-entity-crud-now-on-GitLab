/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

/* Prerequisites */
const promise = require('bluebird')

var processTruncate = {}

/* Truncate: deletes all the entities from the database
   TODO: find another optimized process for big data. */
processTruncate.truncate = function (seneca, act, options, args, done) {
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

/* Exports this plugin */
module.exports = processTruncate
