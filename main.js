"use strict";

var async = require("async"),
    c     = require("constants");

module.exports.loop = function () {

    // var myCreeps = _.filter(Game.creeps, (creep) => creep.my);
    // var population_size = Object.keys(myCreeps).length;

    async.update(async.data.SOURCES);
    var mySpawns = async.update(async.data.SPAWNS);
};