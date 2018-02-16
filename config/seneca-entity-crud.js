/* microservice configuration file */
var config = {}

/* NOTE: For more informations on entities and patterns, see:
   https://github.com/senecajs/seneca-entity
   http://senecajs.org/getting-started/#patterns
*/

/* The default entity zone.
   The application may override this value.
   Examples: 'My_company', 'France', 'My_city'... */
config.zone = null

/* The default entity base.
  The application may override this value.
  Examples: 'Marketing', 'Shop', '15th_street'... */
config.base = null

/* The default entity name.
  The application may override this value.
  Examples: 'Product', 'Customer', 'House'... */
config.name = 'entity'

/* The "last update" boolean
   true -> automatically adds the 'last_update' field set as current date.
   The entity is updated before create and update actions. */
config.last_update = false

/* The default role.
   The application may override this value.
    Examples: 'my_app', 'products', 'music-store'... */
config.role = 'entity'

/* The "no entity" error message */
config.msg_no_entity = 'no entity'

/* Exports this configuration */
module.exports = config
