/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
'use strict';

var utils = require('../utils');
var _ = utils.getLodash();
var netsimConstants = require('./netsimConstants');
var DnsMode = netsimConstants.DnsMode;
var BITS_PER_BYTE = netsimConstants.BITS_PER_BYTE;
var BITS_PER_NIBBLE = netsimConstants.BITS_PER_NIBBLE;
var NetSimNode = require('./NetSimNode');
var NetSimEntity = require('./NetSimEntity');
var NetSimLogEntry = require('./NetSimLogEntry');
var NetSimLogger = require('./NetSimLogger');
var NetSimWire = require('./NetSimWire');
var NetSimMessage = require('./NetSimMessage');
var NetSimHeartbeat = require('./NetSimHeartbeat');
var ObservableEvent = require('../ObservableEvent');
var PacketEncoder = require('./PacketEncoder');
var dataConverters = require('./dataConverters');
var intToBinary = dataConverters.intToBinary;
var asciiToBinary = dataConverters.asciiToBinary;

var logger = NetSimLogger.getSingleton();

/**
 * @type {number}
 * @readonly
 */
var MAX_CLIENT_CONNECTIONS = 6;

/**
 * Conveniently, a router's address in its local network is always zero.
 * @type {number}
 * @readonly
 */
var ROUTER_LOCAL_ADDRESS = 0;

/**
 * Client model of simulated router
 *
 * Represents the client's view of a given router, provides methods for
 *   letting the client interact with the router, and wraps the client's
 *   work doing part of the router simulation.
 *
 * A router -exists- when it has a row in the lobby table of type 'router'
 * A router is connected to a user when a 'user' row exists in the lobby
 *   table that has a status 'Connected to {router ID} by wires {X, Y}'.
 * A router will also share a wire (simplex) or wires (duplex) with each user,
 *   which appear in the wire table.
 *
 * @param {!NetSimShard} shard
 * @param {Object} [routerRow] - Lobby row for this router.
 * @constructor
 * @augments NetSimNode
 */
var NetSimRouterNode = module.exports = function (shard, row) {
  row = row !== undefined ? row : {};
  NetSimNode.call(this, shard, row);

  /**
   * Sets current DNS mode for the router's local network.
   * This value is manipulated by all clients.
   * @type {DnsMode}
   * @private
   */
  this.dnsMode = row.dnsMode !== undefined ?
      row.dnsMode : DnsMode.NONE;

  /**
   * Sets current DNS node ID for the router's local network.
   * This value is manipulated by all clients.
   * @type {number}
   * @private
   */
  this.dnsNodeID = row.dnsNodeID;

  /**
   * Determines a subset of connection and message events that this
   * router will respond to, only managing events from the given node ID,
   * to avoid conflicting with other clients also simulating this router.
   *
   * Not persisted on server.
   *
   * @type {number}
   * @private
   */
  this.simulateForSender_ = undefined;

  /**
   * If ticked, tells the network that this router is being used.
   *
   * Not persisted on server (though the heartbeat does its own persisting)
   *
   * @type {NetSimHeartbeat}
   * @private
   */
  this.heartbeat_ = null;

  /**
   * Local cache of our remote row, used to decide whether our state has
   * changed.
   * 
   * Not persisted to server.
   * 
   * @type {Object}
   * @private
   */
  this.stateCache_ = {};
  
  /**
   * Event others can observe, which we fire when our own remote row changes.
   * 
   * @type {ObservableEvent}
   */
  this.stateChange = new ObservableEvent();

  /**
   * Local cache of wires attached to this router, used for detecting and
   * broadcasting relevant changes.
   *
   * Not persisted on server.
   *
   * @type {Array}
   * @private
   */
  this.myWireRowCache_ = [];

  /**
   * Event others can observe, which we fire when the router's set of wires
   * changes indicating a change in the local network.
   *
   * @type {ObservableEvent}
   */
  this.wiresChange = new ObservableEvent();

  /**
   * Local cache of log rows associated with this router, used for detecting
   * and broadcasting relevant changes.
   * 
   * @type {Array}
   * @private
   */
  this.myLogRowCache_ = [];
  
  /**
   * Event others can observe, which we fire when the router's log content
   * changes.
   * 
   * @type {ObservableEvent}
   */
  this.logChange = new ObservableEvent();
};
NetSimRouterNode.inherits(NetSimNode);

