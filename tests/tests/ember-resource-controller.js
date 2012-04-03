var contactsController = null,
    server = null;

module("Ember.ResourceController", {
  setup: function() {
    contactsController = Ember.ResourceController.create({
      resourceType: Contact
    });

    server = sinon.fakeServer.create();
  },

  teardown: function() {
    contactsController.destroy();
    server.restore();
  }
});

test("should use the resourceUrl from its corresponding resource", function() {
  equal(contactsController._resourceUrl(), "/contacts");
});

test("should use the resourceUrl from a corresponding resource which has not yet been instantiated", function() {
  contactsController.set("resourceType", Ember.Resource.extend({resourceUrl: '/people'}));
  equal(contactsController._resourceUrl(), "/people");
});

test("should be able to override resourceUrl", function() {
  contactsController.set("resourceUrl", "/contacts/active");
  equal(contactsController._resourceUrl(), "/contacts/active");
});

test("should load a single resource from json", function() {
  equal(contactsController.content.length, 0, "no resources loaded yet");

  contactsController.load({id: 1, first_name: "Joe", last_name: "Blow"});

  equal(contactsController.content.length, 1, "resource loaded");
});

test("should load an array of resources from json", function() {
  equal(contactsController.content.length, 0, "no resources loaded yet");

  contactsController.loadAll([{id: 1, first_name: "Joe", last_name: "Blow"},
                              {id: 2, first_name: "Jane", last_name: "Doe"}]);

  equal(contactsController.content.length, 2, "resources loaded");
});

test("should be able to clear resources", function() {
  equal(contactsController.content.length, 0, "no resources loaded yet");

  contactsController.loadAll([{id: 1, first_name: "Joe", last_name: "Blow"},
                              {id: 2, first_name: "Jane", last_name: "Doe"}]);

  equal(contactsController.content.length, 2, "resources loaded");

  contactsController.clearAll();

  equal(contactsController.content.length, 0, "no resources loaded");
});

test("should find resources via ajax", function() {
  server.respondWith("GET", "/contacts",
                     [200,
                      { "Content-Type": "application/json" },
                      '[{ "id": 1, "first_name": "Joe", "last_name": "Blow" },' +
                       '{ "id": 2, "first_name": "Jane", "last_name": "Doe" }]']);

  equal(contactsController.content.length, 0, "no resources loaded yet");

  contactsController.findAll()
    .done(function() { ok(true,  "findAll() done"); })
    .fail(function() { ok(false, "findAll() fail"); });

  server.respond();

  equal(contactsController.content.length, 2, "resources loaded");
});
