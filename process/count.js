/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

/* Prerequisites */
const processFormat = require('./format')

var processCount = {}

/* Count: gets count from lists of entities from the database
   See: http://senecajs.org/docs/tutorials/understanding-query-syntax.html
   for filters, sorts and others options. */
processCount.count = function (seneca, act, options, args, done) {
  /* Gets the namespace */
  var zone = args.zone ? args.zone : options.zone
  var base = args.base ? args.base : options.base
  var name = args.name ? args.name : options.name
  /* Gets the entity factory */
  var entityFactory = seneca.make$(zone, base, name)
  /* Gets the query options */
  var select = args.select ? args.select : {}
  var deepSelect = args.deepselect ? args.deepselect : []
  var selection = args.selection ? args.selection : null
  var nonamespace = false
  var defaults = []
  /* Gets the list from the database */
  entityFactory.list$(select, (err, list) => {
    if (err) { throw err }
    /* Formats: deep select, selection, nonamespace and defaults */
    var formattedList = processFormat.formatList(list, deepSelect, selection, nonamespace, defaults)
    /* Returns the list */
    done(null, {success: true, count: formattedList.length})
  })
}

/* Exports this plugin */
module.exports = processCount
