var helpers = require("helpers");

module.exports = function(creep) {
    if (!creep.memory.energySource && creep.carry.energy > 0) {
        // TODO: Set one fixed target and only work on that until its finished
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        var closestTarget = creep.pos.findClosestByPath(targets);
        if (closestTarget) {
            if (creep.build(closestTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestTarget);
            }
        } else {
            // var walls = creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_WALL }});
            // var wall = walls[Math.floor(Math.random() * walls.length)];
            // if (wall) {
            //     if (creep.repair(wall) == ERR_NOT_IN_RANGE) {
            //         creep.moveTo(wall);
            //     }
            // } else {
                helpers.moveToPausePosition(creep);
            // }
        }
    } else if (creep.carry.energy == 0 || creep.memory.energySource) {
        if (!helpers.getEnergy(creep)) {
            helpers.moveToPausePosition(creep);
        }
    }
};
