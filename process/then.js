/* Copyright (c) 2018 e-soa Jacques Desodt, MIT License */
'use strict'

/* THEN PATTERN
   then: {
      actions: [ {role: 'a_role', cmd: 'a_command', ... }, { ... }, ... ],
      async: true|false,
      results: {
        includes_start: true|false
      	name: 'a_field_name'
      }
   }
   See: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/then.md
*/

/* Prerequisites */
const promise = require('bluebird')

var processThen = {}
processThen.separator = '%'
processThen.entityPattern = processThen.separator + '_entity' + processThen.separator

/* Gets the result object depending on the "then" results argument */
processThen.getResultEntity = function (entity, thenArgs, thenResults) {
  /* Initializes */
  var result = { success: true }
  /* Checks if a result object is needed */
  if (thenArgs && thenArgs.results) {
    /* Checks if the starting-action result must be used */
    if (thenArgs.results.includes_start) {
      result = { success: (entity !== null), entity: entity }
    }
    /* Checks if the "then" results must be added */
    if (thenArgs.results.name) {
      result[thenArgs.results.name] = thenResults
    }
  }
  /* Returns the result object */
  return result
}

/* Gets the result object depending on the "then" results argument */
processThen.getResultList = function (listResult, thenArgs, thenResults) {
  /* Initializes */
  var result = { success: true }
  /* Checks if a result object is needed */
  if (thenArgs && thenArgs.results) {
    /* Checks if the starting-action result must be used */
    if (thenArgs.results.includes_start) {
      result = { success: (listResult !== null), list: listResult, count: listResult ? listResult.length : 0 }
    }
    /* Checks if the "then" results must be added */
    if (thenArgs.results.name) {
      result[thenArgs.results.name] = thenResults
    }
  }
  /* Returns the result object */
  return result
}

/* Replaces the patterns in the object by the entity values */
processThen.replaceValues = function (entity, object) {
  /* Initializes */
  var newObject = {}
  /* Loops on the object properties */
  if (object !== null && typeof object === 'object') {
    for (var prop in object) {
      if (object.hasOwnProperty(prop)) {
        newObject[prop] = processThen.replaceValuesForProperty(entity, object[prop])
      }
    }
  }
  return newObject
}

/* Replacves the patterns by thier value in a string */
processThen.replaceValuesForString = function (entity, value) {
  /* Initializes */
  var newValue = null
  /* Checks the arguments */
  if (value && (typeof value === 'string' || value instanceof String)) {
    var newValue = value + ''
    /* Loops on the entity properties */
    if (entity !== null && typeof entity === 'object') {
      for (var prop in entity) {
        if (entity.hasOwnProperty(prop)) {
          var pattern = processThen.separator + prop + processThen.separator
          newValue = newValue.replace(new RegExp(pattern, 'g'), entity[prop]) + ''
        }
      }
    }
  }
  return newValue
}

/* Replaces the patterns in a value by the entity values */
processThen.replaceValuesForProperty = function (entity, value) {
  /* Initializes */
  var newValue = value
  /* Checks the args */
  if (value) {
    /* Special case: entity */
    if (value === processThen.entityPattern) {
      newValue = entity
    } else {
      /* Is the value a string? */
      if (typeof value === 'string' || value instanceof String) {
        newValue = processThen.replaceValuesForString(entity, value)
      } else {
        /* Is the value an object? */
        if (value !== null && typeof value === 'object') {
          newValue = processThen.replaceValues(entity, value)
        }
      }
    }
  }
  return newValue
}

/* Runs one action for one entity */
processThen.runAction = function (act, entity, action) {
  return new Promise(function (resolve, reject) {
    /* Replaces the values */
    var realAction = processThen.replaceValues(entity, action)
    /* Runs the action */
    act(realAction)
    .then(function (result) { return resolve(result) })
    .catch(function (err) { return reject(err) })
  })
}

/* Proceeds the "then" actions on an entity */
processThen.thenForEntity = function (act, entity, thenArgs) {
  return new Promise(function (resolve, reject) {
    /* Checks if the entity and the "then" actions array are defined */
    if (entity && thenArgs && thenArgs.actions && thenArgs.actions.length) {
      /* Checks the execution mode */
      if (thenArgs.async) {
        /* Runs the actions in asynchronous mode */
        processThen.thenForEntityAsync(act, entity, thenArgs)
        .then(function (thenResults) {
          return resolve(processThen.getResultEntity(entity, thenArgs, thenResults))
        })
        .catch(function (err) { return reject(err) })
      } else {
        /* Runs the actions in synchronous mode */
        processThen.thenForEntitySync(act, entity, thenArgs)
        .then(function (thenResults) {
          return resolve(processThen.getResultEntity(entity, thenArgs, thenResults))
        })
        .catch(function (err) { return reject(err) })
      }
    } else {
      return resolve({ success: (entity !== null), entity: entity })
    }
  })
}

