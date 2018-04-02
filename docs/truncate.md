# truncate

Last update: 04/02/2018

## Description

Use this command to remove all the entities from your database. 

## Pattern

```js
{role: 'my-role', cmd: 'truncate'}
```

### optional arguments

- **base**, **zone** and **name**: set your entity namespace to override the options.

For more information on base, zone and name, see the [entity namespace][] tutorial.

## Result object

- **success**: `true`.

> Note: at this time, the truncate command execute a remove$ action entity by entity. It does not perform well. If you know a better solution, please share it!

## Example

```js
// Truncate
act({role: 'my-role', cmd: 'truncate'})
.then(function(result) {
  console.log('No more data. Go home.')
  return result
})
```

## truncate and seneca-mesh

The `truncate` action generates a `delete` action that is immediately consumed by this plugin. **There is no publication of the `delete` action at the top-level [mesh][] base or service**: this plugin can't know this top-level. This behavior depends on the application itself.

In the application, if the `truncate` action is intended to publish the generated `delete` actions, we should use this kind of code instead:

```js
act({role: 'my-role', cmd: 'query'})
.then(function(result) {
  var promises = []
  result.list.forEach(function(item) {
    promises.push(act({role: 'my-role', cmd: 'delete', id: item.id}))    
  })
  promise.all(promises)
  .then(function (results) {
    // Do some stuff...
    return results
  })
})
```

[entity namespace]: http://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace
[seneca mesh]: https://github.com/senecajs/seneca-mesh
