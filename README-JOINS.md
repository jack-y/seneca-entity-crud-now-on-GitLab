# joins feature

Last update: 05/08/2017

## Description

This feature is part of the [seneca-entity-crud][] plugin. It provides deep readings from IDs contained in entities.

### Is your data architecture using redundancy?

This **joins** feature is useful when you manage a database by microservice, and only share the entities IDs with other microservices. Otherwise, your data may be shared with a lot of redundancy, so this feature is not for you. Be free to stop here and save time :)

If you have questions about the microservices data architecture, [this post][] can help.

### Why this feature?

When we develop real applications, we often have to manage a lot of entities. For example: customer, product, catalog, address, order, sell... and **many relations** between them.

Here is an example of a (very) basic relation:

![A basic relation](http://i.imgur.com/YwLZSks.jpg)

Each entity type and its features can be managed by its own microservice. By example:

- The products microservice, with the seneca `product` role.
- The suppliers microservice, with the seneca `supplier` role.
- The deliveries microservice, with the seneca `delivery` role.

Simple, perfect.
But what happens when we want to retrieve the full data of a delivery?

- We read the delivery from its ID
- ... then we read the product from the product ID of the delivery
- ... then we read the supplier from  the supplier ID of the delivery

An example of code:

```js
var delivery = null
var product = null
var supplier = null
// Reads the delivery
act({role: 'delivery', cmd: 'read', id: anId})
.then(function(result) {
	delivery = result.entity
	// Reads the product
	act({role: 'product', cmd: 'read', id: delivery.id_product})
	.then(function(result) {
		product = result.entity
		// Reads the supplier
		act({role: 'supplier', cmd: 'read', id: delivery.id_supplier})
		.then(function(result) {
			supplier = result.entity
			return { delivery: delivery, product: product, supplier: supplier }
		})
	})
})

```

Well ... a lot of code. Oops, we need a new kind of object to exploit the end result. And what happens with more levels? It's frankly complex. 
Tadaaa! Here comes the **joins** feature.

# How it works

## When and where to use it

The **joins** feature is optional and applies only to the [read][] and [query][] commands.

## The pattern

The pattern is:

```js
joins: [ {role: 'myrole', idname: anIdName, resultname: anotherName }, { ... }, ...]
```

The **joins** value is an array of join objects.

You can pass base, zone and name of your entity namespace as optional arguments to override the options.

You can pass an optional `nonamespace: true` argument to remove the namespace of the resulting entity. See the seneca-entity-crud [README file][] for more information..

> Note: the `resultname` value is optional.

Using this feature in our previous example, the delivery reading become:

```js
// Reads the delivery
act({role: 'delivery', cmd: 'read', id: anId, joins: [
	{role: 'product', idname: 'id_product'},
	{role: 'supplier', idname: 'id_supplier'}
]})
.then(function(result) {
  // ... do some stuff with result ...
})

```

Ooooh yeah. Less code. More comprehensive.
In the previous example, the full `result.entity` object will be:

```js
{
	id: 'd4n5oin',
	id_product: 'As7_fhd',
	id_supplier: 'e4r5-sp',
	product: {
		id: 'As7_fhd',
		size: 'XL', 
		...
	},
	supplier: {
		id: 'e4r5-sp',
		name: 'John Deuf', 
		...
	}, 
	...
}
```

Then we can use `delivery.supplier.name`, `delivery.product.size` and so one.
Enjoy!


## Recursion

Each **joins** object act as a `read` command. So we can use other joins inside it. 

By example: now products are manufactured by brands. We have a new microservice managing these entities:

```js
brand: { id: anId, name: aName, ...}
```

And the product entity has a new field: `id_brand`.

Let's have a look of the new full delivery reading:

```js
// Reads the delivery
act({role: 'delivery', cmd: 'read', id: anId, joins: [
	{role: 'product', idname: 'id_product', joins: [
		{role: 'brand', idname: 'id_brand'}
	]},
	{role: 'supplier', idname: 'id_supplier'}
]})
.then(function(result) {
  // ... do some stuff with result ...
})

```

Efficient! With these few lines of code, we can retrieve `delivery.product.brand.name` and so one.

## The role

The **joins** pattern is:

```js
joins: [ {role: 'myrole', idname: anIdName, resultname: anotherName }, { ... }, ...]
```

The **role** name is the one used to perform the generated `read` command. The ID to read is the value of a field in the origin entity. The name of this field is set in the `idname` value. OK, let's see an example:

The entity `delivery` contains the field `id_product` with the value `As7_fhd`.
To read the product, the **role** to use is `product` in this seneca example.
So the join object will be:

```js
{ role: 'product', idname: 'id_product'}
```

> Note: during execution, it will generate this `read` command:

```js
{ role: 'product', cmd: 'read', id: 'As7_fhd'}
```

### The result entity field name

The result entity will be put in a new field of the origin entity. If no `resultname` value is provided, this field will have the same name as the **role**. By example, with the `product` role, the end delivery entity become:

```js
{
	id: 'd4n5oin',
	id_product: 'As7_fhd',
	product: {
		id: 'As7_fhd',
		size: 'XL', 
		...
	}, 
	...
}
```

To avoid collisions with existing fields in the origin entity, you can use the `resultname` value. See the [chapter below](#the-result-name).

## The ID name

The **joins** pattern is:

```js
joins: [ {role: 'myrole', idname: anIdName, resultname: anotherName }, { ... }, ...]
```

The **idname** value is the name of the origin entity field who contains the ID to read. In the previous example, the product ID to read is set in the `id_product` field of the delivery:

```js
{
	id: 'd4n5oin',
	id_product: 'As7_fhd', 
	...
}
```

Then the join value will be:

```js
{ role: 'product', idname: 'id_product'}
```

## The result name

The **joins** pattern is:

```js
joins: [ {role: 'myrole', idname: anIdName, resultname: anotherName }, { ... }, ...]
```

To avoid collisions with existing fields in the origin entity, you can use the `resultname` value. This is optional.

- If the `resultname` value **is set**, the new field of the end entity will be named as this `resultname` value.

By example, with this join:
```js
{role: 'product', idname: 'id_product', resultname: 'delivery_product' }
```
 
the end delivery entity become:

```js
{
	id: 'd4n5oin',
	id_product: 'As7_fhd',
	delivery_product: {
		id: 'As7_fhd',
		size: 'XL',
		...
	},
	...
}
```

- If the `resultname` value is unset, the **role** name is used. See the [previous chapter](#the-role).

# ... and what about multiple relations?

Relations can be very complex. I agree, this **joins** feature applies to simple cases.
If you find solutions for more complex situations, I will be happy to share them.

# Contributing
The [Senecajs org][] encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

## License
Copyright (c) 2017, Richard Rodger and other contributors.
Licensed under [MIT][].

[MIT]: ../LICENSE
[Senecajs org]: https://github.com/senecajs/
[seneca-entity-crud]: https://github.com/jack-y/seneca-entity-crud
[README file]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#the-returned-namespace
[read]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#read
[query]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#query
[this post]: http://microservices.io/patterns/data/database-per-service.html
