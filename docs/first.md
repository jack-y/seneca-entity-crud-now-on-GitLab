# first

Last update: 04/02/2018

## Description

Use this command to retrieve from your database the first entity matching filters.

## Pattern

```js
{role: 'my-role', cmd: 'first'}
```

### optional arguments

* **appends**: perform others actions after the query. See the [appends][] feature.
* **base**, **zone** and **name**: set your entity namespace to override the options.
* **defaults**: add defaults to the resulting entity. See the chapter [Defaults][].
* **nonamespace**: if `true`, remove the namespace of the resulting entity. See the chapter [The returned namespace][].
* **joins**: proceed deep reading from IDs contained in the entity. See the [joins][] feature.

For more information on base, zone and name, see the [entity namespace][] tutorial.
For more information on role, see the [seneca patterns][] guide.

### filters

As the [query][] command, the **first** command can use the `select`, `deepselect` and `selection` filters. See the  [query][] command for more explanations.

## Result object

- **success**: `true`.
- **entity**: the first entity found, according to the filters. If no entity match the filters, the `null` value is returned.

## Example

```js
var mySelect = {title: 'About seneca'}
var myDeepSelect = [
  {property: 'city.zipcode', value: '59491'}
]
// Count
act({role: 'my-role', cmd: 'first', select: mySelect, deepselect: myDeepSelect})
.then(function(result) {
  console.log(result.entity)
  return result
})
```

[The returned namespace]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#the-returned-namespace
[Defaults]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#defaults
[appends]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/appends.md
[joins]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/joins.md
[query]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/query.md
[entity namespace]: http://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace
[seneca patterns]: http://senecajs.org/getting-started/#patterns