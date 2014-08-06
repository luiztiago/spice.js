describe("#route", function() {
  it("sets many routes at once", function() {
    E.route({a: 1, b: 2, c: 3});

    assert.deepEqual(E.route.map, [
      {regex: {}, keys: ["path"], callback: 1},
      {regex: {}, keys: ["path"], callback: 2},
      {regex: {}, keys: ["path"], callback: 3} ]);
  });

  it("matches a route", function() {
    assertRoute("/home", "/home");
    assertRoute("/items/{item}", "/items/debby");
    assertRoute("/items/{item}", "#/items/debby");
    assertRoute("/items/{item}", "#!/items/debby");
    assertRoute("*/items", "/hi/items");
    assertRoute("*/items", "/some/regex/items");
    assertRoute("*/items", "/items");
  });

  it("setts and alias route", function(){
    var count = 0, fn = function(){ count++ };
    E.route({
      "/my_route": fn,
      "/alias_route": "/my_route"
    }).on("visit", fn);

    E.route("/alias_route") && assert.equal(count, 2);
  });

  it("works with generic routes", function() {
    var count = 0;
    E.route(function(){ count++ });
    E.route(function(){ count++ });
    E.route(function(){ count++ });

    E.route("/any_randow_route") && assert.equal(count, 3);
    E.route("/other_randow_route") && assert.equal(count, 6);
  });

  it("triggers the same route only once", function(){
    var count = 0;
    E.route.clear()(function(){ count++ });

    E.route("/somewhere") && assert.equal(count, 1);
    E.route("/somewhere") && assert.equal(count, 1);
    E.route("/somewhere") && assert.equal(count, 1);
    E.route("/other") && assert.equal(count, 2);
    E.route("/other") && assert.equal(count, 2);
  });

  it("triggers all routes that matches the path", function() {
    var count = 0, fn = function(){ count++ };
    E.route.clear();
    E.route(fn); E.route({"/my*": fn, "/my/way": fn, "*": fn});

    E.route("/my/way");
    assert.equal(count, 4);
  });

  it("updates the current route", function() {
    var current;
    E.route(function(params){ current = params.path; });
    E.route("/items");

    E.route.update("?search=eden");
    assert.equal(current, "/items?search=eden");

    E.route.update("?search=pool");
    assert.equal(current, "/items?search=pool");

    E.route.update("&id=1");
    assert.equal(current, "/items?search=pool&id=1");

    E.route.update("#hash");
    assert.equal(current, "/items?search=pool&id=1#hash");

    E.route.update("#hash2");
    assert.equal(current, "/items?search=pool&id=1#hash2");

    E.route.update("&id=2");
    assert.equal(current, "/items?search=pool&id=2");
  });

  it("updates the route silently", function() {
    var current;
    E.route(function(params){ current = params.path; });
    E.route("/items");

    E.route.update("/other_path", false);
    assert.equal(current, "/items");
  });

  it("matches the params", function() {
    assertRoute("/items?search={q}", "/items?search=hi",
      {path: "/items?search=hi", q: "hi"});

    assertRoute("/items/{item}/{id}", "/items/debby/2",
      {path: "/items/debby/2", item: "debby", id: "2"});

    assertRoute("/my/*/{item}/{id}", "/my/crazy/cart/2",
      {path: "/my/crazy/cart/2", item: "cart", id: "2"});
  });

  function assertUpdate(update, expected) {
  }

  function assertRoute(route, path, params) {
    var received = false;

    E.route.clear()(route, function(p) {
      received = true
      params && assert.deepEqual(p, params)
    });

    E.route(path);
    assert(received, "Invalid route to => " + path);
  }
});
