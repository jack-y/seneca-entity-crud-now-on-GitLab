# count

Last update: 04/02/2018

## Description

Use this command to retrieve the count of the entities from your database. 

## Pattern

```js
{role: 'my-role', cmd: 'count'}
```

### optional arguments

* **base**, **zone** and **name**: set your entity namespace to override the options.

For more information on base, zone and name, see the [entity namespace][] tutorial.
For more information on role, see the [seneca patterns][] guide.

### filter the list

As the query command, the count command can use `select`, `deepselect` and `selection` filters. See the  [query][] command for more explanations.

## Result object

- **success**: `true`.
- **count**: the number of entities, according to the filters. If no entity match the filters, the `0` value is returned.

## Example

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

[entity namespace]: http://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace
[seneca patterns]: http://senecajs.org/getting-started/#patterns
[query]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/query.md