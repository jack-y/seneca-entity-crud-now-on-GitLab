# Relational Delete feature: example

Last update: 07/05/2017

# The use case

In a Vintage Music Store, the manager decide to stop selling Fender products (*what a pity*). He wants to delete all associated product references in the information system.

Fortunately, the manager uses [Seneca][] microservices with the [seneca-entity-crud][] plugin.

All that the manager will do is to say to the system: "Please, delete the entity of the Fender brand". The plugin will do the rest!

### The example sources

The example script file is `test-relationships.js`
The example configuration file is `config/test-relationships.js`

# The relational model

This is the relational model of our Vintage Music Store products:

![Brand relationships](http://i.imgur.com/OU6Vsyh.jpg)

It shows multilevels, and one constraint: the *supplier* instances must be kept for further use.

## The entities

> Note: to simplify, all entities have only one property: their name.

### Brand

In this example, our small store only sells 2 brands:

- Fender
- Gibson

### Type

The type is an intermediate level. 2 types in the system:

- Fender electric guitar
- Gibson electric guitar

### Product

Our store is so small: only 3 (but so good) products.

- Fender Stratocaster
- Fender Telecaster
- Gibson ES-335

## The relationships

### Brand - Type

This relationship is named: `brand_type`. 3 values:

- Fender electric guitar > Fender Stratocaster
- Fender electric guitar > Fender Telecaster
- Gibson electric guitar > Gibson ES-335

In the system, the `brand_type` entity contains one field for each node ID:

- id_brand
- id_type

### Type - Product

This relationship is named: `type_product`. 2 values:

- Fender > Fender electric guitar
- Gibson > Gibson electric guitar

The `type_product` entity contains one field for each node ID:

- id_type
- id_product

### Brand - Supplier

This relationship is named: `brand_supplier`. 3 values:

- Fender > Real Guitars
- Fender > Guitar Solo
- Gibson > Real Guitars

The `brand_supplier` entity contains one field for each node ID:

- id_brand
- id_supplier

## The relationships declaration

In accordance with the model, here is our relationships declaration:

```js
relationships = [
  {
    location: {
      role: 'entity-crud-test',
      name: 'brand_type'
    },
    in_idname: 'id_brand',
    out: {
      location: {
        role: 'entity-crud-test',
        name: 'type'
      },
      idname: 'id_type',
      delete: true
    },
    relationships: [
      {
        location: {
          role: 'entity-crud-test',
          name: 'type_product'
        },
        in_idname: 'id_type',
        out: {
          location: {
            role: 'entity-crud-test',
            name: 'product'
          },
          idname: 'id_product',
          delete: true
        }
      }
    ]
  },
  {
    location: {
      role: 'entity-crud-test',
      name: 'brand_supplier'
    },
    in_idname: 'id_brand',
    out: {
      location: {
        role: 'entity-crud-test',
        name: 'supplier'
      },
      idname: 'id_supplier'
    }
  }
]
```

> Note: in accordance with the start constraint, the `brand_supplier` *out* node has no `delete: true` information.

# The main script

All the work is done with these few lines:

```js
// idFender have been retrieved before
seneca.act({role: 'entity-crud-test', name: 'brand', cmd: 'delete', id: idFender}, function (err, result) {
  if (err) return console.error(err)
  // The 'config.relationships' data has been retrieved from a configuration file
  seneca.act({role: 'entity-crud-test', cmd: 'deleterelationships', id: idFender, relationships: config.relationships}, function (err, result) {
    if (err) return console.error(err)
    console.log('Bye bye Fender!')
  })
}))
```

# Run the example

To run this example:

	node ./test-relationships.js

The output shows the count of the entities and relationships before and after the deletion.

# Contributing
The [Senecajs org][] encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

## License
Copyright (c) 2017, Richard Rodger and other contributors.
Licensed under [MIT][].

[MIT]: ../LICENSE
[Senecajs org]: https://github.com/senecajs/
[Seneca]: https://github.com/senecajs/seneca
[seneca-entity-crud]: https://github.com/jack-y/seneca-entity-crud
[delete]: https://github.com/jack-y/seneca-entity-crud#delete
[truncate]: https://github.com/jack-y/seneca-entity-crud#truncate
[seneca mesh]: https://github.com/senecajs/seneca-mesh
[entities]: http://senecajs.org/docs/tutorials/understanding-data-entities.html
[triggers]: https://github.com/jack-y/seneca-triggers
[namespace]: http://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace
[message]: http://senecajs.org/getting-started/#how-patterns-work
[readme]: https://github.com/jack-y/seneca-entity-crud/blob/master/relationships/README-EXAMPLE.md
