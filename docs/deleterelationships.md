# deleterelationships

Last update: 04/02/2018

## Description

Use this command to remove all relationships of an entity from your database.
For more explanations, see the [relational delete][] documentation.

## Pattern

```js
{
  role: 'my-role',
  cmd: 'deleterelationships',
  id: 'an-id',
  relationships: [ ... an array of relationships ... ]
}
```

### optional arguments

- **base**, **zone** and **name**: set your entity namespace to override the options.

For more information on base, zone and name, see the [entity namespace][] tutorial.

## Result object

- **success**: `true`.
- **results**: an array of subquery results.

A **subquery** is the `query` action fired for each relationship before deletion. The subquery returns the entities to be deleted for its relationship.
Each subquery result contains:

- **success**: the value of the subquery `success` result.
- **role**: the role of the relationship.
- **zone**: the optional zone of the relationship, or `null`.
- **base**: the optional base of the relationship, or `null`. 
- **name**: the name of the relationship.
- **count**: the number of entities found in this relationship.

## Example

```js
var myId = '5a4732ef4049cfcb07d992007e003932'
// Delete
act({role: 'my-role', cmd: 'deleterelationships', id: myId, relationships: myModel})
.then(function (result) {
  console.log('Id ' + myId + ' relationships deleted.')
  return result
})
```
[relational delete]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/relational-delete-feature.md
[entity namespace]: http://senecajs.org/docs/tutorials/understanding-data-entities.html#zone-base-and-name-the-entity-namespace
