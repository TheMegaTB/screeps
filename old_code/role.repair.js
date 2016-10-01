var helpers = require('helpers');

module.exports = function(creep) {
    var WALL_MAX = 5000000;

    if (!creep.memory.energySource && creep.carry.energy > 0) {
        // TODO: Set one fixed target and only work on that until its finished
        var damagedStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) && structure.hits < WALL_MAX) || ((structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) && structure.hits < structure.hitsMax);
            }
        });
        if (damagedStructure) {
            if (creep.repair(damagedStructure) == ERR_NOT_IN_RANGE) {
                creep.moveTo(damagedStructure);
            }
        } else {
            helpers.moveToPausePosition(creep);
        }
    } else if (creep.carry.energy == 0 || creep.memory.energySource) {
        if (!helpers.getEnergy(creep)) {
            helpers.moveToPausePosition(creep);
        }
    }
}