/**
 * Static async creation method. See NetSimEntity.create().
 * @param {!NetSimShard} shard
 * @param {!NodeStyleCallback} onComplete - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimRouterNode.create = function (shard, onComplete) {
  NetSimEntity.create(NetSimRouterNode, shard, function (err, router) {
    if (err !== null) {
      onComplete(err, null);
      return;
    }

    NetSimHeartbeat.getOrCreate(shard, router.entityID, function (err, heartbeat) {
      if (err !== null) {
        onComplete(err, null);
        return;
      }

      // Set router heartbeat to double normal interval, since we expect
      // at least two clients to help keep it alive.
      router.heartbeat_ = heartbeat;
      router.heartbeat_.setBeatInterval(12000);

      // Always try and update router immediately, to set its DisplayName
      // correctly.
      router.update(function (err) {
        onComplete(err, router);
      });
    });
  });
};

/**
 * Static async retrieval method.  See NetSimEntity.get().
 * @param {!number} routerID - The row ID for the entity you'd like to find.
 * @param {!NetSimShard} shard
 * @param {!NodeStyleCallback} onComplete - Method that will be given the
 *        found entity, or null if entity search failed.
 */
NetSimRouterNode.get = function (routerID, shard, onComplete) {
  NetSimEntity.get(NetSimRouterNode, routerID, shard, function (err, router) {
    if (err !== null) {
      onComplete(err, null);
      return;
    }

    NetSimHeartbeat.getOrCreate(shard, routerID, function (err, heartbeat) {
      if (err !== null) {
        onComplete(err, null);
        return;
      }

      // Set router heartbeat to double normal interval, since we expect
      // at least two clients to help keep it alive.
      router.heartbeat_ = heartbeat;
      router.heartbeat_.setBeatInterval(12000);

      onComplete(null, router);
    });
  });
};

/**
 * @readonly
 * @enum {string}
 */
NetSimRouterNode.RouterStatus = {
  INITIALIZING: 'Initializing',
  READY: 'Ready',
  FULL: 'Full'
};
var RouterStatus = NetSimRouterNode.RouterStatus;

/**
 * Build table row for this node.
 * @private
 * @override
 */
NetSimRouterNode.prototype.buildRow_ = function () {
  return utils.extend(
      NetSimRouterNode.superPrototype.buildRow_.call(this),
      {
        dnsMode: this.dnsMode,
        dnsNodeID: this.dnsNodeID
      }
  );
};

/**
 * Ticks heartbeat, telling the network that router is in use.
 * @param {RunLoop.Clock} clock
 */
NetSimRouterNode.prototype.tick = function (clock) {
  this.heartbeat_.tick(clock);
};

/**
 * Updates router status and lastPing time in lobby table - both keepAlive
 * and making sure router's connection count is valid.
 * @param {NodeStyleCallback} [onComplete] - Optional success/failure callback
 */
NetSimRouterNode.prototype.update = function (onComplete) {
  onComplete = onComplete || function () {};

  var self = this;
  this.countConnections(function (err, count) {
    self.status_ = count >= MAX_CLIENT_CONNECTIONS ?
        RouterStatus.FULL : RouterStatus.READY;
    self.statusDetail_ = '(' + count + '/' + MAX_CLIENT_CONNECTIONS + ')';
    NetSimRouterNode.superPrototype.update.call(self, onComplete);
  });
};

/** @inheritdoc */
NetSimRouterNode.prototype.getDisplayName = function () {
  return "Router " + this.entityID;
};

/** @inheritdoc */
NetSimRouterNode.prototype.getNodeType = function () {
  return NetSimRouterNode.getNodeType();
};
NetSimRouterNode.getNodeType = function () {
  return 'router';
};

/**
 * Puts this router controller into a mode where it will only
 * simulate for connection and messages -from- the given node.
 * @param {!number} nodeID
 */
