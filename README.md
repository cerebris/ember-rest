# Ember-REST

A *very* simple library for RESTful resources in Ember.js.

## Requirements

Ember.js and jQuery.js

## Usage

### Ember.Resource

Create models that extend Ember.Resource. For example:

```
App.Contact  = Ember.Resource.extend({
  url:        '/contacts',
  name:       'contact',
  properties: ['first_name', 'last_name'],

  validate: function() {
    if (this.get('first_name') === undefined || this.get('first_name') === '' ||
        this.get('last_name') === undefined  || this.get('last_name') === '') {
      return 'Contacts require a first and a last name.';
    }
  },

  fullName: Ember.computed(function() {
    return this.get('first_name') + ' ' + this.get('last_name');
  }).property('first_name', 'last_name')
});
```

Define the following properties for your models:

 * `name` -- the name used to contain the serialized data in this object's JSON representation
 * `properties` -- an array of property names to be returned in this object's JSON representation
 * `url` -- the base url of the resource (e.g. '/contacts'); will append '/id' for individual resources

You may wish to override / define the following methods:

 * `serialize()` - generate this resource's JSON representation
 * `serializeProperty(prop)` - generate an individual property's JSON representation
 * `deserialize(json)`
 * `deserializeProperty(prop, value)`
 * `validate()` - parse values and return an error string or object if appropriate

The following CRUD methods are available on resources:

 * `save()` - create a new resource or update an existing one
 * `destroy()` - delete an existing resource
 
Here's an example of creating a new resource with `save()`:

```
  submitForm: function() {
    var self = this;
    var contact = this.get("contact");

    contact.save()
      .fail( function(e) {
        App.displayError(e);
      })
      .done(function() {
        App.contactsController.pushObject(contact);
        self.get("parentView").hideNew();
      });
  }
```

Here's an almost identical example of updating an existing resource with `save()`:

```
  submitForm: function() {
    var self = this;
    var contact = this.get("contact");

    contact.save()
      .fail( function(e) {
        App.displayError(e);
      })
      .done( function() {
        var parentView = self.get("parentView");
        parentView.get("contact").duplicateProperties(contact);
        parentView.hideEdit();
      });
  }
```

And an example of deleting an existing resource with `destroy()`:

```
  destroyRecord: function() {
    var contact = this.get("contact");

    contact.destroy()
      .done(function() {
        App.contactsController.removeObject(contact);
      });
  }
```

### Ember.ResourceController

Extend Ember.ResourceController to create controllers of resources. For example:

```
App.contactsController = Ember.ResourceController.create({
  type: App.Contact
});
```

Define the following properties for your controller:

 * `type` -- an Ember.Resource class; the class must have a 'data' property that returns a JSON representation of the object
 * `url` -- (optional) the base url of the resource (e.g. '/contacts/active'); will default to the `url` for `type`

The following methods are available:

 * `load(json)` -- create and load a single `Ember.Resource` from JSON
 * `loadAll(json)` -- create and load `Ember.Resource` objects from a JSON array
 * `findAll()` -- replace `contents` with an ajax call to `url`

## Tests

Coming soon...

## Sample app

https://github.com/dgeb/ember_rest_example

## License

Copyright 2012 Cerebris Corporation. MIT License (see LICENSE for details).
