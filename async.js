var c = require("constants");

function updateAsync(key, interval, saver, loader) {
    if (typeof saver !== "function") {
        console.log(c.ERR_PREFIX + "No saver function provided!");
        return null;
    }

    if (Memory.asyncData == undefined) Memory.asyncData = {};
    var asyncData = Memory.asyncData;

    if (asyncData[key] == undefined) asyncData[key] = { cooldown: 0 };

    if (asyncData[key].cooldown == 0) {
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

var mySpawnIDs = function () {
    console.log("Updating spawns!");
    var mySpawns = _.filter(Game.spawns, (spawn) => spawn.my);
    return _.map(mySpawns, (spawn) => spawn.id);
};

var loadByID = function (ids) {
    return _.without(
        _.map(ids, (id) => Game.getObjectById(id)), // Resolve IDs to actual objects
        null // Strip null objects
    );
};

module.exports = {
    update: updateAsync,
    data: {
        mySpawns: mySpawnIDs
    },
    loader: {
        byID: loadByID
    }
};