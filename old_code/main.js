var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleTransporter = require('role.transporter');
var roleDead = require('role.dead');
var roleRepair = require('role.repair');
var helpers = require('helpers');

var stats_every = 2; // Ticks

var SPAWN_NAME = "TheMegaTB";

var spawnPermissionHarvestersRequired = function() {
    return Object.keys(_.filter(Game.creeps, (creep) => creep.memory.role == "harvester")).length > 0;
};

var spawnPermissionBuilderRequired = function() {
    return Object.keys(_.filter(Game.creeps, (creep) => creep.memory.role == "builder")).length > 0;
};

var creepTypes = {
    Harvester: {
        limit: 1,
        priority: 0,
        role: "harvester",
        body: [WORK, WORK, CARRY],
        tick: roleHarvester
    },
    Transporter: {
        limit: 1,
        priority: 1,
        role: "transporter",
        body: [CARRY, CARRY, CARRY, MOVE],
        tick: roleTransporter,
        spawnPermission: function() {
            return spawnPermissionHarvestersRequired && Object.keys(Game.spawns[SPAWN_NAME].room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER }})).length > 0;
        }
    },
    Upgrader: {
        limit: 7,
        priority: 2,
        role: "upgrader",
        body: [WORK, WORK, CARRY, MOVE],
        tick: roleUpgrader,
        spawnPermission: spawnPermissionHarvestersRequired
    },
    Builder: {
        llimit: 1,
        ulimit: 4,
        priority: 3,
        role: "builder",
        body: [WORK, WORK, CARRY],
        tick: roleBuilder,
        spawnPermission: spawnPermissionHarvestersRequired
    },
    RepairBot: {
        limit: 2,
        priority: 4,
        role: "repair",
        body: [WORK, CARRY, MOVE],
        tick: roleRepair,
        spawnPermission: spawnPermissionBuilderRequired
    },
    Ghost: {
        role: "dead",
        tick: roleDead,
        spawnPermission: function() { return false }
    }
}


function init() {

    // if (Memory.creepTypes == undefined) { Memory.creepTypes = {}; }
    if (Memory.rooms == undefined) { Memory.rooms = {}; }

    // TODO: Do this per-spawn (only own spawns)
    var mySpawns = _.filter(Game.spawns, (spawn) => spawn.my);

    for (var spawn in mySpawns) {
        var spawn = mySpawns[spawn];
        var room = spawn.room;

        // Create and load room memory
        if (Memory.rooms[room.name] == undefined) { Memory.rooms[room.name] = {} }
        var room_mem = Memory.rooms[room.name];

        // Populate the sources (free spots and empty creep list)
        if (room_mem.sources == undefined) { room_mem.sources = {}; }
        var sources = room.find(FIND_SOURCES);
        for (var source in sources) {
            var source = sources[source];

            // Create and load source memory
            if (Memory.rooms[room.name].sources[source.id] == undefined) { Memory.rooms[room.name].sources[source.id] = {} }
            var source_mem = Memory.rooms[room.name].sources[source.id];

            if (source_mem.creeps == undefined) {
                source_mem.creeps = {};
            }

            // Calculate free spaces for creeps to work
            var directions = [ [-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
            var free_spots = 8;
            for (var direction in directions) {
                var direction = directions[direction];
                var terrain = Game.map.getTerrainAt(source.pos.x + direction[0], source.pos.y + direction[1], room.name);
                if (terrain == "wall") {
                    free_spots = free_spots - 1;
                }
            }
            source_mem.spots = free_spots;

            if (source_mem.creeps == undefined) { source_mem.creeps = {} }
        }
    }

    var harvesters = 0;
    for (var room in Memory.rooms) {
        var room = Memory.rooms[room];
        for (var source in room.sources) {
            harvesters = harvesters + room.sources[source].spots;
        }
    }
    creepTypes["Harvester"].limit = harvesters;
    // console.log(harvesters);
    // TODO: Functions are missing...
    // Memory.creepTypes = creepTypes;
}

init();

var tick_count = 0;

function defendRoom(roomName) {
    
    var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
    
    if(hostiles.length > 0) {
        var username = hostiles[0].owner.username;
        // Game.notify(`User ${username} spotted in room ${roomName}`);
        var towers = Game.rooms[roomName].find(
            FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        towers.forEach(tower => tower.attack(hostiles[0]));
    }
}

module.exports.loop = function () {

    // if (!Memory.initialized) {
    //     init();
    //     Memory.initialized = true;
    // }

    var myCreeps = _.filter(Game.creeps, (creep) => creep.my); var population_size = Object.keys(myCreeps).length;
    var mySpawns = _.filter(Game.spawns, (spawn) => spawn.my);

    // Delete memory of dead creeps
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            var creep = Memory.creeps[name];
            if (creep.role == "harvester") {
                var source = creep.source;
                if (creep.source != null) {
                    console.log(name);
                    delete Memory.rooms[Game.getObjectById(source).room.name].sources[source].creeps[name];
                }
            }
            delete Memory.creeps[name];
        }
    }

    if (tick_count >= stats_every) { console.log("Current population size: " + population_size); }

    // Dynamic allocation of creep roles
    var calculateRoleLimit = function (structure, filter) {
        var limit = 0;
        for (var spawn in mySpawns) {
            limit = limit + Object.keys(mySpawns[spawn].room.find(structure, filter)).length;
        }
        return limit;
    }

    creepTypes["Builder"].limit = Math.max(creepTypes["Builder"].llimit, calculateRoleLimit(FIND_CONSTRUCTION_SITES));
    if (creepTypes["Builder"].limit > creepTypes["Builder"].ulimit) { creepTypes["Builder"].limit = creepTypes["Builder"].ulimit }
    creepTypes["Transporter"].limit = 2 * calculateRoleLimit(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } });

    var spawnPoint = mySpawns[0];
    var current = {
        body: [],
        name: undefined,
        type: { priority: 99999 }
    };
    for (var type_name in creepTypes) {
        var type = creepTypes[type_name];
        var instances = _.filter(myCreeps, (creep) => creep.memory.role == type.role);
        var instances_count = Object.keys(instances).length;

        // Record the population size
        if (tick_count >= stats_every && type_name != "Ghost") { console.log("(" + instances_count + " / " + type.limit + ") " + type_name); }

        // Spawn or recycle some instances
        var spawnPermission = true;
        if (typeof type.spawnPermission === "function") {
            spawnPermission = type.spawnPermission();
        }
        var body = helpers.generateBody(type.body, spawnPoint.room.energyAvailable); //room.energyCapacityAvailable
        var bodyEnergyRequired = helpers.calculateCost(body);
        if (spawnPermission && instances_count < type.limit && spawnPoint.room.energyAvailable >= bodyEnergyRequired && type.priority < current.type.priority) {
            current = {
                body: body,
                name: type_name,
                type: type
            };
        } else if (instances_count > type.limit) {
            var instance = instances[instances_count - 1];
            instance.memory.role = "dead"
        }

        // Iterate through instances and execute their functions
        for (var instance in instances) {
            var instance = instances[instance];
            type.tick(instance);
        }
    }
    // Spawn the creep w/ the highest priority
    if (current.name) {
        // if (current.type.role == "harvester") { current.body = [WORK, CARRY, MOVE]; }
        spawnPoint.createCreep(current.body, helpers.generateName(current.name), {"role": current.type.role});
    }

    for (var room in Memory.rooms) {
        defendRoom(room);
    }


    if (tick_count >= stats_every) { tick_count = 0; console.log("---------------------------"); } else { tick_count++ }
}
