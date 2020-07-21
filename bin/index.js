#!/usr/bin/env node
var Excel = require('exceljs');                                             //https://www.npmjs.com/package/exceljs
var axios = require('axios');
var turf = require('@turf/turf');                                           //https://www.npmjs.com/package/@turf/turf
var randomPointsOnPolygon = require('random-points-on-polygon');            //https://www.npmjs.com/package/random-points-on-polygon
var builder = require('xmlbuilder');                                        //https://www.npmjs.com/package/xmlbuilder
var fs = require('fs');     
var Probability = require('probability-node');                              //https://www.javascripting.com/view/probability-js

//Require own data
var transfrontaliersData = require('./data/transfrontaliers.js');
var communespeupeuplees = require('./data/communespeupeuplees.js');

//Require own modules
var PopulationWriter = require('./lib/population-writer.js');
var PolyWorker = require('./lib/poly-worker.js');
var TimeRandomizers = require('./lib/time-randomizers.js');
var CommuterDataWorker = require('./lib/commuter-data-worker.js');

//Global vars
var proportionOfDriversCH = 0.5;
var proportionOfDriversFR = 0.5;

//Format of plans.xml is : http://www.matsim.org/files/dtd/plans_v4.dtd

//Requires the counter to reset
//Returns the counters in the array
function resetCounters(counter){
    counter.forEach(element => {
        element.nombre = 0;
    })
}

async function getGenevaCommunes(){
    var communePolysQuery = await axios.get("https://ge.ch/sitgags3/rest/services/Hosted/GEO_COMMUNES_GE_SIMPLIFIEES/FeatureServer/0/query?where=objectid>=0&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Meter&relationParam=&outFields=&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&sqlFormat=none&resultType=&f=geojson")
    if(! communePolysQuery.data.exceededTransferLimit){
        return communePolysQuery.data.features
    } else {
        throw "Data Transfer Limit Exceeded!";
    }
}

/* Requires :
    the probability that a commuter will use reservation, 
    whether or not to include transfrontaliers,
    the file name to write to
*/
// P1 no transfrontaliers
async function generatePopWPlans(probabilityReserve, includeTransfrontaliers, fileName){
    // 0 : Define xml file to write to
    var personIdCounter = 0;
    var root = builder.create("plans");
    root.att("xml:lang", "de-CH")

    // 1 : Load Commune polygons
    var communePolys = await getGenevaCommunes();

    // 1.5 : Handle different point encodings

    // 2 : Load Commune columns from Excel
    var fullpath = "D:/Files/Uni/Projet Bachelor/Population Generation/brp-ts-popgen/bin/data/T_11_06_2_10_cppfix.xlsx"
    var path = __dirname + "/data/T_11_06_2_10_cppfix.xlsx";
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(path);
    const worksheet = workbook.worksheets[0]

    destinationCommuneNames = worksheet.getColumn(1).values.slice(14, 28)
    console.log(destinationCommuneNames)

    //Get data by columns
    //Foreach origin commune (column)
    for(var x = 3; x <= 54 /* 42 without communes peu peuplées, 54 with communes peu peuplées */; x += 3){
        var communeName = worksheet.getColumn(x).values[8]
        console.log(communeName)

        //Get commune polygon
        var originPoly = PolyWorker.getCommunePolygon(communeName, communePolys)

        //Foreach destination commune (row)
        /*28 for no communes peu peuplées, 32 for communes peu peuplées */
        /* With reformatted, 28 is still for no communes peu peuples, but with CPP is 31 */
        communeValues = worksheet.getColumn(x - 1).values.slice(14, 31 );
        for(var y = 0; y <= communeValues.length; y++){
            var element = communeValues[y];

            //Determine number of commuters
            var numberOfCommuters = CommuterDataWorker.getNumberOfCommuters(element);
            if(typeof numberOfCommuters !== 'undefined' && numberOfCommuters !== null && numberOfCommuters !== 0){
                console.log(destinationCommuneNames[y] + " : " + numberOfCommuters)

                // Get destination commune polygon
                var destPoly = PolyWorker.getCommunePolygon(destinationCommuneNames[y], communePolys)

                if(typeof destPoly !== 'undefined' && destPoly !== null ){
                    var numberOfDrivers = Math.floor(numberOfCommuters * proportionOfDriversCH)

                    var originPoints = randomPointsOnPolygon(numberOfDrivers, originPoly);
                    var destinationPoints = randomPointsOnPolygon(numberOfDrivers, destPoly);
                    
                    // Create plans
                    console.log("Calculating plans from " + communeName + " to " + destinationCommuneNames[y])
                    originPoints.forEach((element, index) => {
                        personIdCounter += 1;
                        PopulationWriter.writePersonAndPlan(
                            root, 
                            personIdCounter, 
                            CommuterDataWorker.randomlyChooseMode(probabilityReserve), 
                            element.geometry.coordinates, 
                            destinationPoints[index].geometry.coordinates,
                            TimeRandomizers.randomWorkStartTime(),
                            TimeRandomizers.randomWorkEndTime()
                        );
                    })
                } else {
                    console.warn("No destination polygon is buildable for destination commune : " + destinationCommuneNames[y]);
                }
            } else {
                console.warn("No commuters defined for this destination! Dest : " + destinationCommuneNames[y] + " Orig : " + communeName)
            }
        }
    }

    //Handle transfrontaliers if asked
    if(includeTransfrontaliers){
        await generatePlansTransfrontaliers(root, personIdCounter + 1, probabilityReserve)
    }

    //Write plans to file
    var xml = root.end({pretty: true});

    fs.writeFile(process.cwd() + "/" + fileName, xml, (err) => {
        if (err) throw err;
        console.log('Plans saved!');
    });
    console.log("Done!");
}

