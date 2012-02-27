var server = null;

module("Ember.Resource", {
  setup: function() {
    server = sinon.fakeServer.create();
  },

  teardown: function() {
    server.restore();
  }
});

test("should serialize its properties to JSON", function() {
  var props = {"id": 1, "first_name": "Joe", "last_name": "Blow"};

  var contact = Contact.create(props);
  var serialized  = contact.serialize();

  equal(serialized.contact.first_name, props.first_name, "first_name matches");
  equal(serialized.contact.last_name,  props.last_name,  "last_name matches");
});

test("should deserialize its properties to JSON", function() {
  var props = {"id": 1, "first_name": "Joe", "last_name": "Blow"};

  var contact = Contact.create();
  contact.deserialize(props);

  equal(contact.get("id"),         props.id,         "id matches");
  equal(contact.get("first_name"), props.first_name, "first_name matches");
  equal(contact.get("last_name"),  props.last_name,  "last_name matches");
});

test("should find a resource via ajax", function() {
  server.respondWith("GET", "/contacts/1",
                     [200,
                      { "Content-Type": "application/json" },
                      '{ "id": 1, "first_name": "Joe", "last_name": "Blow" }']);

  var contact = Contact.create({id: 1});
  contact.findResource()
    .done(function() { ok(true,  "findResource() done"); })
    .fail(function() { ok(false, "findResource() fail"); });

  server.respond();

  equal(contact.get("fullName"), "Joe Blow", "resource deserialized");
});

test("should create a resource via ajax", function() {
  server.respondWith("POST", "/contacts",
                     [200,
                      { "Content-Type": "application/json" },
                      '{ "id": 1, "first_name": "Joe", "last_name": "Blow" }']);

  var contact = Contact.create({first_name: "Joe", last_name: "Blow"});
  contact.saveResource()
    .done(function() { ok(true,  "saveResource() done"); })
    .fail(function() { ok(false, "saveResource() fail"); });

  server.respond();

  equal(contact.get("id"),       1,          "resource created");
  equal(contact.get("fullName"), "Joe Blow", "resource deserialized");
});

test("should update a resource via ajax", function() {
  server.respondWith("PUT", "/contacts/1",
                     [200,
                      { "Content-Type": "application/json" },
                      '']);

  var contact = Contact.create({id: 1, first_name: "Joe", last_name: "Blow"});
  contact.saveResource()
    .done(function() { ok(true,  "saveResource() done"); })
    .fail(function() { ok(false, "saveResource() fail"); });

  server.respond();
});

test("should delete a resource via ajax", function() {
  server.respondWith("DELETE", "/contacts/1",
                     [200,
                      { "Content-Type": "application/json" },
                      '']);

  var contact = Contact.create({id: 1, first_name: "Joe", last_name: "Blow"});
  contact.destroyResource()
    .done(function() { ok(true,  "destroyResource() done"); })
    .fail(function() { ok(false, "destroyResource() fail"); });

  server.respond();
});

