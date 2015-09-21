var testUtils = require('../util/testUtils');
var assert = testUtils.assert;
var assertOwnProperty = testUtils.assertOwnProperty;
var NetSimTestUtils = require('../util/netsimTestUtils');
var fakeShard = NetSimTestUtils.fakeShard;
var assertTableSize = NetSimTestUtils.assertTableSize;

var NetSimWire = require('@cdo/apps/netsim/NetSimWire');

describe("NetSimWire", function () {
  var testShard, wireTable;

  beforeEach(function () {
    testShard = fakeShard();
    wireTable = testShard.wireTable;
  });

  it("uses the wire table", function () {
    var wire = new NetSimWire(testShard);
    assert(wire.getTable() === testShard.wireTable);
  });

  it("has expected row structure and default values", function () {
    var wire = new NetSimWire(testShard);
    var row = wire.buildRow();

    assertOwnProperty(row, 'localNodeID');
    assert.equal(row.localNodeID, undefined);

    assertOwnProperty(row, 'remoteNodeID');
    assert.equal(row.remoteNodeID, undefined);

    assertOwnProperty(row, 'localAddress');
    assert.equal(row.localAddress, undefined);

    assertOwnProperty(row, 'remoteAddress');
    assert.equal(row.remoteAddress, undefined);

    assertOwnProperty(row, 'localHostname');
    assert.equal(row.localHostname, undefined);

    assertOwnProperty(row, 'remoteHostname');
    assert.equal(row.remoteHostname, undefined);
  });

  describe("static method create", function () {
    it("adds an entry to the wire table", function () {
      assertTableSize(testShard, 'wireTable', 0);

      NetSimWire.create(testShard, {
        localNodeID: 0,
        remoteNodeID: 0
      }, function () {});

      assertTableSize(testShard, 'wireTable', 1);
    });

    it("immediately initializes entry with endpoints", function () {
      NetSimWire.create(testShard, {
        localNodeID: 1,
        remoteNodeID: 2
      }, function () {});

      wireTable.refresh(function (err, rows) {
        assert.equal(rows[0].localNodeID, 1);
        assert.equal(rows[0].remoteNodeID, 2);
      });
    });

    it("Returns a NetSimWire to its callback", function () {
      NetSimWire.create(testShard, {
        localNodeID: 0,
        remoteNodeID: 0
      }, function (err, result) {
        assert(result instanceof NetSimWire, "Result is a NetSimWire");
      });
    });
  });

  it("can be instatiated from remote row", function () {
    var testRow;

    // Create a wire row in remote table
    wireTable.create({
      localNodeID: 1,
      remoteNodeID: 2,
      localAddress: 3,
      remoteAddress: 4,
      localHostname: 'me',
      remoteHostname: 'you'
    }, function (err, row) {
      testRow = row;
    });
    assert(testRow !== undefined, "Failed to create test row");

    // Instantiate wire
    var wire = new NetSimWire(testShard, testRow);
    assert.equal(wire.localNodeID, 1);
    assert.equal(wire.remoteNodeID, 2);
    assert.equal(wire.localAddress, 3);
    assert.equal(wire.remoteAddress, 4);
    assert.equal(wire.localHostname, 'me');
    assert.equal(wire.remoteHostname, 'you');
  });

  it("can be removed from the remote table with destroy()", function () {
    var testRow;

    // Create a wire row in remote table
    wireTable.create({}, function (err, row) {
      testRow = row;
    });
    assert(testRow !== undefined, "Failed to create test row");

    // Call destroy()
    var wire = new NetSimWire(testShard, testRow);
    wire.destroy();

    // Verify that wire is gone from the remote table.
    assertTableSize(testShard, 'wireTable', 0);
  });

});
