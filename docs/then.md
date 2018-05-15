# *then* feature

Last update: 05/15/2018

# Description

This feature is part of the [seneca-entity-crud][] plugin. It provides additional processes on entities being read or queried.

## Why this feature?

Your application may want to :

* Query entities, *then* update them by adding another default value.
* Read one entity, *then* send it into another microservice.
* Select entities on a value, *then* replace this value by another in the entities being read.
* And so one...

And if, instead of the application, the [seneca-entity-crud][] plugin does the job?

* Better performances.
* More comprehensive.
* Less code, less issues.

Here comes the **then** feature!

## Example

Your database manages products. These products contain a `brand` field.
Your application need to add an additional field `brand_owner` when the brand value is "Special Brand".
The `brand_owner` value must be "John Doo" by default.

With the **then** feature, your code will be:

```js
// Updates the products of the special brand
act({
  role: 'product',
  cmd: 'query',
  select: { brand: 'Special Brand'},
  then: {
    actions: [{
      role: 'product',
      cmd: 'update',
      entity: {
        id: '%id%',
        brand_owner: 'John Doo'
      }
    }]
  }
})

```

That's it! Your application no longer needs promises or loops to achieve the update.

# How it works

## When and where to use it

The **then** feature is optional and applies only to the [read][] and [query][] commands.

## The pattern

The pattern is:

```js
then: {
  actions: [ ... ],
  async: true|false,
  results: {
    includes_start: true|false
    name: 'a_field_name'
  }
}
```

The action containing the **then** object is called the *starting-action*. The **then** object elements are:

* **actions**: an array of seneca actions. Each action is modified with replacement values before it is executed. See below.
* **async**: an optional boolean. The default value is `false`.
  * If `true`, all the actions are fired asynchronously as promises. If needed, the returned object is an array containing all the results of each action.
  * If `false`, each action is executed sequentially. If needed, the returned object is an array containing all the results of each action.
* **results**: an optional object. If set, the **then** actions results can be added to the starting-action result. If not set, the returned object is `{ success: true }`. See below.

The `results` properties are:

* **includes_start**: an optional boolean. The default value is `false`. If `true`, the starting-action results are included in the returned object.
* **name**: an optional string. If set, the **then** results will be associated with a field named as the `name` value.

## The result object

Depending on the settings of the `results` field, the returned object can be:

| command | `results`  is set | includes_start | name   | result object                            |
| ------- | ----------------- | -------------- | ------ | ---------------------------------------- |
| read    | false             |                |        | `{ success: true }`                      |
| read    | true              | false          |        | `{ success: true }`                      |
| read    | true              | false          | a_name | `{ success: true, a_name: [ ...then results... ] }` |
| read    | true              | true           |        | `{ success: read_success, entity: read_entity }` |
| read    | true              | true           | a_name | `{ success: read_success, entity: read_entity, a_name: [ ...then results... ] }` |
| query   | false             |                |        | `{ success: true }`                      |
| query   | true              | false          |        | `{ success: true }`                      |
| query   | true              | false          | a_name | `{ success: true, a_name: [ ...then results... ] }` |
| query   | true              | true           |        | `{ success: query_success, list: query list, count: query_count }` |
| query   | true              | true           | a_name | `{ success: query_success, list: query list, count: query_count, a_name: [ ...then results... ] }` |

If one of the **then** actions fires an error, the result object is not returned. **The error is thrown** and the process ends.

## Values replacement

When an entity is retrieved by a [read][] or [query][] command, all of its fields values can be used in any of the  `then` actions.

Your application set the string to replace with this pattern: `%field_name%`. This string will be replaced by the value of the field named *field_name* of the entity being read.

### Special replacement: %_entity%

To replace the full entity, you can use this special pattern `%_entity%`. The replaced value will not be a string, but the full entity object.

See the archive example below.

# Examples

### Archive

This code queries the old products, sends them to another microservice and finally deletes them.
The action is run in silent mode: the result object is `{ success: true }`.

```js
// Data transfer
act({role: 'product', cmd: 'query', select: {collection: 'old'},
  then: {
    actions: [
      { role: 'archive', cmd: 'create', entity: '%_entity%' },
      { role: 'product', cmd: 'delete', id: '%id%' }
    ]
  }
})
```

### Delete

This code deletes all the products containing the same "quality" value.
The deletions are executed in asynchronous mode.
The result object is the list of the products before the deletion.

```js
// Deletes the marked entities
act({role: 'product', cmd: 'query', select: {quality: 'poor'},
  then: {
    actions: [
      { role: 'product', cmd: 'delete', id: '%id%' }
    ],
    async: true,
    results: {
      includes_start: true
    }
  }
})
```

### New field

For example, a [read][] command on products returns the entity:

```js
{ id: 'abc', type: 'pen', name: 'superpen', color: 'red', price: 2.0 }
```

Together your application adds a new field description to this entity using its values.
The result object is an array containing the entity returned by the `update` command.

```js
// Adds a new field
act({role: 'product', cmd: 'read', id: 'abc',
  then: {
    actions: [
      { role: 'product', cmd: 'update', entity: {
          id: '%id%', description: 'This %name% is %color% and costs $%price%'
      }}
    ],
    results: {
      name: updated
    }
  }
})
```

The result object will be:

```js
{ success: true, updated: [{ id: 'abc', type: 'pen', name: 'superpen', color: 'red', price: 2.0, description: 'This superpen is red and costs $2.0' }] }
```

### Subquery

For example, a [read][] command on products returns the entity:

```js
{ id: 'abc', type: 'pen', name: 'superpen', color: 'red', price: 2.0 }
```

After this `read`, your application queries kits from another microservice using the color of the entity being read. The result object contains the array of the associated addons.

```js
// Query after read
act({role: 'product', cmd: 'read', id: 'abc',
  then: {
    actions: [
      { role: 'addons', cmd: 'query', select: { type: 'kit', color: '%color%' } }
    ],
    results: {
      includes_start: false,
      name: 'addons'
    }
  }
})
```

The result object will be like:

```js
{
    success: true,
    addons: [
        { id: '123', type: 'kit', name: 'blood kit', color: 'red', price: 3.5 },
        { id: '456', type: 'kit', name: 'patterned bag', color: 'red', price: 4.2 }
    ]
}
```

# Recursion

Each action of  the **then** actions array is a seneca action. So it can be another [read][] or [query][] command with another `then` array inside it.

# Contributing
The [Senecajs org][] encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

## License
Copyright (c) 2018, Richard Rodger and other contributors.
Licensed under [MIT][].

[MIT]: ../LICENSE
[Senecajs org]: https://github.com/senecajs/
[seneca-entity-crud]: https://github.com/jack-y/seneca-entity-crud
[read]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#read
[query]: https://github.com/jack-y/seneca-entity-crud/blob/master/README.md#query
