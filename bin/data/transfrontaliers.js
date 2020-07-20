const transfrontaliersNumbers = [
    {
        nom:"total",
        nombre:100000
    },
    {
        nom:"Gex",
        centre:[
            46.267999, 6.029362
        ],
        radius:8,
        nombre:27000
    },
    {
        nom:"Annemasse",
        centre:[
            46.197698, 6.273465
        ],
        radius: 7,
        nombre:18500
    },
    {
        nom:"Genevois",
        centre:[
            46.119756, 6.048240
        ],
        radius:6,
        nombre:13000
    },
    {
        nom:"Thonon",
        centre:[
            46.341950, 6.502898
        ],
        radius:10,
        nombre:130000
    }
]

//Refer to last column of T_11_06_2_10 my modifs.xlsx
const destinationZoneChance = [
    {
        nom:"Bernex",
        chance:0.804965014
    },
    {
        nom:"Carouge",
        chance:8.380693597
    },
    {
        nom:"Chêne-Bougeries",
        chance:1.473430414
    },
    {
        nom:"Chêne-Bourg",
        chance:1.023109257
    },
    {
        nom:"Genève",
        chance:60.13063141
    },
    {
        nom:"Grand-Saconnex",
        chance:3.101220204
    },
    {
        nom:"Lancy",
        chance:6.418671106
    },
    {
        nom:"Meyrin",
        chance:5.446589742
    },
    {
        nom:"Onex",
        chance:1.576124049
    },
    {
        nom:"Plan-les-Ouates",
        chance:3.166280768
    },
    {
        nom:"Thônex",
        chance:1.220842343
    },
    {
        nom:"Vernier",
        chance:5.522493733
    },
    {
        nom:"Versoix",
        chance:1.129629984
    },
    {
        nom:"Veyrier",
        chance:0.605318382
    }
]

exports.transfrontaliersNumbers = transfrontaliersNumbers
exports.destinationZoneChance = destinationZoneChance