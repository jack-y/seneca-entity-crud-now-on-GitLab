/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

var processValidate = {}

/* Validate
   The validation function is passed as argument. */
processValidate.validate = function (seneca, act, options, args, done) {
  /* Checks the arguments validate function */
  var validateFunction = args.validate_function ? args.validate_function : processValidate.validateDefault
  /* Validates input data */
  validateFunction(args)
  .then(function (result) {
    done(null, result)
  })
}

/* Validate and execute
   Before the command, the entity data validation is called.
   If the validation fail, return the errors array.
   Otherwise the command is called. */
processValidate.validateAndExecute = function (command, seneca, act, options, args, done) {
  /* Validates */
  processValidate.validate(seneca, act, options, args, function (err, validateResult) {
    if (err) { throw err }
    /* Checks validation */
    if (validateResult.success) {
      /* Gets the namespace */
      var zone = args.zone ? args.zone : options.zone
      var base = args.base ? args.base : options.base
      var name = args.name ? args.name : options.name
      /* Creates the entity */
      act({role: options.role, zone: zone, base: base, name: name, cmd: command, entity: args.entity})
      .then(function (result) {
        done(null, result)
      })
      .catch(function (err) { throw err })
    } else {
      /* Validation fails: returns the errors */
      done(null, validateResult)
    }
  })
}

/* The default validation function: always successful */
processValidate.validateDefault = function (args) {
  return new Promise(function (resolve, reject) {
    resolve({success: true, errors: []})
  })
}

/* Exports this plugin */
module.exports = processValidate
