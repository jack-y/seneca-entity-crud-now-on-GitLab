# read

Last update: 04/24/2018

## Description

Use this command to retrieve an entity from your database.

## Pattern

```js
{role: 'my-role', cmd: 'read', id: anId}
```

### optional arguments

* **appends**: perform others actions during one read. See the [appends][] feature.
* **base**, **zone** and **name**: set your entity namespace to override the options.
* **defaults**: add defaults to the resulting entity. See the chapter [Defaults][].
* **joins**: proceed deep reading from IDs contained in the entity. See the [joins][] feature.
* **nonamespace**: if `true`, remove the namespace of the resulting entity. See the chapter [The returned namespace][].
* **then**: provides additional treatments on the entity being read. See the [then][] feature.

For more information on base, zone and name, see the [entity namespace][] tutorial.
For more information on role, see the [seneca patterns][] guide.

## Result object

- **success**: `true` or `false`. `false` is returned if the entity is not found.
- **entity**: the entity read from the database, or null if it is not found.

If the **then** feature is used, the result object depends on the **then** arguments. See the [then][] feature.

## Example

```js
var myId = '5a4732ef4049cfcb07d992007e003932'
// Read
act({role: 'my-role', cmd: 'read', id: myId})
.then(function (result) {
  console.log('My entity is: ' + JSON.stringify(result.entity))
  return result
})
```

[The returned namespace]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#the-returned-namespace
[Defaults]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#defaults
[appends]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/appends.md
[entity namespace]: http://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace
[joins]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/joins.md
[seneca patterns]: http://senecajs.org/getting-started/#patterns
[then]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/then.md
