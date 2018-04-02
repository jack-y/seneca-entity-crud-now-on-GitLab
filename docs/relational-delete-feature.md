# Relational Delete feature

Last update: 04/02/2018

## Description

This feature is part of the [seneca-entity-crud][] plugin. It provides deletion of a set of entities in relation to a given entity.

### Why this feature?

When we develop real applications, we often have to **manage relationships** between entities: products are listed in a nomenclature, courses are managed by level, customers place orders... The relationship may be strong between the main entity (e.g. the top of the nomenclature) and its sublevels. Then, the deletion of the main entity implies the removal of its sublevels.

How to implement this with [entities][]?
As a first solution, [seneca mesh][] provides the **model: observe** feature to propagate a delete message to any microservice. But it becomes a pain when there are many levels to manage.

Tadaaa! Here comes the **deleterelationships** command.

# How it works

## When and where to use it

The **deleterelationships** command can be used standalone, or coupled with the  [delete][] and [truncate][] commands. In these cases it's a good candidate for [triggers][].

## Define the relationships

The application must know the relationships. This can not be provided only by the microservices implementation because of the **loose couple** concept.
So, the list of the relationships has to be described.

### The entity location

As the application will delete some entities, it must know where to find them. We define an entity location pattern:

```js
{
  role: 'role-name',
  zone: 'zone-name',
  base: 'base-name',
  name: 'entity-primary-name'
}
```

- **role**: the primary name of the [message][] that will be published over the network.
- **zone**: this field is optional. This is part of the entity [namespace][].
- **base**: this field is optional. This is part of the entity [namespace][]. 
- **name**: the primary name of this entity. This is part of the entity [namespace][].

### The out node

One relationship has 2 nodes: *in* and *out*.
For the *in* node, we only have to know the name of its ID field.
For the *out* node, the pattern is:

```js
{
  location: { ... an entity location ... },
  idname: 'a-field-name',
  delete: true/false
}
```

- **location**: the location of this node.
- **idname**: the name of the field that contains the entity ID in the relationship. See below.
- **delete**: true/false. If true, when deleting the relationship, the plugin will also delete the *out* entity.

**idname**
The relationship refers to the *in* and *out* node entities by their ID. Each ID is memorized in a field of the relationship. The plugin must know this field name to retrieve its data. That's the purpose of the  **idname**.

**delete**
When deleting a relationship, sometimes the *out* node entity must also be deleted: if we delete the top of a nomenclature, all of its children must be deleted. Sometimes it is the opposite: we can delete a product and the relationship with its supplier, but keep this supplier for other purpose.
The **delete** boolean explicite this choice.

> Note: the **delete** boolean applies only to the *out* node.

### The relationship

The relationship pattern is:

```js
{
  location: { ... an entity location ... },
  in_idname: 'a-field-name',
  out: { ... a node ... },
  relationships: [ ... an array of relationships ... ]
}
```

- **location**: like entities, the relationship is stored in a certain location.
- **in_idname**: the name of the field that contains the entity ID in the relationship. See below.
- **out**: the *out* node.
- **relationships**: this field is optional. If the *out* node has a sublevel of relationships, it is described here.

> Note: the **relationships** field provides the recursion. All levels and graphs can be managed.

**in_idname**
The relationship refers to the *in* and *out* node entities by their ID. Each ID is memorized in a field of the relationship. The plugin must know this field name to retrieve its data. That's the purpose of the  **in_idname**.

## The action pattern

To trigger the **relational delete** action, the pattern is:

```js
{
  role: 'a-name',
  cmd: 'deleterelationships',
  id: 'an-id',
  relationships: [ ... an array of relationships ... ]
}
```

- **role**: the primary name of the [message][] that will be published over the network.
- **cmd**: the name of the command: `deleterelationships`
- **id**: the id of the entity that own relationships to be deleted.
- **relationships**: the list of the relationships to delete.

> Note: the **id** is associated to the top *in* node entity of the first level of the relationships. 

## Asynchronous deletions

All the entities and relationships deletions are done in asynchronous mode.

# The full example

The `test/deleterelationships-test.js` script contains a full multilevels example.
The `test/relationships-config.js` file contains an example of the relationships description.

They are described in this [readme][] file.

[seneca-entity-crud]: https://github.com/jack-y/seneca-entity-crud
[delete]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/crud-delete.md
[truncate]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/truncate.md
[seneca mesh]: https://github.com/senecajs/seneca-mesh
[entities]: http://senecajs.org/docs/tutorials/understanding-data-entities.html
[triggers]: https://github.com/jack-y/seneca-triggers
[namespace]: http://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace
[message]: http://senecajs.org/getting-started/#how-patterns-work
[readme]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/relational-delete-example.md
