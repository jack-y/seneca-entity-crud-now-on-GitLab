# validate

Last update: 04/02/2018

## Description

Use this command to validate your data. 

## Pattern

```js
{role: role, cmd: 'validate', entity: myEntity, validate_function: myFunction}
```

For more information and examples, see the [input data validation][] documentation.

## Result object

- **success**: `true` or `false`
- **errors**: an array of error objects. An example of the error format can be: `{field: 'a name', actual: 'a value', error: 'an error message'}`.

If there is no validation error, `success` is set to `true` and the errors array is set empty:

```js
{success: true, errors: []}
```

## Example

For more information and examples, see the [input data validation][] documentation.

[input data validation]: https://github.com/jack-y/seneca-entity-crud/tree/master/docs/input-data-validation.md
