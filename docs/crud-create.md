# create

Last update: 04/02/2018

## Description

Use this command to add a new entity into your database. 

## Pattern

```js
{role: 'my-role', cmd: 'create', entity: newEntity}
```

### optional arguments

- **base**, **zone** and **name**: set your entity namespace to override the options.
- **nonamespace**: if `true`, remove the namespace in the resulting entity. See the chapter [The returned namespace][].
- **validate** and **validate_function**: proceed to input data validation before the creation. See the [input data validation][] documentation.

For more information on base, zone and name, see the [entity namespace][] tutorial.
For more information on role, see the [seneca patterns][] guide.

## Result object

- **success**: `true` or `false`. `false` is returned if the input data validation is used and fails.
- **errors**: an array. If the input data validation is used and fails, `errors` is the array of error objects. An exemple of the error format can be: `{field: 'a name', actual: 'a value', error: 'an error message'}`.
- **entity**: if there is no input data validation or if it has succeeded, this value is the input entity updated with its `id` field set. If the `last_update` plugin option is set to `true`, this value has its `last_update` field set with the current date.

> Note: the ID generated for the entity is provided by the store plugin used in your application.

## Example

```js
var myEntity = {title: 'The life of cats', content: '<h1>This is a post about cats</h1><p>Maoww...</p>'}
// Create
act({role: 'my-role', cmd: 'create', entity: myEntity)
.then(function (result) {
  console.log('My entity ID is: ' + result.entity.id)
  return result
})
```

[input data validation]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/input-data-validation.md
[The returned namespace]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#the-returned-namespace
[entity namespace]: http://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace
[seneca patterns]: http://senecajs.org/getting-started/#patterns
