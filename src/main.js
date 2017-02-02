"use strict";

var async = require("async"),
    Bot = require("bot"),
    harv = require("plugins.harvester");

function initMemory() {
    if (typeof Memory.plugins === "undefined") Memory.plugins = {};
}

module.exports.loop = function () {

    initMemory();

    // var myCreeps = _.filter(Game.creeps, (creep) => creep.my);
    // var population_size = Object.keys(myCreeps).length;

    var mySpawns = async.update(async.data.SPAWNS);

    // new Bot([WORK, CARRY, MOVE]).spawn("455cb7e61b8bba8f01ba9e39");
    // console.log(Memory.creeps['Caden'].body); // Creep class has been converted to pure object
    harv.init()
    var bestHarvester = harv.getPerfectBot(300);
    harv.rateBots([bestHarvester, new Bot([WORK, CARRY, MOVE])]);
};