var c = require("constants");

// Update functions
function updateAsync(key, interval, saver, loader) {
    if (typeof key === "object") {
        interval = key.interval;
        saver = key.saver;
        loader = key.loader;
        key = key.key;
    } else if (typeof saver !== "function") {
        console.log("No saver function provided!");
        return null;
    }

    if (Memory.asyncData == undefined) Memory.asyncData = {};
    var asyncData = Memory.asyncData;

    if (asyncData[key] == undefined) asyncData[key] = { cooldown: 0 };

    if (asyncData[key].cooldown < 1) {
        asyncData[key].data = saver();
        asyncData[key].cooldown = interval;
    } else {
        asyncData[key].cooldown -= 1;
    }

    if (typeof loader === "function") {
        return loader(asyncData[key].data);
    } else {
        return asyncData[key].data;
    }
}

// Data functions
var spawnIDs = function () {
    var spawns = _.filter(Game.spawns, (spawn) => spawn.my);
    return _.map(spawns, (spawn) => spawn.id);
};

var energySources = function () {
    _.each(Game.rooms, function(room) {
        // Create and load room memory
        if (Memory.rooms[room.name] == undefined) { Memory.rooms[room.name] = {} }
        var roomMem = Memory.rooms[room.name];

        // Populate the sources (free spots and creep list)
        if (roomMem.sources == undefined) { roomMem.sources = {}; }
        var sources = room.find(FIND_SOURCES);
        for (var source in sources) {
            source = sources[source];

            // Create and load source memory
            if (Memory.rooms[room.name].sources[source.id] == undefined) { Memory.rooms[room.name].sources[source.id] = {} }
            var sourceMem = Memory.rooms[room.name].sources[source.id];

            // Create creeps list
            if (sourceMem.creeps == undefined) {
                sourceMem.creeps = {};
            }

            // Calculate free spaces around energy source
            var free_spots = 8;
            for (var direction in c.DIRECTIONS) {
                direction = c.DIRECTIONS[direction];
                var terrain = Game.map.getTerrainAt(source.pos.x + direction[0], source.pos.y + direction[1], room.name);
                if (terrain == "wall")
                    free_spots = free_spots - 1;
            }
            sourceMem.spots = free_spots;

            // Calculate total work parts required
            /// Formula restructured from this: c / ( 2 * n ) = 300
            /// Where c equals the capacity and n the amount of work parts. 300 is the time in ticks until replenishment
            sourceMem.workParts = source.energyCapacity / 600;
        }
    });
}


// Loaders
var loadByID = function (ids) {
    return _.without(
        _.map(ids, (id) => Game.getObjectById(id)), // Resolve IDs to actual objects
        null // Strip null objects
    );
};

module.exports = {
    update: updateAsync,
    data: {
        SPAWNS: {
            key: "spawns",
            interval: c.updateInterval.SPAWNS,
            saver: spawnIDs,
            loader: loadByID
        },
        SOURCES: {
            key: "spawns",
            interval: c.updateInterval.SOURCES,
            saver: energySources
        },
    },
};