/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

/* Prerequisites */
const processRelationship = require('./relationship')
const promise = require('bluebird')

var processDeleterelationships = {}

/* Delete relationships: deletes all relationships of an entity from its ID.
  All the deletions are in asynchronous mode. */
processDeleterelationships.delete = function (seneca, act, options, args, done) {
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

/* Exports this plugin */
module.exports = processDeleterelationships
