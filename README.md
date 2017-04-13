![Logo]
> A [seneca.js][] entity CRUD plugin.

# seneca-entity-crud

Last update: 04/13/2017  

## Description

This module is a plugin for the [Seneca][] framework. It provides basic [CRUD][] persistent actions for entities, and some extras.

The [seneca-entity][] plugin already provides simple persistent functions: `save$`, `load$`, `remove$`, `list$` and `data$`. The **seneca-entity-crud** plugin encapsulate these functions in an efficient way.

## Why this plugin?

When we develop real applications, we often have to manage a lot of entities. For example: customer, product, catalog, address, order, sell, relations between them and so one.
Working with the [seneca-entity][] plugin, the same kind of code can be duplicated a lot of time. For example, this a code used to simply read an entity:

```js
// Database entity creation
var entityFactory = seneca.make(myZone, myBase, myName)
// Reads the entity in the database
entityFactory.load$(anId, (err, result) => {
  if ( err ) { throw err }
  // ... do some stuff with result ...
})

```

The **seneca-entity-crud** plugin do the same work in a simplest manner. It define a `read` command and can use the [promises][] power. Let's see it.

Once for all, the application promisify the `act` function:

```js
const promise = require('bluebird')
const seneca = require('seneca')()
var act = promise.promisify(seneca.act, {context: seneca})
```

And here is our new code used to read an entity:

```js
// Reads the entity in the database
act({role: myRole, cmd: 'read', id: anId})
.then(function(result) {
// ... do some stuff with result ...
});
```

Less code. CRUD names. And the code is easier to understand.

One very nice thing: in addition to CRUD, this plugin offers additional commands.

- The `truncate` command works as traditional SQL `TRUNCATE TABLE my_table`.
- The `query` command encapsulate the `list$` function.
- The `count` command encapsulate the `list$` function, but return only the count for network optimization.

And we even lie on the floor:

- This plugin includes an optional input data validation functionality to be used before the create or update action.
- A `last_update` date value can be automatically added to each entity when created or updated.
- The [joins][] feature provides deep readings from IDs contained in entities.

Enjoy!

# How it works

### Prerequisites

Your application must declare the seneca-entity plugin:

```js
const seneca = require('seneca')()
seneca.use('entity')
// For Seneca >= 3.x
seneca.use('basic').use('entity')
```

See the [seneca-entity][] project for installation and more information.

### Plugin declaration

Your application must declare this plugin:

```js
seneca.use('seneca-entity-crud', {
  ... options ...
})
```

The **options** are:

- `zone`: the name of your zone (optional).
- `base`: the name of your base (optional).
- `name`: the primary name of your entities. Default: `entity`. The primary name must not contain hyphen (-).
- `last_update`: an optional boolean value. If true, the current date value is automatically added to each entity (*the field name is* `last_update`) when created or updated. Default: `false`.
- `role`: the name of your role, so this plugin commands are part of your patterns.  Default: `entity`.

For more information on zone, base and name, see the [entity namespace][] tutorial.
For more information on role, see the [seneca patterns][] guide.

### Usage

Process each **seneca-entity-crud** command as any seneca command. Here is a full example for the `create` command, using the seneca-mem-store persistence plugin:

```js
'use strict'

/* Prerequisites */
const promise = require('bluebird')
const seneca = require('seneca')()

/* Plugin declaration */
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

  /* The create example */
  var myPost = {title: 'A great post', content: 'Hello World'}
  act({role: 'my-role', cmd: 'create', entity: myPost})
  .then(function (result) {
    console.log('My great post ID is: ' + result.entity.id)
    return result
  })

  /* Ends seneca */
  seneca.close((err) => {
    if (err) { console.log(err) }
  })
})

```

Try it! The console shows:

	My great post ID is: <an id like 5a4732ef4049cfcb07d992007e003932>

For **the list of the commands** and their arguments, see the chapter below: [API commands specifications](#api-commands-specifications).

> Note: the ID generated for the entity is provided by the store plugin used in your application.

# Input data validation

In most cases, it's a best practice to validate input data before insert it in the database. The **seneca-entity-crud** plugin cannot validate input data by itself: it strongly depend on your application data types. However, if you need to proceed input data validation before the create or update action, the plugin can pass your prefered function with the optional `validate` and `validate_function` patterns:

```js
{role: role, cmd: 'create', entity: myEntity, validate: true, validate_function: myFunction}
```

### Rules for your validation function

Your validation function must accept one parameter:

- **args**: this value contains the arguments used by the create or update command. The entity is known as `args.entity`.

Your validation function must return a promise with these values:

- **success**: `true` or `false`
- **errors**: an array of error objects. An example of the error format can be: `{field: 'a name', actual: 'a value', error: 'an error message'}`.

If there is no validation error, `success` is set to `true` and the errors array is set empty:

```js
{success: true, errors: []}
```

> Note: the errors array is pretty useful. For example, during an HTML form validation, it can return all errors in only one call. Then you can dynamically show the errors in the form, field by field.

### Example

Let's try it. First define your own validation function. The next example show a simple blog posts management where the post title is required:

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

Then you can try to create a new post without title. Please update the code of the previous full example:

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

and the message `This message will never be shown.` ...will never be shown ;).