/**
 * 
 * @param {xmlBuilder root element} xmlFileRoot 
 * @param {int} currentPersonId 
 * @param {double} probabilityReserve 
 */
// P2 with transfrontaliers
async function generatePlansTransfrontaliers(xmlFileRoot, currentPersonId, probabilityReserve){
    console.log("Starting to create plans for transfrontaliers!")
    //var transfrontaliersRegionsQuery = await axios.get("https://ge.ch/sitgags3/rest/services/Hosted/GEO_COMMUNES_REGION/FeatureServer/0/query?where=pays%3D%27FRANCE%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Meter&relationParam=&outFields=&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&sqlFormat=none&resultType=&f=geojson")

    //Build CH region (so no transfrontaliers created in CH)
    //var regionsSuisse = await axios.get("https://ge.ch/sitgags3/rest/services/Hosted/GEO_COMMUNES_CH_FR/FeatureServer/0/query?where=pays%3D%27CH%27+AND+%28numero_canton_ch%3D22+or+numero_canton_ch%3D23+or+numero_canton_ch%3D25%29&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Meter&relationParam=&outFields=&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&sqlFormat=none&resultType=&f=geojson");
    //var regionSuisse = turf.combine(regionsSuisse.data.features)
    //console.log("Built Switzerland areas")

    //Build circle around region
    transfrontaliersData.transfrontaliersNumbers.forEach((element, index) => {
        var circleOptions = {
            steps: 64,
            units: 'kilometers',
            options: {}
          };
        var cfCircle = turf.circle(element.centre, element.radius, circleOptions);
        element.circle = cfCircle;
    })
    console.log("Built transfrontalier areas")

    //Build probabilities
    var destinationZones = transfrontaliersData.destinationZoneChance;
    var probabilities = [];
    transfrontaliersData.destinationZoneChance.forEach((element, index) => {
        probabilities.push({
            p: element.chance / 100,
            f: function () {
                destinationZones.forEach((elementDZ, indexDZ) => {
                    if(elementDZ.nom == element.nom){
                        element.nombre = element.nombre + 1;
                    }
                })
            }
        })
    })
    var probabilitilized = new Probability(probabilities);
    console.log("Built probabilities");

    //Build CH communes
    // 1 : Load Commune polygons
    var communePolys = await getGenevaCommunes();

    //For each transfrontalier region
    transfrontaliersData.transfrontaliersNumbers.forEach((element, index) => {
        for (var i = 0; i < element.nombre; i++) {
            probabilitilized();
        }
        console.log(destinationZones)

        var originPoly = element.circle;

        //For each destination commune in Geneva
        destinationZones.forEach(elementDZ => {
            var numberOfDrivers = Math.floor(elementDZ.nombre * proportionOfDriversFR);
            var destPoly = PolyWorker.getCommunePolygon(elementDZ.nom, communePolys)

            var originPoints = randomPointsOnPolygon(numberOfDrivers, originPoly);
            var destinationPoints = randomPointsOnPolygon(numberOfDrivers, destPoly);
            
            //For each randomly generated origin point, write person
            originPoints.forEach((elementOP, indexOP) => {
                currentPersonId += 1;
                PopulationWriter.writePersonAndPlan(
                    xmlFileRoot, 
                    currentPersonId, 
                    CommuterDataWorker.randomlyChooseMode(probabilityReserve), 
                    elementOP.geometry.coordinates, 
                    destinationPoints[indexOP].geometry.coordinates,
                    TimeRandomizers.randomWorkStartTime(),
                    TimeRandomizers.randomWorkEndTime()
                );
            })
        })
        resetCounters(destinationZones);
    })
    console.log("Done creating plans for transfrontaliers!")
}

console.log("Generating population!")
console.log("Will be writing results to: " + process.cwd() + "/")
generatePopWPlans(0, true, "plansCPPwTF.xml");
