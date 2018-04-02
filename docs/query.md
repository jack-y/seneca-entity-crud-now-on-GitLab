# query

Last update: 04/02/2018

## Description

Use this command to retrieve a list of entities from your database. 

## Pattern

```js
{role: 'my-role', cmd: 'query'}
```

### optional arguments

* **appends**: perform others actions during the query. See the [appends][] feature.
* **base**, **zone** and **name**: set your entity namespace to override the options.
* **defaults**: add defaults to the resulting entities. See the chapter [Defaults][].
* **nonamespace**: if `true`, remove the namespace of the resulting entities. See the chapter [The returned namespace][].
* **joins**: proceed deep reading from IDs contained in the entities. See the [joins][] feature.

For more information on base, zone and name, see the [entity namespace][] tutorial.
For more information on role, see the [seneca patterns][] guide.

### filter the list

With the previous pattern, all the entities of the database are retrieved. If you want to retrieve only some entities via filters, these 3 optional arguments can be used :

* **[select](#select)**: this argument support the standard Seneca query format.
* **[deepselect](#deepselect)**: this argument is a list of filters, acting as an `AND` combination.
* **[selection](#selection)**: filter with a function passed as argument.

## Result object

- **success**: `true`.
- **list**: the entities array, according to the filters. If no entity match the filters, an empty array is returned.
- **count**: the number of entities, according to the filters. If no entity match the filters, the `0` value is returned.

## Example

```js
// Query
act({role: 'my-role', cmd: 'query'})
.then(function (result) {
  console.log('My query list is: ' + JSON.stringify(result.list))
  return result
})
```

# filter

## select

A **select** optional argument can be added to the pattern: `select: {... some filters ...}` . If no select argument is provided, an empty select object is used. The select argument support the standard Seneca query format:

- `select: {f1:v1, f2:v2, ...}` implies pseudo-query `f1==v1 AND f2==v2, ...`.
- `select: {{f1:v1,...}, {sort$:{field1:1}}` means sort by f1, ascending.
- `select: {{f1:v1,...}, {sort$:{field1:-1}}` means sort by f1, descending.
- `select: {{f1:v1,...}, {limit$:10}}` means only return 10 results.
- `select: {{f1:v1,...}, {skip$:5}}` means skip the first 5.
- `select: {{f1:v1,...}, {fields$:['fd1','f2']}}` means only return the listed fields.

> Note: you can use `sort$`, `limit$`, `skip$` and `fields$` together.

> Note: you can use the `select`, `deepselect` and `selection` filters together.

For more information, see the seneca [Query Syntax][] tutorial.

### example

```js
var mySelect = {title: 'About seneca'}
// Query
act({role: 'my-role', cmd: 'query', select: mySelect})
.then(function(result) {
  console.log(result.list)
  return result
})
```

## deepselect

A **deepselect** optional argument can be added to the pattern. If no `deepselect` argument is provided, an empty array is used. The `deepselect` argument is a list of filters, acting as an `AND` combination.

A deep select filter is a JSON string with a property name, and a value the property must match. This is a useful search feature on nested objects.

### example

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

> Note: you can use the `select`, `deepselect` and `selection` filters together.

## selection

The select [Query Syntax][] is not adapted to complex queries. There is no OR + AND mix. To respond to these cases, a **selection** optional argument can be added to the pattern: `selection: function (item) {... coded filters ...}` . If set, this selection argument must be a **function** with:

- An unique argument: the list item to be proceed.
- The return object must be a boolean: `true` if the argument item satisfies the selection, `false` otherwise.

> Note: you can use the `select`, `deepselect` and `selection` filters together.

### example

```js
var mySelection = function (item) {
  var filter_1 = item.title.indexOf('seneca') > -1
  var filter_2 = item.description.indexOf('seneca') > -1
  return filter_1 || filter_2
}
// Query
act({role: 'my-role', cmd: 'query', selection: mySelection})
.then(function(result) {
  console.log(result.list)
  return result
})
```

[The returned namespace]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#the-returned-namespace
[Defaults]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#defaults
[appends]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/appends.md
[joins]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/joins.md
[entity namespace]: http://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace
[seneca patterns]: http://senecajs.org/getting-started/#patterns
[Query syntax]: http://senecajs.org/docs/tutorials/understanding-query-syntax.html