# API commands specifications

## create

Use this command to add a new entity into your database. The pattern is:

```js
{role: 'my-role', cmd: 'create', entity: newEntity}
```

You can pass `base`, `zone` and `name` of your entity namespace as optional arguments to override the options.

`validate` and `validate_function` are the optional arguments for input data validation. See the previous chapter: [Input data validation](#input-data-validation).

Example:

```js
var myEntity = {title: 'The life of cats', content: '<h1>This is a post about cats</h1><p>Maoww...</p>'}
// Create
act({role: 'my-role', cmd: 'create', entity: myEntity)
.then(function (result) {
  console.log('My entity ID is: ' + result.entity.id)
  return result
})
```

The result object contains these values:

- **success**: `true` or `false`. `false` is returned if the input data validation is used and fail.
- **errors**: an array. If the input data validation is used and fail, `errors` is the array of error objects. An exemple of the error format can be: `{field: 'a name', actual: 'a value', error: 'an error message'}`.
- **entity**: if there is no input data validation or if it has succeeded, this value is the input entity updated with its `id` field set. If the `last_update` plugin option is set to `true`, this value has its `last_update` field set with the current date.

> Note: the ID generated for the entity is provided by the store plugin used in your application.

## read

Use this command to retrieve an entity from your database. The pattern is:

```js
{role: 'my-role', cmd: 'read', id: anId}
```

You can pass `base`, `zone` and `name` of your entity namespace as optional arguments to override the options.

You can pass a `joins` value to process deep reading from IDs contained in the entity. See the [joins][] feature.

Example:

```js
var myId = '5a4732ef4049cfcb07d992007e003932'
// Read
act({role: 'my-role', cmd: 'read', id: myId})
.then(function (result) {
  console.log('My entity is: ' + JSON.stringify(result.entity))
  return result
})
```

The result object contains these values:

- **success**: `true` or `false`. `false` is returned if the entity is not found.
- **entity**: the entity read from the database, or null if it is not found.

## update

Use this command to update an entity previously inserted into your database. The pattern is:

```js
{role: 'my-role', cmd: 'update', entity: anEntity}
```

You can pass `base`, `zone` and `name` of your entity namespace as optional arguments to override the options.

`validate` and `validate_function` are the optional arguments for input data validation. See the previous chapter: [Input data validation](#input-data-validation).

The entity ID must be found in the database. If not, a `success: false` result is fired.

Not all fields must always be updated in the past entity as an argument. Only the ID and fields to be updated or inserted are required. However, depending on the used store plugin, the **save** seneca-entity action can remove undeclared fields from the database. To avoid this, the **update** command is equal to a read-assign-save action. Undeclared fields remain unchanged.

Updating or inserting fields uses the `assign` javascript function:

Origin database entity: ```{id:'1234', name: 'John Doo', phone: 789}```
Update command entity: ```{id: '1234', phone: 0001, email: 'me@server.com'}```
Final database entity: ```{id:'1234', name: 'John Doo', phone: 0001, email: 
'me@server.com'}```

Example of an **update** call:

```js
var myEntity = {id: '5a4732ef4049cfcb07d992007e003932', title: 'A new title', content: '<h1>This is a post about cats</h1><p>Maoww...</p>'}
// Update
act({role: 'my-role', cmd: 'update', entity: myEntity})
.then(function (result) {
  console.log('My entity last update is: ' + result.entity.last_update)
  return result
})
```

The result object contains these values:

- **success**: `true` or `false`. `false` is returned if the input data validation is used and fail, or if the entity ID is not found.
- **errors**: an array. If the input data validation is used and fail, `errors` is the array of error objects. An example of the error format can be: `{field: 'a name', actual: 'a value', error: 'an error message'}`.
- **entity**: if there is no data validation or if it has succeeded, this value is the input entity updated. If the `last_update` plugin option is set to `true`, this value has its `last_update` field set with the current date.

## delete

Use this command to remove an entity from your database. The pattern is:

```js
{role: 'my-role', cmd: 'delete', id: anId}
```

You can pass `base`, `zone` and `name` of your entity namespace as optional arguments to override the options.

Example:

```js
var myId = '5a4732ef4049cfcb07d992007e003932'
// Delete
act({role: 'my-role', cmd: 'delete', id: myId})
.then(function (result) {
  console.log('Id ' + myId + ' deleted.')
  return result
})
```

The result object contains this value:

- **success**: `true`.

## truncate

Use this command to remove all the entities from your database. The pattern is:

```js
{role: 'my-role', cmd: 'truncate'}
```

You can pass `base`, `zone` and `name` of your entity namespace as optional arguments to override the options.

Example:

```js
// Truncate
act({role: 'my-role', cmd: 'truncate'})
.then(function(result) {
  console.log('No more data. Go home.')
  return result
})
```

The result object contains this value:

- **success**: `true`.

> Note: at this time, the truncate command execute a remove$ action entity by entity. It does not perform well. If you know a better solution, we take!

## query

Use this command to retrieve a list of entities from your database. The pattern is:

```js
{role: 'my-role', cmd: 'query'}
```

You can pass `base`, `zone` and `name` of your entity namespace as optional arguments to override the options.

You can pass a `joins` value to process deep reading from IDs contained in the entities. See the [joins][] feature.

### select

A **select** optional argument can be added to the pattern: `select: {... some filters ...}` . If no select argument is provided, an empty select object is used. The select argument support the standard Seneca query format:

- `select: {f1:v1, f2:v2, ...}` implies pseudo-query `f1==v1 AND f2==v2, ...`.
- `select: {{f1:v1,...}, {sort$:{field1:1}}` means sort by f1, ascending.
- `select: {{f1:v1,...}, {sort$:{field1:-1}}` means sort by f1, descending.
- `select: {{f1:v1,...}, {limit$:10}}` means only return 10 results.
- `select: {{f1:v1,...}, {skip$:5}}` means skip the first 5.
- `select: {{f1:v1,...}, {fields$:['fd1','f2']}}` means only return the listed fields.

> Note: you can use `sort$`, `limit$`, `skip$` and `fields$` together.

For more information, see the seneca [Query Syntax][] tutorial.

Example:

```js
var mySelect = {title: 'About seneca'}
// Query
act({role: 'my-role', cmd: 'query', select: mySelect})
.then(function(result) {
  console.log(result.list)
  return result
})
```

### deep select

A **deepselect** optional argument can be added to the pattern. If no `deepselect` argument is provided, an empty array is used. The `deepselect` argument is a list of filters, acting as an `AND` combination.

A deep select filter is a JSON string with a property name, and a value the property must match. This is a useful search feature on nested objects.

Example:

```js
var myDeepSelect = [
  {property: 'city.zipcode', value: '59491'}
]
// Query
act({role: 'my-role', cmd: 'query', deepselect: myDeepSelect})
.then(function(result) {
  console.log(result.list)
  return result
})
```

In this example, only the entities whose city contains the zip code `'59491'` are retrieved.

You can use together the select and deep select filters as you want.

### result object

The result object contains these values:

- **success**: `true`.
- **list**: the entities array, according to the filters. If no entity match the filters, an empty array is returned.

## count

Use this command to retrieve a number of entities from your database. The pattern is:

```js
{role: 'my-role', cmd: 'count'}
```

You can pass `base`, `zone` and `name` of your entity namespace as optional arguments to override the options.

As the query command, the count command can use select and deep select filters. See the previous [query command](#query) for more explanations.

Example:

```js
var mySelect = {title: 'About seneca'}
var myDeepSelect = [
  {property: 'city.zipcode', value: '59491'}
]
// Count
act({role: 'my-role', cmd: 'count', select: mySelect, deepselect: myDeepSelect})
.then(function(result) {
  console.log(result.count)
  return result
})
```

The result object contains these values:

- **success**: `true`.
- **count**: the number of entities, according to the filters. If no entity match the filters, the `0` value is returned.

# Install

To install, simply use npm:

```sh
npm install seneca-entity-crud
```

# Test
To run tests, simply use npm:

```sh
npm run test
```

# Contributing
The [Senecajs org][] encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

## License
Copyright (c) 2016, Richard Rodger and other contributors.<br/>
Licensed under [MIT][].

[MIT]: ./LICENSE
[Logo]: http://senecajs.org/files/assets/seneca-logo.jpg
[Seneca.js]: https://www.npmjs.com/package/seneca
[Seneca]: http://senecajs.org/
[Senecajs org]: https://github.com/senecajs/
[CRUD]: https://en.wikipedia.org/wiki/Create,_read,_update_and_delete
[seneca-entity]: https://github.com/senecajs/seneca-entity
[promises]: http://senecajs.org/docs/tutorials/seneca-with-promises.html
[entity namespace]: http://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace
[seneca patterns]: http://senecajs.org/getting-started/#patterns
[shortid]: https://cnpmjs.org/package/shortid
[Query syntax]: http://senecajs.org/docs/tutorials/understanding-query-syntax.html
[seneca mesh]: https://github.com/senecajs/seneca-mesh
[joins]: https://github.com/jack-y/seneca-entity-crud/tree/master/joins
