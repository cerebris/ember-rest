/**
 Ember-REST.js

 A simple library for RESTful resources in Ember.js

 Copyright (c) 2012 Cerebris Corporation

 Licensed under the MIT license:
   http://www.opensource.org/licenses/mit-license.php
*/

/**
  A model class for RESTful resources

  Extend this class and define the following properties:

  * `name` -- the name used to contain the serialized data in this object's JSON
       representation
  * `properties` -- an array of property names to be returned in this object's
       JSON representation
  * `url` -- the base url of the resource (e.g. '/contacts'); will append '/id' 
       for individual resources

  You may also wish to override / define the following methods:

  * `serialize()`
  * `serializeProperty(prop)`
  * `deserialize(json)`
  * `deserializeProperty(prop, value)`
  * `validate()`
*/
Ember.Resource = Ember.Object.extend({
  name:       Ember.required(),
  properties: Ember.required(),
  url:        Ember.required(),

  /**
    Duplicate every property from another resource
  */
  duplicateProperties: function(source) {
    var prop;
    for(var i = 0; i < this.properties.length; i++) {
      prop = this.properties[i];
      this.set(prop, source.get(prop));
    }
  },

  /**
    Generate this resource's JSON representation

    Override this or `serializeProperty` to provide custom serialization
  */
  serialize: function() {
    var ret = {},
        prop;

    ret[this.name] = {};
    for(var i = 0; i < this.properties.length; i++) {
      prop = this.properties[i];
      ret[this.name][prop] = this.serializeProperty(prop);
    }
    return ret;
  },

  /**
    Generate an individual property's JSON representation

    Override to provide custom serialization
  */
  serializeProperty: function(prop) {
    return this.get(prop);
  },

  /**
    Set this resource's properties from JSON

    Override this or `deserializeProperty` to provide custom deserialization
  */
  deserialize: function(json) {
    Ember.beginPropertyChanges(this);
    for(var prop in json) {
      if (json.hasOwnProperty(prop)) this.deserializeProperty(prop, json[prop]);
    }
    Ember.endPropertyChanges(this);
    return this;
  },

  /**
    Set an individual property from its value in JSON

    Override to provide custom serialization
  */
  deserializeProperty: function(prop, value) {
    this.set(prop, value);
  },

  /**
    Create (if new) or update (if existing) record via ajax

    Will call validate() if defined for this record

    If successful, updates this record's id and other properties
    by calling `deserialize()` with the data returned.
  */
  save: function() {
    var self = this,
        isNew = (this.get('id') === undefined);

    if (this.validate !== undefined) {
      var error = this.validate();
      if (error) {
        return {
          fail: function(f) { f(error); return this; },
          done: function() { return this; },
          always: function(f) { f(); return this; }
        };
      }
    }

    return jQuery.ajax({
      url: this._url(),
      data: this.serialize(),
      dataType: 'json',
      type: (isNew ? 'POST' : 'PUT')
    }).done( function(json) {
      // Update properties
      if (json)
        self.deserialize(json);
    });
  },

  /**
    Delete resource via ajax
  */
  destroy: function() {
    var self = this;

    return jQuery.ajax({
      url: this._url(),
      dataType: 'json',
      type: 'DELETE'
    });
  },

  /**
    @private

    The URL for this resource, based on `url` and `id` (which will be
    undefined for new resources).
  */
  _url: function() {
    var url = this.url,
        id = this.get('id');

    if (id !== undefined)
      url += '/' + id;

    return url;
  }
});

/**
  A controller for RESTful resources

  Extend this class and define the following:

  * `type` -- an Ember.Resource class; the class must have a `serialize` method that
       returns a JSON representation of the object
  * `url` -- (optional) the base url of the resource (e.g. '/contacts/active');
       will default to the `url` for `type`
*/
Ember.ResourceController = Ember.ArrayController.extend({
  type:     Ember.required(),
  content:  [],

  /**
    Create and load a single `Ember.Resource` from JSON
  */
  load: function(json) {
    var resource = this.get('type').create().deserialize(json);
    this.pushObject(resource);
  },

  /**
    Create and load `Ember.Resource` objects from a JSON array
  */
  loadAll: function(json) {
    for (var i=0; i < json.length; i++)
      this.load(json[i]);
  },

  /**
    Replace this controller's contents with an ajax call to `url`
  */
  findAll: function() {
    var self = this;

    return jQuery.ajax({
      url: this._url(),
      dataType: 'json',
      type: 'GET'
    }).done( function(json) {
      self.set("content", []);
      self.loadAll(json);
    });
  },

  /**
    @private

    Base URL for ajax calls

    Will use the `url` set for this controller, or if that's missing,
    the `url` specified for `type`.
  */
  _url: function() {
    if (this.url === undefined)
      return this.get('type').prototype.url;
    else
      return this.url;
  }
});
