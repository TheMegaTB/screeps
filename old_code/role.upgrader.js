var helpers = require('helpers');

module.exports = function(creep) {
    if (!creep.memory.energySource && creep.carry.energy > 0) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    } else if (creep.carry.energy == 0 || creep.memory.energySource) {
        // TODO: This got called with an undefined creep!!!
        if (!helpers.getEnergy(creep)) {
            helpers.moveToPausePosition(creep);
        }
    }
};
