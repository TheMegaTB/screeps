var helpers = require('helpers');

module.exports = function(creep) {
    if(creep.carry.energy < creep.carryCapacity && !creep.memory.depositing) {
        if (creep.memory.source == null) {
            var sources = Memory.rooms[creep.room.name].sources;
            for (var source_id in sources) {
                var source = sources[source_id];
                if (Object.keys(source.creeps).length < source.spots) {
                    creep.memory.source = source_id;
                    source.creeps[creep.name] = {};
                    break;
                }
            }
        }

        var source = Game.getObjectById(creep.memory.source);
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    } else if (creep.carry.energy > 0) {
        creep.memory.depositing = true;

        var target = creep.pos.findClosestByRange(helpers.findEnergyDeposit(creep));

        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            helpers.moveTo(creep, target);//creep.moveTo(target);
        }
    } else { creep.memory.depositing = false };
};