/* Proceeds the "then" actions in asynchronous mode */
processThen.thenForEntityAsync = function (act, entity, thenArgs) {
  return new Promise(function (resolve, reject) {
    /* Checks the arguments */
    if (entity && thenArgs && thenArgs.actions) {
      /* Initializes */
      var promises = []
      /* Loops on the "then" actions and the list of entities */
      for (var i = 0; i < thenArgs.actions.length; i++) {
        promises.push(processThen.runAction(act, entity, thenArgs.actions[i]))
      }
      /* Runs the promises */
      if (promises.length > 0) {
        promise.all(promises)
        .then(function (results) { return resolve(results) })
        .catch(function (err) { return reject(err) }) // One action returns an error
      } else { return resolve([]) } // No action
    } else { return resolve([]) } // No argument
  })
}

/* Proceeds the "then" actions in synchronous mode */
processThen.thenForEntitySync = function (act, entity, thenArgs) {
  return new Promise(function (resolve, reject) {
    /* Initializes */
    var indexAction = 0
    var results = []
    /* The recursive function */
    var recursive = function (act, entity, actions, indexAction) {
      processThen.runAction(act, entity, actions[indexAction])
      .then(function (result) {
        /* Memorizes the result */
        results.push(result)
        /* Runs on the next action */
        indexAction++
        if (indexAction < actions.length) {
          recursive(act, entity, actions, indexAction)
        } else {
          /* All the actions on the entity are done */
          return resolve(results)
        }
      })
      .catch(function (err) { return reject(err) })
    }
    /* Checks if the lists are empty */
    if (entity && thenArgs && thenArgs.actions && thenArgs.actions.length > 0) {
      /* Calls the resursive function */
      recursive(act, entity, thenArgs.actions, indexAction)
    } else {
      /* Nothing to proceed */
      return resolve([])
    }
  })
}

/* Proceeds the "then" actions on a list of entities */
processThen.thenForList = function (act, listResult, thenArgs) {
  return new Promise(function (resolve, reject) {
    /* Checks if the list and the "then" actions array are defined */
    if (listResult && listResult.length && thenArgs && thenArgs.actions && thenArgs.actions.length) {
      /* Checks the execution mode */
      if (thenArgs.async) {
        /* Runs the actions in asynchronous mode */
        processThen.thenForListAsync(act, listResult, thenArgs)
        .then(function (thenResults) {
          return resolve(processThen.getResultList(listResult, thenArgs, thenResults))
        })
        .catch(function (err) { return reject(err) })
      } else {
        /* Runs the actions in synchronous mode */
        processThen.thenForListSync(act, listResult, thenArgs)
        .then(function (thenResults) {
          return resolve(processThen.getResultList(listResult, thenArgs, thenResults))
        })
        .catch(function (err) { return reject(err) })
      }
    } else {
      return resolve({ success: (listResult !== null), list: listResult, count: listResult ? listResult.length : 0 })
    }
  })
}

/* Proceeds the "then" actions in asynchronous mode */
processThen.thenForListAsync = function (act, listResult, thenArgs) {
  return new Promise(function (resolve, reject) {
    /* Checks the arguments */
    if (listResult && thenArgs && thenArgs.actions) {
      /* Initializes */
      var promises = []
      /* Loops on the "then" actions and the list of entities */
      for (var i = 0; i < thenArgs.actions.length; i++) {
        for (var j = 0; j < listResult.length; j++) {
          promises.push(processThen.runAction(act, listResult[j], thenArgs.actions[i]))
        }
      }
      /* Runs the promises */
      if (promises.length > 0) {
        promise.all(promises)
        .then(function (results) { return resolve(results) })
        .catch(function (err) { return reject(err) }) // One action returns an error
      } else { return resolve([]) } // No action
    } else { return resolve([]) } // No argument
  })
}

/* Proceeds the "then" actions in synchronous mode */
processThen.thenForListSync = function (act, listResult, thenArgs) {
  return new Promise(function (resolve, reject) {
    /* Initializes */
    var indexEntity = 0
    var indexAction = 0
    var results = []
    /* The recursive function */
    var recursive = function (act, entities, actions, indexEntity, indexAction) {
      processThen.runAction(act, entities[indexEntity], actions[indexAction])
      .then(function (result) {
        /* Memorizes the result */
        results.push(result)
        /* Runs on the next entity */
        indexEntity++
        if (indexEntity < entities.length) {
          recursive(act, entities, actions, indexEntity, indexAction)
        } else {
          /* Runs on the next action */
          indexEntity = 0
          indexAction++
          if (indexAction < actions.length) {
            recursive(act, entities, actions, indexEntity, indexAction)
          } else {
            /* All the actions on entities are done */
            return resolve(results)
          }
        }
      })
      .catch(function (err) { return reject(err) })
    }
    /* Checks if the lists are empty */
    if (listResult && listResult.length > 0 &&
      thenArgs && thenArgs.actions && thenArgs.actions.length > 0) {
      /* Calls the resursive function */
      recursive(act, listResult, thenArgs.actions, indexEntity, indexAction)
    } else {
      /* Nothing to proceed */
      return resolve([])
    }
  })
}

/* Exports this plugin */
module.exports = processThen
