var helpers = require('helpers');

module.exports = function(creep) {

    if (!creep.memory.energySource && creep.carry.energy > 0) {
        var spawns = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity);
            }
        });
        var storages = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
            }
        });
        //TODO: Deposit into the container w/ the lowest level that has a delta of at least carryCapacity to the next one
        var target;
        if (spawns) {
            target = creep.pos.findClosestByPath(spawns);
        }
        // if (target == null && storages) {
        //     target = creep.pos.findClosestByPath(storages);
        // }
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    } else if (creep.carry.energy == 0 || creep.memory.energySource) {
        if (!helpers.getEnergy(creep)) {
            helpers.moveToPausePosition(creep);
        }
    }

};
