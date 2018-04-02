/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

var processCheck = {}

/* Check: to verify that the store is OK
   This is done using create and delete operations. */
processCheck.check = function (seneca, act, options, args, done) {
  /* Initializes */
  var entity = args.entity ? args.entity : {check: 'check'}
  /* Gets the namespace */
  var zone = args.zone ? args.zone : options.zone
  var base = args.base ? args.base : options.base
  var name = args.name ? args.name : options.name
  /* Creates the entity */
  act({role: options.role, zone: zone, base: base, name: name, cmd: 'create', entity: entity})
  .then(function (result) {
    /* Checks if the create operation is successful */
    if (result.success && result.entity && result.entity.id) {
      /* Deletes the entity */
      act({role: options.role, zone: zone, base: base, name: name, cmd: 'delete', id: result.entity.id})
      .then(function (result) {
        /* Checks if the delete operation is successful */
        if (result.success) {
          done(null, {success: true})
        } else {
          /* Error on delete */
          done(null, {success: false, errors: result.errors, command: 'delete'})
        }
      })
      .catch(function (err) {
        done(null, {success: false, errors: [err], command: 'delete'})
      })
    } else {
      /* Error on create */
      done(null, {success: false, errors: result.errors, command: 'create'})
    }
  })
  .catch(function (err) {
    console.log('catch create')
    done(null, {success: false, errors: [err], command: 'create'})
  })
}

/* Exports this plugin */
module.exports = processCheck
