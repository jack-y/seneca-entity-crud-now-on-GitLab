# Input data validation

Last update: 07/07/2017

In most cases, it's a best practice to validate input data before insert it in the database. The **seneca-entity-crud** plugin cannot validate input data by itself: it strongly depend on your application data types. However, if you need to proceed input data validation, this plugin can use your prefered function.

## How it works

### Validation

Pass your prefered function to the `validate` action. The pattern is:

```js
{role: role, cmd: 'validate', entity: myEntity, validate_function: myFunction}
```

For more details, see the chapter [validate][].

### Validation and triggers

This pattern is a good candidate for [triggers][].
See below an [example with triggers](#validate-with-the-triggers).

### Validation with *create* and *update* actions

The plugin can also proceed input data validation before the `create` or `update` action, with the optional `validate` and `validate_function` patterns:

```js
{role: role, cmd: 'create', entity: myEntity, validate: true, validate_function: myFunction}
```

See below an [example with *create* and *update* actions](#validate-with-create-and-update-actions).

### Rules for your validation function

Your validation function must accept one parameter:

- **args**: this value contains the arguments used by the `validate`, `create` or `update` action. The entity is known as `args.entity`.

Your validation function must return a promise with these values:

- **success**: `true` or `false`
- **errors**: an array of error objects. An example of the error format can be: `{field: 'a name', actual: 'a value', error: 'an error message'}`.

If there is no validation error, `success` is set to `true` and the errors array is set empty:

```js
{success: true, errors: []}
```

> Note: the errors array is pretty useful. For example, during an HTML form validation, it can return all errors in only one call. Then you can dynamically show the errors in the form, field by field.

## Example

### Validation function

First, define your own validation function. This example show a simple blog posts management where the post title is required:

```js
function validate_post(args) {
  return new Promise(function (resolve, reject) {
    var errors = []
    if (!args.entity.title) {
      errors.push({field: 'title', actual: null, error: 'the title is required'})
    }
    var success = errors.length === 0
    resolve({success: success, errors: errors})
  })
}
```

### Validate with the triggers

Let's try it. Set your triggers in a configuration file:

**triggers-conf.js**
```js
var config = {}

config.triggers = [
  {
    pattern: 'role:my-role,cmd:create',
    before: {
      pattern: 'role:my-role,cmd:validate'
    }
  },
  {
    pattern: 'role:my-role,cmd:update',
    before: {
      pattern: 'role:my-role,cmd:validate'
    }
  }
]

module.exports = config
```

Then, using the previous validation function, you can try to create a new post without title:

```js
'use strict'

/* Configuration */
const triggersConf = require('triggers-conf')

/* Prerequisites */
const promise = require('bluebird')
const seneca = require('seneca')()

/* Plugins declaration */
seneca
  .use('basic') // For Seneca >= 3.x
  .use('entity')
  .use('mem-store')
  .use('seneca-entity-crud', {
    name: 'post',
    role: 'my-role'
  })
  .use('seneca-triggers', {
    triggers: triggersConf.triggers
  })

/* Promisify seneca actions */
var act = promise.promisify(seneca.act, {context: seneca})

/* Starts seneca */
seneca.ready(function (err) {
  if (err) { throw err }

  /* Applies triggers */
  seneca.act({role: 'triggers', cmd: 'apply'}, (err, reply) => {
    if (err) { throw err }

    /* ----- The NEW data validation function! ----- */
    function validatePost (args) {
      return new Promise(function (resolve, reject) {
        var errors = []
        if (!args.entity.title) {
          errors.push({field: 'title', actual: null, error: 'the title is required'})
        }
        var success = errors.length === 0
        resolve({success: success, errors: errors})
      })
    }

    /* The create example without title */
    var myPost = {content: 'Hello World'}
    act({role: 'my-role', cmd: 'create', entity: myPost, validate_function: validatePost})
    .then(function (result) {
      if (!result.success) {
      console.log('errors: ' + JSON.stringify(result.errors))
      } else {
        console.log('This message will never be shown.')
      }
      return reply(result)
    })

  }) // End triggers

  /* Ends seneca */
  seneca.close((err) => {
    if (err) { console.log(err) }
  })
})

```

Try it! The console shows:

```js
errors: [{"field":"title","actual":null,"error":"the title is required"}]
```

and the message `This message will never be shown.` ...will never be shown ;).

### Validate with *create* and *update* actions

This is another way to validate data before create or update entities.
Using the previous validation function, you can try again to create a new post without title:

```js
'use strict'

/* Prerequisites */
const promise = require('bluebird')
const seneca = require('seneca')()

/* Plugins declaration */
seneca
  .use('basic') // For Seneca >= 3.x
  .use('entity')
  .use('mem-store')
  .use('seneca-entity-crud', {
    name: 'post',
    role: 'my-role'
  })

/* Promisify seneca actions */
var act = promise.promisify(seneca.act, {context: seneca})

/* Starts seneca */
seneca.ready(function (err) {
  if (err) { throw err }

  /* ----- The NEW data validation function! ----- */
  function validatePost (args) {
    return new Promise(function (resolve, reject) {
      var errors = []
      if (!args.entity.title) {
        errors.push({field: 'title', actual: null, error: 'the title is required'})
      }
      var success = errors.length === 0
      resolve({success: success, errors: errors})
    })
  }

  /* The create example without title */
  var myPost = {content: 'Hello World'}
  act({role: 'my-role', cmd: 'create', entity: myPost, validate: true, validate_function: validatePost})
  .then(function (result) {
    if (!result.success) {
      console.log('errors: ' + JSON.stringify(result.errors))
    } else {
      console.log('This message will never be shown.')
    }
    return result
  })

  /* Ends seneca */
  seneca.close((err) => {
    if (err) { console.log(err) }
  })
})

```

Try it! The console shows:

```js
errors: [{"field":"title","actual":null,"error":"the title is required"}]
```

and, as previously, the message `This message will never be shown.` ...will never be shown ;).

# Contributing
The [Senecajs org][] encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

## License
Copyright (c) 2017, Richard Rodger and other contributors.
Licensed under [MIT][].

[validate]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#validate
[triggers]: https://github.com/jack-y/seneca-triggers
[Senecajs org]: https://github.com/senecajs/
[MIT]: ../LICENSE
