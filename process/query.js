/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

/* Prerequisites */
const processAppend = require('./append')
const processFormat = require('./format')
const processJoin = require('./join')

var processQuery = {}

/* Query: gets lists of entities from the database
   See: http://senecajs.org/docs/tutorials/understanding-query-syntax.html
  for filters, sorts and others options. */
processQuery.query = function (seneca, act, options, args, done) {
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
          /* Returns the query result with appends */
          return done(null, {success: true, list: appendResult, count: appendResult.length})
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
          /* Returns the query result with appends */
          return done(null, {success: true, list: appendResult, count: appendResult.length})
        })
        .catch(function (err) { throw err })
      })
      .catch(function (err) { throw err })
    }
  })
}

/* Exports this plugin */
module.exports = processQuery