NetSimRouterNode.prototype.initializeSimulation = function (nodeID) {
  this.simulateForSender_ = nodeID;
  if (nodeID !== undefined) {
    var nodeChangeEvent = this.shard_.nodeTable.tableChange;
    var nodeChangeHandler = this.onNodeTableChange_.bind(this);
    this.nodeChangeKey_ = nodeChangeEvent.register(nodeChangeHandler);
    logger.info("Router registered for nodeTable tableChange");
    
    var wireChangeEvent = this.shard_.wireTable.tableChange;
    var wireChangeHandler = this.onWireTableChange_.bind(this);
    this.wireChangeKey_ = wireChangeEvent.register(wireChangeHandler);
    logger.info("Router registered for wireTable tableChange");

    var logChangeEvent = this.shard_.logTable.tableChange;
    var logChangeHandler = this.onLogTableChange_.bind(this);
    this.logChangeKey_ = logChangeEvent.register(logChangeHandler);
    logger.info("Router registered for logTable tableChange");

    var newMessageEvent = this.shard_.messageTable.tableChange;
    var newMessageHandler = this.onMessageTableChange_.bind(this);
    this.newMessageEventKey_ = newMessageEvent.register(newMessageHandler);
    logger.info("Router registered for messageTable tableChange");
  }
};

/**
 * Gives the simulating node a chance to unregister from anything it
 * was observing.
 */
NetSimRouterNode.prototype.stopSimulation = function () {
  if (this.nodeChangeKey_ !== undefined) {
    var nodeChangeEvent = this.shard_.messageTable.tableChange;
    nodeChangeEvent.unregister(this.nodeChangeKey_);
    this.nodeChangeKey_ = undefined;
    logger.info("Router unregistered from nodeTable tableChange");
  }
  
  if (this.wireChangeKey_ !== undefined) {
    var wireChangeEvent = this.shard_.messageTable.tableChange;
    wireChangeEvent.unregister(this.wireChangeKey_);
    this.wireChangeKey_ = undefined;
    logger.info("Router unregistered from wireTable tableChange");
  }

  if (this.logChangeKey_ !== undefined) {
    var logChangeEvent = this.shard_.messageTable.tableChange;
    logChangeEvent.unregister(this.logChangeKey_);
    this.logChangeKey_ = undefined;
    logger.info("Router unregistered from logTable tableChange");
  }

  if (this.newMessageEventKey_ !== undefined) {
    var newMessageEvent = this.shard_.messageTable.tableChange;
    newMessageEvent.unregister(this.newMessageEventKey_);
    this.newMessageEventKey_ = undefined;
    logger.info("Router unregistered from messageTable tableChange");
  }
};

/**
 * Puts the router into the given DNS mode, triggers a remote update,
 * and creates/destroys the network's automatic DNS node.
 * @param {DnsMode} newDnsMode
 */
NetSimRouterNode.prototype.setDnsMode = function (newDnsMode) {
  if (this.dnsMode === newDnsMode) {
    return;
  }

  // TODO (bbuchanan): Handle DNS node management here

  this.dnsMode = newDnsMode;
  this.update();
};

/**
 * Query the wires table and pass the callback a list of wire table rows,
 * where all of the rows are wires attached to this router.
 * @param {NodeStyleCallback} onComplete which accepts an Array of NetSimWire.
 */
NetSimRouterNode.prototype.getConnections = function (onComplete) {
  onComplete = onComplete || function () {};

  var shard = this.shard_;
  var routerID = this.entityID;
  this.shard_.wireTable.readAll(function (err, rows) {
    if (err) {
      onComplete(err, []);
      return;
    }

    var myWires = rows
        .map(function (row) {
          return new NetSimWire(shard, row);
        })
        .filter(function (wire){
          return wire.remoteNodeID === routerID;
        });

    onComplete(null, myWires);
  });
};

/**
 * Query the wires table and pass the callback the total number of wires
 * connected to this router.
 * @param {NodeStyleCallback} onComplete which accepts a number.
 */
