/* Copyright (c) 2017-2018 e-soa Jacques Desodt, MIT License */
'use strict'
var config = {}

config.relationships = [
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

config.deletebrandname = 'Fender'

config.names = ['brand', 'type', 'product', 'supplier',
  'brand_type', 'brand_supplier', 'type_product']

config.entities = [
  // Brands
  {name: 'brand', entity: {name: 'Fender'}},
  {name: 'brand', entity: {name: 'Gibson'}},
  // Types
  {name: 'type', entity: {name: 'Fender Electric Guitar'}},
  {name: 'type', entity: {name: 'Gibson Electric Guitar'}},
  // Products
  {name: 'product', entity: {name: 'Stratocaster'}},
  {name: 'product', entity: {name: 'Telecaster'}},
  {name: 'product', entity: {name: 'Deluxe'}},
  // Suppliers
  {name: 'supplier', entity: {name: 'Real Guitars'}},
  {name: 'supplier', entity: {name: 'Guitar Solo'}}
]

config.entitiesrelationships = [
  // Brand > Type
  {
    name: 'brand_type',
    in: {name: 'brand', data: 'Fender'},
    out: {name: 'type', data: 'Fender Electric Guitar'}
  },
  {
    name: 'brand_type',
    in: {name: 'brand', data: 'Gibson'},
    out: {name: 'type', data: 'Gibson Electric Guitar'}
  },
  // Brand > Supplier
  {
    name: 'brand_supplier',
    in: {name: 'brand', data: 'Fender'},
    out: {name: 'supplier', data: 'Real Guitars'}
  },
  {
    name: 'brand_supplier',
    in: {name: 'brand', data: 'Fender'},
    out: {name: 'supplier', data: 'Guitar Solo'}
  },
  {
    name: 'brand_supplier',
    in: {name: 'brand', data: 'Gibson'},
    out: {name: 'supplier', data: 'Real Guitars'}
  },
  // Type > Products
  {
    name: 'type_product',
    in: {name: 'type', data: 'Fender Electric Guitar'},
    out: {name: 'product', data: 'Stratocaster'}
  },
  {
    name: 'type_product',
    in: {name: 'type', data: 'Fender Electric Guitar'},
    out: {name: 'product', data: 'Telecaster'}
  },
  {
    name: 'type_product',
    in: {name: 'type', data: 'Gibson Electric Guitar'},
    out: {name: 'product', data: 'Deluxe'}
  }
]

config.results = [
  {name: 'brand', count: 1},
  {name: 'type', count: 1},
  {name: 'product', count: 1},
  {name: 'supplier', count: 2},
  {name: 'brand_type', count: 1},
  {name: 'type_product', count: 1},
  {name: 'brand_supplier', count: 1}
]

// Exports configuration
module.exports = config
