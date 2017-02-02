var c = require("constants");

var calculateCost = function (body) {
    var cost = 0;
    for (var part in body)
        cost += c.PARTS[body[part]];
    return cost;
};

var Bot = class Bot {
    constructor(body) {
        this.body = body ? body : [];
    }

    get body() {
        return this.parts;
    }

    set body(parts) {
        this.parts = parts;
        this.cost = calculateCost(parts);
        this.partCount = _.countBy(parts, _.identity);
    }
    
    hasPart(part) {
        return this.partCount[part] > 0;
    }

    spawnAt(spawnID) {
        Game.getObjectById(spawnID).createCreep(this.body, this.name, this);
    }
}

module.exports = Bot;