NetSimRouterNode.prototype.countConnections = function (onComplete) {
  onComplete = onComplete || function () {};

  this.getConnections(function (err, wires) {
    onComplete(err, wires.length);
  });
};

NetSimRouterNode.prototype.log = function (packet) {
  NetSimLogEntry.create(
      this.shard_,
      this.entityID,
      packet,
      function () {});
};

/**
 * @param {Array} haystack
 * @param {*} needle
 * @returns {boolean} TRUE if needle found in haystack
 */
var contains = function (haystack, needle) {
  return haystack.some(function (element) {
    return element === needle;
  });
};

/**
 * Called when another node establishes a connection to this one, giving this
 * node a chance to reject the connection.
 *
 * The router checks against its connection limit, and rejects the connection
 * if its limit is now exceeded.
 *
 * @param {!NetSimNode} otherNode attempting to connect to this one
 * @param {!NodeStyleCallback} onComplete response method - should call with TRUE
 *        if connection is allowed, FALSE if connection is rejected.
 */
NetSimRouterNode.prototype.acceptConnection = function (otherNode, onComplete) {
  var self = this;
  this.countConnections(function (err, count) {
    if (err) {
      onComplete(err, false);
      return;
    }

    if (count > MAX_CLIENT_CONNECTIONS) {
      onComplete(new Error("Too many connections"), false);
      return;
    }

    // Trigger an update, which will correct our connection count
    self.update(function (err) {
      onComplete(err, err === null);
    });
  });
};

/**
 * Assign a new address for hostname on wire, calling onComplete
 * when done.
 * @param {!NetSimWire} wire that lacks addresses or hostnames
 * @param {string} hostname of requesting node
 * @param {NodeStyleCallback} [onComplete]
 */
NetSimRouterNode.prototype.requestAddress = function (wire, hostname, onComplete) {
  onComplete = onComplete || function () {};

  // General strategy: Create a list of existing remote addresses, pick a
  // new one, and assign it to the provided wire.
  var self = this;
  this.getConnections(function (err, wires) {
    if (err) {
      onComplete(err);
      return;
    }

    var addressList = wires.filter(function (wire) {
      return wire.localAddress !== undefined;
    }).map(function (wire) {
      return wire.localAddress;
    });

    // Find the lowest unused integer address starting at 2
    // Non-optimal, but should be okay since our address list should not exceed 10.
    var newAddress = 1;
    while (contains(addressList, newAddress)) {
      newAddress++;
    }

    wire.localAddress = newAddress;
    wire.localHostname = hostname;
    wire.remoteAddress = ROUTER_LOCAL_ADDRESS;
    wire.remoteHostname = self.getHostname();
    wire.update(onComplete);
    // TODO: Fix possibility of two routers getting addresses by verifying
    //       after updating the wire.
  });
};

/**
 * @returns {Array} A list of remote nodes connected to this router, including
 *          their hostname, address, whether they are the local node, and
 *          whether they are the current DNS node for the network.
 */
NetSimRouterNode.prototype.getAddressTable = function () {
  return this.myWireRowCache_.map(function (row) {
    return {
      hostname: row.localHostname,
      address: row.localAddress,
      isLocal: (row.localNodeID === this.simulateForSender_),
      isDnsNode: (row.localNodeID === this.dnsNodeID)
    };
  }.bind(this));
};

/**
 * When the node table changes, we check whether our own row has changed
 * and propagate those changes as appropriate.
 * @param rows
 * @private
 * @throws
 */
NetSimRouterNode.prototype.onNodeTableChange_ = function (rows) {
  var myRow = _.find(rows, function (row) {
    return row.id === this.entityID;
  }.bind(this));

  if (myRow === undefined) {
    throw new Error("Unable to find router node in node table listing.");
  }

  if (!_.isEqual(this.stateCache_, myRow)) {
    this.stateCache_ = myRow;
    logger.info("Router state changed.");
    this.onMyStateChange_(myRow);
  }
};

NetSimRouterNode.prototype.onMyStateChange_ = function (remoteRow) {
  this.dnsMode = remoteRow.dnsMode;
  this.dnsNodeID = remoteRow.dnsNodeID;
  this.stateChange.notifyObservers(this);
};

