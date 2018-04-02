# delete

Last update: 04/02/2018

## Description

Use this command to remove an entity from your database. 

## Pattern

```js
{role: 'my-role', cmd: 'delete', id: anId}
```

### optional arguments

- **base**, **zone** and **name**: set your entity namespace to override the options.

For more information on base, zone and name, see the [entity namespace][] tutorial.

## Result object

- **success**: `true`.

## Example

```js
var myId = '5a4732ef4049cfcb07d992007e003932'
// Delete
act({role: 'my-role', cmd: 'delete', id: myId})
.then(function (result) {
  console.log('Id ' + myId + ' deleted.')
  return result
})
```
[entity namespace]: http://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace
