var async = require("async"),
    c = require("constants"),
    Bot = require("bot");

module.exports = {
    init: function () {
        async.update(async.data.SOURCES);
    },
    getPerfectBot: function (energyAvailable) {
        var parts = [MOVE, CARRY];
        energyAvailable -= c.PARTS[CARRY] + c.PARTS[MOVE];

        for (energyAvailable; energyAvailable > 0; energyAvailable -= c.PARTS[WORK])
            parts.push(WORK);

        // Returns a bot consisting out of one CARRY and one MOVE part and filled up w/ WORK parts
        return new Bot(parts);
    },
    rateBots: function (bots) {
        // Scores are calculated by the amount of WORK parts a creep has
        // TODO: Give penalty if the creep has to many work parts
        var scores = bots.map(function (bot) {
            if (!(bot.hasPart(MOVE) && bot.hasPart(CARRY)))
                return 0;
            else
                return bot.partCount[WORK];
        });
        console.log(JSON.stringify(scores));
    }
}