/**
 * When the wires table changes, we may have a new connection or have lost
 * a connection.  Propagate updates about our connections
 * @param rows
 * @private
 */
NetSimRouterNode.prototype.onWireTableChange_ = function (rows) {
  var myWireRows = rows.filter(function (row) {
    return row.remoteNodeID === this.entityID;
  }.bind(this));

  if (!_.isEqual(this.myWireRowCache_, myWireRows)) {
    this.myWireRowCache_ = myWireRows;
    this.wiresChange.notifyObservers();
  }
};

/**
 * When the logs table changes, we may have a new connection or have lost
 * a connection.  Propagate updates about our connections
 * @param rows
 * @private
 */
NetSimRouterNode.prototype.onLogTableChange_ = function (rows) {
  var myLogRows = rows.filter(function (row) {
    return row.nodeID === this.entityID;
  }.bind(this));

  if (!_.isEqual(this.myLogRowCache_, myLogRows)) {
    this.myLogRowCache_ = myLogRows;
    logger.info("Router logs changed.");
    this.logChange.notifyObservers();
  }
};

NetSimRouterNode.prototype.getLog = function () {
  return this.myLogRowCache_.map(function (row) {
    return new NetSimLogEntry(this.shard_, row);
  }.bind(this));
};

/**
 * When the message table changes, we might have a new message to handle.
 * Check for and handle unhandled messages.
 * @param rows
 * @private
 */
