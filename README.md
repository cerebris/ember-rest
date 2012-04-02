# Ember-REST  [![Build Status](https://secure.travis-ci.org/cerebris/ember-rest.png)](http://travis-ci.org/cerebris/ember-rest)

A *very* simple library for RESTful resources in Ember.js.

This was extracted from a simple example app:
https://github.com/dgeb/ember_rest_example

## Requirements

Ember.js and jQuery.js

## Changes

This library is a work in progress. All breaking changes and significant updates will be reported in CHANGELOG

## Usage

### Ember.Resource

Create models that extend Ember.Resource. For example:

```
App.Contact  = Ember.Resource.extend({
  resourceUrl:        '/contacts',
  resourceName:       'contact',
  resourceProperties: ['first_name', 'last_name'],

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

 * `resourceIdField` -- the id field for this resource ('id' by default)
 * `resourceUrl` -- the base url of the resource (e.g. '/contacts'); will append '/' + id for individual resources
 * `resourceName` -- the name used to contain the serialized data in this object's JSON representation (required only for serialization)
 * `resourceProperties` -- an array of property names to be returned in this object's JSON representation (required only for serialization)

Note that because `resourceName` and `resourceProperties` are only used for serialization, they aren't required for read-only resources.

You may wish to override / define the following methods:

 * `serialize()` - generate this resource's JSON representation
 * `serializeProperty(prop)` - generate an individual property's JSON representation
 * `deserialize(json)`
 * `deserializeProperty(prop, value)`
 * `validate()` - parse values and return an error string or object if appropriate
 * `isNew()` - determines whether this a new resource based on the presence of its `id`

The following CRUD methods are available on resources:

 * `findResource()` - loads a resource
 * `saveResource()` - create a new resource or update an existing one
 * `destroyResource()` - delete an existing resource

Here's an example of loading a single resource with `findResource()`:

```
  var contact = Contact.create({id: 1});

  contact.findResource()
    .fail( function(e) {
      App.displayError(e);
    })
    .done(function() {
      alert("Loaded!");
    });
```

Here's an example of creating a new resource with `saveResource()`:

```
  submit: function(event) {
    var self = this;
    var contact = this.get("contact");

    event.preventDefault();

    contact.saveResource()
      .fail( function(e) {
        App.displayError(e);
      })
      .done(function() {
        App.contactsController.pushObject(contact);
        self.get("parentView").hideNew();
      });
  }
```

Here's an almost identical example of updating an existing resource with `saveResource()`:

```
  submit: function(event) {
    var self = this;
    var contact = this.get("contact");

    event.preventDefault();

    contact.saveResource()
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

And an example of deleting an existing resource with `destroyResource()`:

```
  destroyRecord: function() {
    var contact = this.get("contact");

    contact.destroyResource()
      .done(function() {
        App.contactsController.removeObject(contact);
      });
  }
```

### Ember.ResourceController

Extend Ember.ResourceController to create controllers of resources. For example:

```
App.contactsController = Ember.ResourceController.create({
  resourceType: App.Contact
});
```

Define the following properties for your controller:

 * `resourceType` -- an Ember.Resource class; the class must have a `serialize()` method that returns a JSON representation of the object
 * `resourceUrl` -- (optional) the base url of the resource (e.g. '/contacts/active'); will default to the `resourceUrl` for `resourceType`

The following methods are available:

 * `load(json)` -- create and load a single `Ember.Resource` from JSON
 * `loadAll(json)` -- create and load `Ember.Resource` objects from a JSON array
 * `findAll()` -- replace `contents` with an ajax call to `resourceUrl`
 * `clearAll()` -- clear `contents` (without deleting resources)

### Ember.ResourceAdapter

Ember.ResourceAdapter is mixed in to both Ember.Resource and Ember.ResourceController to perform resource requests. The default implementation is a thin wrapper around jQuery.ajax().

If you would like to completely override Ember.ResourceAdapter, define your own version before including ember-rest.js. For example:

```
  Ember.ResourceAdapter = Ember.Mixin.create({
    _resourceRequest: function(params) {
      // TODO - your implementation here
    }
  });
```

If you would just like to modify the behavior of Ember.ResourceAdapter, just reopen it. A `_prepareResourceRequest()` hook has been provided to allow modifications to the params passed to `jQuery.ajax()`.

Here's an example that adds oauth support (note: this is not completely generalized - it depends on `MyApp.oauthToken`):

```
  Ember.ResourceAdapter.reopen({
    _prepareResourceRequest: function(params) {
      params.beforeSend = function (xhr, settings) {
        xhr.withCredentials = true;
        xhr.setRequestHeader('Authorization', 'Bearer ' + MyApp.oauthToken);
      }
    }
  });
```


## Tests

QUnit and Sinon are used for tests. Simply open `tests/index.html` in your browser to run all the tests. No local server required.

## Contributions

Please file issues on Github. Pull requests are welcome too.

## License

Copyright 2012 Cerebris Corporation. MIT License (see LICENSE for details).