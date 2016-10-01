var moveTo = function(creep, target) {
    // var room = Memory.rooms[creep.room.name];
    // if (room.movement == undefined) { room.movement = []; }
    // if (room.movement[creep.pos.x] == undefined) { room.movement[creep.pos.x] = []; }
    // if (room.movement[creep.pos.y] == undefined) { room.movement[creep.pos.y] = []; }
    //
    // room.movement[creep.pos.x][creep.pos.y] = room.movement[creep.pos.x][creep.pos.y] + 1;
    creep.moveTo(target);
}

var findEnergyDeposit = function(creep) {
    var transporters = Object.keys(_.filter(Game.creeps, (creep) => creep.memory.role == "transporter")).length > 0;
    return creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                var type = structure.structureType;
                var generic_targets = ((structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity);
                if (transporters == 0) {
                    return generic_targets;
                } else {
                    return generic_targets || ((structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
                }
            }
    });
}

var findEnergySource = function(creep, ignoreSpawn) {
    var sources = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            var type = structure.structureType;
            return ((type == STRUCTURE_SPAWN || type == STRUCTURE_EXTENSION) && structure.room.energyAvailable == structure.room.energyCapacityAvailable)
                        || ((type == STRUCTURE_CONTAINER || type == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] > 0);
        }
    });

    var equalOnes = [];
    var highestContent = 0;
    var currentSource = null;
    for (var source in sources) {
        var source = sources[source];
        var energyLevel = 0;
        if (source.structureType == STRUCTURE_CONTAINER || source.structureType == STRUCTURE_STORAGE) {
            energyLevel = source.store[RESOURCE_ENERGY];
        } else if ((source.structureType == STRUCTURE_SPAWN || source.structureType == STRUCTURE_EXTENSION) && !ignoreSpawn) {
            energyLevel = source.energy;
        }

        if (energyLevel > highestContent) {
            equalOnes = [];
            highestContent = energyLevel;
            currentSource = source.id;
        } else if (energyLevel > 0 && energyLevel == highestContent) {
            equalOnes.push(Game.getObjectById(currentSource));
            equalOnes.push(source);
        }
    }

    if (equalOnes.length > 0) {
        var closest = creep.pos.findClosestByPath(equalOnes);
        if (closest) { return closest.id; }
    }

    return currentSource;
}

var getEnergy = function(creep, ignoreSpawn) {
    if (creep.carry == undefined) {
        return false;
    }

    if (creep.memory.energySource == undefined || (Game.getObjectById(creep.memory.energySource).store && Game.getObjectById(creep.memory.energySource).store[RESOURCE_ENERGY] == 0)) {
        creep.memory.energySource = findEnergySource(creep, ignoreSpawn);
    }

    var source = Game.getObjectById(creep.memory.energySource);
    if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        moveTo(creep, source);//creep.moveTo(source);
    } else if (creep.carry.energy == creep.carryCapacity) {
        creep.memory.energySource = undefined;
    } else {
        return false;
    }

    return true;
}

var moveToPausePosition = function(creep) {
    creep.moveTo(Game.flags["CoffeeStop"]);
}

var calculateCost = function(body) {
    var cost = 0;
    for (var part in body) {
        var part = body[part];
        switch (part) {
            case MOVE:
                cost += 50;
                break;
            case CARRY:
                cost += 50;
                break;
            case WORK:
                cost += 100;
                break;
            case ATTACK:
                cost += 80;
                break;
            case RANGED_ATTACK:
                cost += 150;
                break;
            case HEAL:
                cost += 250;
                break;
            case CLAIM:
                cost += 600;
                break;
            case TOUGH:
                cost += 10;
                break;
        }
    }
    return cost;
}

var generateBody = function(baseParts, maxEnergy) {
    if (!baseParts) { return []; }

    var MAX_PARTS = 20;

    var baseBody = [];
    baseBody = baseBody.concat(baseParts);

    for (var i = 0; i < baseParts.length / 2; i++) {
        baseBody.push(MOVE);
    }

    var times = Math.floor(maxEnergy / calculateCost(baseBody));

    if (times * baseBody.length > MAX_PARTS) {
        times = Math.floor(MAX_PARTS / baseBody.length);
    } else if (times == 0) {
        return [WORK, WORK, CARRY, MOVE];
    }

    var finalBody = [];
    for (var i = 0; i < times; i++) {
        finalBody = finalBody.concat(baseBody);
    }

    return finalBody;
}

var generateName = function(prefix) {
    var i = 1;
    while (Game.creeps[prefix + " #" + i] != null) {
       i += 1;
    }
    return prefix + " #" + i;
}

module.exports = {
    findEnergyDeposit: findEnergyDeposit,
    findEnergySource: findEnergySource,
    moveToPausePosition: moveToPausePosition,
    calculateCost: calculateCost,
    generateBody: generateBody,
    generateName: generateName,
    getEnergy: getEnergy,
    moveTo: moveTo
}
