# appends feature

Last update: 02/16/2018

## Description

This feature is part of the [seneca-entity-crud][] plugin. It provides more actions results during read or query.

### Why this feature?

When reading or querying an entity, it can be useful to perform another read based on some entity field value. E.g: your application can read a product ID from an order, then read this product's stock based on another ID referenced by another microservice.

### Example

Our application uses 3 microservices:

* **order**: it manages orders lines with the pattern:

  ```js
  { id: anOrderLineId, id_prd: aProductId, quantity: anInteger }
  ```

* **warehouse**: it manages products in warehouses with the pattern:

  ```js
  { id: aWarehouseProductId, id_product: aProductId, id_warehouse: aWarehouseId }
  ```

* **supplier**: it manages products and suppliers with the pattern:

  ```js
  { id: aSupplierId, stock: anInteger }
  ```

For this example, the warehouse-product ID is equivalent to the supplier ID.

Now the application wants to know the global stock of the product ordered on the line 3. This could be done with multiple lines of code:

```js
var globalstock = 0
/* Reads the line 3 */
act({role: 'order', cmd: 'read', id:3})
.then (function (result) {
  /* Reads the warehouses of the product */
  act({role: 'warehouse', cmd: 'query', select: {'id_product':result.entity.id_prd}})
  .then(function (result) {
    /* We have to manage promises... */
    var promises = []
    result.list.forEach(function (item) {
      promises.push(act({role: 'supplier', cmd: 'read', id:item.id}))
    }
    promise.all(promises)
    .then(function (results) {
      /* ...then we compute the stock */
      results.forEach(function (suppliers) {
        suppliers.list.forEach(function (supplier) {
	      globalstock += supplier.stock
        })
      })
    })
  })
})
```



Using the **appends** and the joins features, this can be done in one instruction:

```js
var globalstock = 0
/* Reads the line 3 */
act({role: 'order', cmd: 'read', id:3, appends: [{
  resultname: 'stocks',
  action: {
    role: 'warehouse',
    cmd: 'query',
    joins: [{role: 'supplier', idname: 'id', resultname: 'supplier'}]
  },
  select: {idname: 'id_product', valuename: 'id_prd'}
}]})
.then (function (result) {
  /* Computes the stock */
  result.entity.stocks.forEach(function (item) {
    globalstock += item.supplier.stock
  })
})
```

Less code. More comprehensive. Enjoy it!


# How it works

## When and where to use it

The **appends** feature is optional and applies only to the [read][] and [query][] commands.

## The pattern

The pattern is:

```js
appends: [ {action: anAction, select: anObject, resultname: aResultName}, { ... }, ...]
```

The **appends** value is an array of `append` objects. For each object:

* **action**: an object. Any action with a seneca pattern. If the action command is `query`, the optional select object can be used. See below.
* **select**: an object. This field is optional. If the action command is `query`, the query command `select` filter is set with this object values. See below.
* **resultname**: a string. The name of the field tobe added to the read entity. This field will contain the action result. If this field already exists in the entity, it will be overriden. See below.

## Action

Each **appends** object act as the action it contains. So you can use any command, recursion, joins and so one. As the pattern is an array of multiple **appends** objects with differents actions, the result entity will have multiple result fields, one for each action.

## Select

**appends** is a good feature to retrieve more data for an entity, using others roles and others IDs. To retrieve data from another microservice using another ID than the primary ID, the **select** object is used with this pattern:

```js
select: { idname: aTargetFieldName, valuename: aSourceFieldName }
```

- **idname**: a string. This is the name of the target field on which filter.
- **valuename**: a string. This is the name of the source field containing the value by which filter.

During the **appends** process, if the source action was:

```js
action: {role: aRole, cmd: 'query'}
```

its becomes:

```js
action: {role: aRole, cmd: 'query', select: {aTargetFieldName: aSourceFieldNameValue}}
```

## The result name

The result of the **append** action will be put in a new field of the origin entity. To avoid collisions with existing fields in the origin entity, you can use the `resultname` value. This is optional.

- If the `resultname` value **is set**, the new field of the end entity will be named as this `resultname` value.
- If not set, this field will have the same name as the **role** of the **append** action.

# Contributing
The [Senecajs org][] encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

## License
Copyright (c) 2017-2018, Richard Rodger and other contributors.
Licensed under [MIT][].

[MIT]: ../LICENSE
[Senecajs org]: https://github.com/senecajs/
[seneca-entity-crud]: https://github.com/jack-y/seneca-entity-crud
[read]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#read
[query]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#query
