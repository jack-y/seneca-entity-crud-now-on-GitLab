# update

Last update: 04/02/2018

## Description

Use this command to update an entity previously created into your database. 

## Pattern

```js
{role: 'my-role', cmd: 'update', entity: anEntity}
```

### optional arguments

- **base**, **zone** and **name**: set your entity namespace to override the options.
- **nonamespace**: if `true`, remove the namespace in the resulting entity. See the chapter [The returned namespace][].
- **validate** and **validate_function**: proceed to input data validation before the creation. See the [input data validation][] documentation.

For more information on base, zone and name, see the [entity namespace][] tutorial.
For more information on role, see the [seneca patterns][] guide.

### The entity ID must exist

The entity ID must be found in the database. If not, a `success: false` result is fired.

### Not all the fields are updated

Not all fields must always be updated in the entity passed as argument. Only the ID and the fields to be updated or inserted are required. However, depending on the used store plugin, the **save$** seneca-entity action can remove undeclared fields from the database. To avoid this, the **update** command is equal to a read-assign-save action. Undeclared fields remain unchanged.

Updating or inserting fields uses the `assign` javascript function, like:

```json
Origin database entity: {id:'1234', name: 'John Doe', phone: 789}
Update command entity: {id: '1234', phone: 0001, email: 'me@server.com'}
-> Final database entity: {id:'1234', name: 'John Doe', phone: 0001, email: 'me@server.com'}
```

## Result object

- **success**: `true` or `false`. `false` is returned if the input data validation is used and fail, or if the entity ID is not found.
- **errors**: an array. If the input data validation is used and fail, `errors` is the array of error objects. An example of the error format can be: `{field: 'a name', actual: 'a value', error: 'an error message'}`.
- **entity**: if there is no data validation or if it has succeeded, this value is the input entity updated. If the `last_update` plugin option is set to `true`, this value has its `last_update` field set with the current date.

## Example

```js
var myEntity = {id: '5a4732ef4049cfcb07d992007e003932', title: 'A new title', content: '<h1>This is a post about cats</h1><p>Maoww...</p>'}
// Update
act({role: 'my-role', cmd: 'update', entity: myEntity})
.then(function (result) {
  console.log('My entity last update is: ' + result.entity.last_update)
  return result
})
```

[input data validation]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/input-data-validation.md
[The returned namespace]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#the-returned-namespace
[entity namespace]: http://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace
[seneca patterns]: http://senecajs.org/getting-started/#patterns
