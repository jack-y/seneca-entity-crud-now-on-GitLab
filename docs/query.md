# query

Last update: 04/24/2018

## Description

Use this command to retrieve a list of entities from your database.

## Pattern

```js
{role: 'my-role', cmd: 'query'}
```

### Optional arguments

* **appends**: perform others actions during the query. See the [appends][] feature.
* **base**, **zone** and **name**: set your entity namespace to override the options.
* **defaults**: add defaults to the resulting entities. See the chapter [Defaults][].
* **joins**: proceed deep reading from IDs contained in the entities. See the [joins][] feature.
* **nonamespace**: if `true`, remove the namespace of the resulting entities. See the chapter [The returned namespace][].
* **then**: provides additional treatments on the entities being read. See the [then][] feature.

For more information on base, zone and name, see the [entity namespace][] tutorial.
For more information on role, see the [seneca patterns][] guide.

### Filter the list

With the previous pattern, all the entities of the database are retrieved. If you want to retrieve only some entities via filters, these 4 optional arguments can be used :

* **[select](#select)**: this argument support the standard Seneca query format.
* **[deepselect](#deepselect)**: this argument is a list of filters, acting as an `AND` combination.
* **[selection](#selection)**: filter with a function passed as argument.
* **[selectioncode](#selectioncode)**: filter with the code passed as string argument.

> Note: you can use the `select`, `deepselect`, `selection` and `selectioncode` filters together.

## Result object

- **success**: `true`.
- **list**: the entities array, according to the filters. If no entity match the filters, an empty array is returned.
- **count**: the number of entities, according to the filters. If no entity match the filters, the `0` value is returned.

If the **then** feature is used, the result object depends on the **then** arguments. See the [then][] feature.

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

> Note: you can use the `select`, `deepselect`, `selection` and `selectioncode` filters together.

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

> Note: you can use the `select`, `deepselect`, `selection` and `selectioncode` filters together.

## selection

The select [Query Syntax][] is not adapted to complex queries. There is no OR + AND mix. To respond to these cases, two optional filters can be added to the pattern: **selection** and **selectioncode**.

The **selection** optional filter is used when the application can call the query by passing an argument as a *function* object. This is the simplest option as you can see below.

When the application uses JSON strings to pass arguments, the functions are omitted during the conversion. The application cannot pass a function as a selection filter. The solution is to use the optional filter **selectioncode** to transmit the filter code. See the next chapter. For more information on JSON conversion, see the [stringify][] feature.

The **selection** optional argument can be added to the pattern:

`selection: function (item) {... coded filters ...}` 

If set, this selection argument must be a **function** with:

- An unique argument: the list item to be proceed.
- The return object must be a boolean: `true` if the argument item satisfies the selection, `false` otherwise.

> Note: you can use the `select`, `deepselect`, `selection` and `selectioncode` filters together.

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

## selectioncode

The select [Query Syntax][] is not adapted to complex queries. There is no OR + AND mix. To respond to these cases, two optional filters can be added to the pattern: **selection** and **selectioncode**.

The **selection** optional filter is used when the application can call the query by passing an argument as a *function* object. This is the simplest option as you can see in the previous chapter.

When the application uses JSON strings to pass arguments, the functions are omitted during the conversion. The application cannot pass a function as a selection filter. The solution is to use the optional filter **selectioncode** to transmit the filter code, as you can see below. For more information on JSON conversion, see the [stringify][] function.

The argument value must be a **string**: the body of the filter function. The application does not need to specify the name and arguments of the filter function. Only the body code is required. 

The list item to be proceed must be named `item` in the code. Here is an example of a filter code:

```js
return (item.author && item.author.name === 'John Doo' && item.zipcode === '59491' );
```

The **selectioncode** optional argument can be added to the query pattern:

```js
selectioncode: '... code ...'
```

The filter function code designed by the calling application must apply these rules:

- The list item to be proceed is named `item` and must be used at least once.
- the returned object is a **boolean**: `true` if the item is consistent with the filter function, `false` otherwise.

### example

```js
var mySelectionCode = 'var filter_1 = item.title.indexOf("seneca") > -1; var filter_2 = item.description.indexOf("seneca") > -1; return filter_1 || filter_2;'
// Query
act({role: 'my-role', cmd: 'query', selectioncode: mySelectionCode})
.then(function(result) {
  console.log(result.list)
  return result
})
```

> Note: you can use the `select`, `deepselect`, `selection` and `selectioncode` filters together.

[The returned namespace]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#the-returned-namespace
[Defaults]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#defaults
[appends]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/appends.md
[entity namespace]: http://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace
[joins]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/joins.md
[Query syntax]: http://senecajs.org/docs/tutorials/understanding-query-syntax.html
[seneca patterns]: http://senecajs.org/getting-started/#patterns
[then]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/then.md
[stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify