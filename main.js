"use strict";

var async = require("async"),
    c     = require("constants");

module.exports.loop = function () {

    var myCreeps = _.filter(Game.creeps, (creep) => creep.my);
    var population_size = Object.keys(myCreeps).length;

    var mySpawns = async.update("mySpawns", c.UPDATE_INTERVAL_MY_SPAWNS, async.data.mySpawns, async.loader.byID);
    console.log(mySpawns);
};