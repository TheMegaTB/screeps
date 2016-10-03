// Configurable constants
var updateInterval = {
    SPAWNS: 60,
    SOURCES: 1000
};


// Things you're not supposed to be touching
module.exports = {
    updateInterval: updateInterval,
    DIRECTIONS: {
        NORTH:  [ 0, -1],
        EAST:   [ 1,  0],
        SOUTH:  [ 0,  1],
        WEST:   [-1,  0],
        NW:     [-1, -1],
        NE:     [-1,  1],
        SW:     [ 1, -1],
        SE:     [ 1,  1]
    }
}