NetSimRouterNode.prototype.onMessageTableChange_ = function (rows) {
  if (!this.simulateForSender_) {
    // Not configured to handle anything yet; don't process messages.
    return;
  }

  if (this.isProcessingMessages_) {
    // We're already in this method, getting called recursively because
    // we are making changes to the table.  Ignore this call.
    return;
  }

  var messages = rows
      .map(function (row) {
        return new NetSimMessage(this.shard_, row);
      }.bind(this))
      .filter(function (message) {
        return message.fromNodeID === this.simulateForSender_ &&
            message.toNodeID === this.entityID;
      }.bind(this));

  if (messages.length === 0) {
    // No messages for us, no work to do.
    return;
  }

  // Setup (sync): Set processing flag
  logger.info("Router received " + messages.length + " messages");
  this.isProcessingMessages_ = true;

  // Step 1 (async): Pull all our messages out of storage.
  NetSimEntity.destroyEntities(messages, function (err) {
    if (err) {
      logger.error("Error pulling message off the wire for routing; " + err.message);
      this.isProcessingMessages_ = false;
      return;
    }

    // Step 2 (async): Get our connection info, which we will need for routing
    this.getConnections(function (err, wires) {
      if (err) {
        logger.error("Error retrieving router connection info");
        this.isProcessingMessages_ = false;
        return;
      }

      // Step 3 (async): Route all messages to destinations
      this.routeMessages_(messages, wires, function () {
        // Cleanup (sync): Clear "processing" flag
        logger.info("Router finished processing " + messages.length + " messages");
        this.isProcessingMessages_ = false;
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

/**
 * Routes all messages (to remote storage) asynchronously, and calls
 * onComplete when all messages have been routed and/or an error occurs.
 * @param {NetSimMessage[]} messages
 * @param {Array.<NetSimWire>} myWires
 * @param {!NodeStyleCallback} onComplete
 */
NetSimRouterNode.prototype.routeMessages_ = function (messages, myWires, onComplete) {
  if (messages.length === 0) {
    onComplete(null);
    return;
  }

  this.routeMessage_(messages[0], myWires, function (err, result) {
    if (err) {
      onComplete(err, result);
      return;
    }

    this.routeMessages_(messages.slice(1), myWires, onComplete);
  }.bind(this));
};

/**
 * Read the given message to find its destination address, try and map that
 * address to one of our connections, and send the message payload to
 * the new address.
 *
 * @param {NetSimMessage} message
 * @param {Array.<NetSimWire>} myWires
 * @param {!NodeStyleCallback} onComplete
 * @private
 */
NetSimRouterNode.prototype.routeMessage_ = function (message, myWires, onComplete) {
  var toAddress;

  // Find a connection to route this message to.
  try {
    toAddress = dataConverters.binaryToInt(
        PacketEncoder.defaultPacketEncoder.getField('toAddress', message.payload));
  } catch (error) {
    this.log(message.payload);
    onComplete(new Error("Packet not readable by router"));
    return;
  }

  // Automatic DNS: requests to address zero hit the "automatic DNS" system
  // and generate responses.
  // TODO (bbuchanan): Send to a real auto-dns node
  if (this.dnsMode === DnsMode.AUTOMATIC && toAddress === ROUTER_LOCAL_ADDRESS) {
    this.generateDnsResponse_(message, myWires);
    onComplete(null);
    return;
  }

  var destWires = myWires.filter(function (wire) {
    return wire.localAddress === toAddress;
  });
  if (destWires.length === 0) {
    this.log(message.payload);
    onComplete(new Error("Destination address not in local network"));
    return;
  }

  // TODO: Handle bad state where more than one wire matches dest address?

  var destWire = destWires[0];

  // Create a new message with a new payload.
  NetSimMessage.send(
      this.shard_,
      destWire.remoteNodeID,
      destWire.localNodeID,
      message.payload,
      function (err, result) {
        this.log(message.payload);
        onComplete(err, result);
      }.bind(this)
  );
};

/**
 * @param {NetSimMessage} message
 * @param {NetSimWire[]} myWires
 * @private
 */
NetSimRouterNode.prototype.generateDnsResponse_ = function (message, myWires) {
  var fromAddress, query;

  // Extract message contents
  try {
    fromAddress = dataConverters.binaryToInt(
        PacketEncoder.defaultPacketEncoder.getField('fromAddress', message.payload));
    query = dataConverters.binaryToAscii(
        PacketEncoder.defaultPacketEncoder.getField('message', message.payload),
        BITS_PER_BYTE);
  } catch (error) {
    // Malformed packet, ignore
    return;
  }

  // Check that the query is well-formed
  // Regex match "GET [hostnames...]"
  // Then below, we'll split the hostnames on whitespace to process them.
  var requestMatch = query.match(/GET\s+(\S.*)/);
  if (requestMatch === null) {
    // Malformed request, send back directions
    NetSimMessage.send(
        this.shard_,
        ROUTER_LOCAL_ADDRESS,
        fromAddress,
        PacketEncoder.defaultPacketEncoder.createBinary({
          fromAddress: intToBinary(ROUTER_LOCAL_ADDRESS, BITS_PER_NIBBLE),
          toAddress: intToBinary(fromAddress, BITS_PER_NIBBLE),
          packetIndex: intToBinary(1, BITS_PER_NIBBLE),
          packetCount: intToBinary(1, BITS_PER_NIBBLE),
          message: asciiToBinary("Automatic DNS Node" +
              "\nUsage: GET hostname [hostname [hostname ...]]", BITS_PER_BYTE)
        }),
        function() {}
    );
    return;
  }

  // Good request, look up all addresses and build up response
  // Skipping first match, which is the full regex
  var responses = requestMatch[1].split(/\s+/).map(function (queryHostname) {
    var wire = _.find(myWires, function (wire) {
      return wire.localHostname === queryHostname;
    });

    return queryHostname + ':' + (wire ? wire.localAddress : 'NOT_FOUND');
  });

  NetSimMessage.send(
      this.shard_,
      ROUTER_LOCAL_ADDRESS,
      fromAddress,
      PacketEncoder.defaultPacketEncoder.createBinary({
        fromAddress: intToBinary(ROUTER_LOCAL_ADDRESS, BITS_PER_NIBBLE),
        toAddress: intToBinary(fromAddress, BITS_PER_NIBBLE),
        packetIndex: intToBinary(1, BITS_PER_NIBBLE),
        packetCount: intToBinary(1, BITS_PER_NIBBLE),
        message: asciiToBinary(responses.join(' '), BITS_PER_BYTE)
      }),
      function() {}
  );
};
