/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

/* Prerequisites */
const processQuery = require('./query')

var processFirst = {}

/* First: retrieves the first entity of a query. */
processFirst.first = function (seneca, act, options, args, done) {
  /* Initializes */
  var response = {
    success: true,
    entity: null
  }
  /* Executes the query */
  processQuery.query(seneca, act, options, args, function (err, result) {
    /* Checks if an error occurs */
    if (err) { throw err }
    /* Checks if the result list contains at least one item */
    if (result.success && result.count > 0) {
      response.entity = result.list[0]
    }
    /* Returns the response */
    return done(null, response)
  })
}

/* Exports this plugin */
module.exports = processFirst
