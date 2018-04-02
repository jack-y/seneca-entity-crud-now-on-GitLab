# check

Last update: 04/02/2018

## Description

Use this command to verify that the store can create-then-delete an entity. 

## Pattern

```js
{role: 'my-role', cmd: 'check'}
```

The default entity object used to be created then deleted is:

```js
{check: 'check'}
```

### optional arguments

* **base**, **zone** and **name**: set your entity namespace to override the options.
* **entity**: the entity used to override the default object.

For more information on base, zone and name, see the [entity namespace][] tutorial.
For more information on role, see the [seneca patterns][] guide.

## Result object

- **success**: `true` or `false`. `true` if the create-then-delete operation is successful, `false` otherwise.
- **errors**: an array. It contains the error objects returned by the create-then-delete operation when it fails.
- **command**: `create` or `delete`. The name of the command which fires the error when the create-then-delete operation fails.

## Example

```js
// Check
act({role: 'my-role', cmd: 'check'})
.then(function(result) {
  if (!result.success) {
    // ... do some stuff with the error ...
    console.log('Oops, check returns an error.')
  }
  return result
})
```

[entity namespace]: http://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace
[seneca patterns]: http://senecajs.org/getting-started/#patterns
