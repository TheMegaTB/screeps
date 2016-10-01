module.exports = function(creep) {
    if (creep.memory.recycleTarget == null) {
        creep.memory.recycleTarget = creep.pos.findClosestByRange(creep.room.find(FIND_MY_SPAWNS)).id;
    }

    var target = Game.getObjectById(creep.memory.recycleTarget);
    if (target.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
    }
};
