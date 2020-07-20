#!/usr/bin/env node
var Excel = require('exceljs');
var axios = require('axios');
var turf = require('@turf/turf')
var randomPointsOnPolygon = require('random-points-on-polygon');
var builder = require('xmlbuilder');
var fs = require('fs');
var transfrontaliersData = require('./data/transfrontaliers.js')
var communespeupeuplees = require('./data/communespeupeuplees.js')
var PopulationWriter = require('./lib/population-writer.js')

function generateRandomMinute(){
    min = 0; max = 59;
    var minute = Math.round(Math.random() * (max - min) + min);
    if(minute < 10){
        minute = "0" + minute
    }
    return minute;
}

function randomWorkStartTime(){
    if(Math.random() >= 0.9){
        return "09:00";
    } else {
        return "08:" + generateRandomMinute();
    }
}

function randomWorkEndTime(){
    if(Math.random() >= 0.9){
        return "18:00";
    } else {
        return "17:" + generateRandomMinute();
    }
}

function randomlyChooseMode(probabilityReserve){
    if(Math.random() >= probabilityReserve){
        return "car";
    } else {
        return "car-reserve";
    }
}

function getNumberOfCommuters(){

}

function getCommunePolygon(communeName, polygons){
    var homeCommune
    if(communeName == "Genève"){
        homeCommune = polygons.filter(obj => {
            if(obj.properties.commune.includes(communeName)){
                return obj;
            }
        });
    } else if(communeName == "Nord (6)") {
        homeCommune = polygons.filter(obj => {
            if(communespeupeuplees.communespeupeuplees.Nord.includes(obj.properties.commune)){
                return obj;
            }
        });
    } else if(communeName == "Ouest (7)") {
        homeCommune = polygons.filter(obj => {
            if(communespeupeuplees.communespeupeuplees.Ouest.includes(obj.properties.commune)){
                return obj;
            }
        });
    } else if(communeName == "Sud (8)") {
        homeCommune = polygons.filter(obj => {
            if(communespeupeuplees.communespeupeuplees.Sud.includes(obj.properties.commune)){
                return obj;
            }
        });
    } else if(communeName == "Est (9)") {
        homeCommune = polygons.filter(obj => {
            if(communespeupeuplees.communespeupeuplees.Est.includes(obj.properties.commune)){
                return obj;
            }
        });
    } else {
        homeCommune = polygons.filter(obj => {
            if(obj.properties.commune == communeName){
                return obj;
            }
        });
    }
    
    originPolygon = null;
    if(homeCommune.length == 1){
        homeCommune = homeCommune[0]

        if(homeCommune.geometry.type == "Polygon"){
            originPolygon = turf.polygon(homeCommune.geometry.coordinates, {name:communeName})
        } else if (homeCommune.geometry.type == "MultiPolygon") {
            originPolygon = turf.multiPolygon(homeCommune.geometry.coordinates, {name:communeName})
        } else {
            throw "No geometry type defined for polygon!" + communeName
        }

    } else if (homeCommune.length > 1){
        console.warn("Multiple communes found! No bueno! There are " + homeCommune.length + " regions")
        if(communeName == "Genève"){
            console.warn("Should be okay as is Geneva, but still, be carfeul")
        }
        //Combine things
        things = []
        homeCommune.forEach(element => {
            things.push(element.geometry.coordinates)
        })
        originPolygon = turf.multiPolygon(things, {name:communeName})
    } else {
        throw "No commune of this name found! No bueno!";
    }
    
    console.log("Generated Geometry!")
    //console.log(originPolygon)
    return originPolygon;
}

// P1 no transfrontaliers
async function generatePopWPlans(probabilityReserve, includeTransfrontaliers, fileName){
    // 0 : Define xml file to write to
    var personIdCounter = 0;
    var root = builder.create("plans");
    root.att("xml:lang", "de-CH")

    // 1 : Load Commune polygons
    var communePolysQuery = await axios.get("https://ge.ch/sitgags3/rest/services/Hosted/GEO_COMMUNES_GE_SIMPLIFIEES/FeatureServer/0/query?where=objectid>=0&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Meter&relationParam=&outFields=&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&sqlFormat=none&resultType=&f=geojson")
    
    if(! communePolysQuery.data.exceededTransferLimit){
        communePolys = communePolysQuery.data.features
    } else {
        throw "Data Transfer Limit Exceeded!";
    }

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
    for(var x = 3; x <= 42 /* 54 if include generlised areas */; x += 3){
        var communeName = worksheet.getColumn(x).values[8]
        console.log(communeName)

        //Get commune polygon
        var originPoly = getCommunePolygon(communeName, communePolys)

        //Foreach destination commune (row)
        communeValues = worksheet.getColumn(x - 1).values.slice(14, 28);
        for(var y = 0; y <= communeValues.length; y++){
            //Handle the row that holds no data
            //if(y=28) continue;

            var element = communeValues[y]
            //console.log(element)
            //Determine number of commuters
            var numberOfCommuters = undefined;
            if(typeof element !== 'undefined' && element !== null) {
                if(Number.isNaN(Number(element))){
                    var test3 = element.slice(1, -1)
                    //if(Number.isNaN(test3)){
                    if(!Number.isNaN(Number(test3))){
                        numberOfCommuters = Number(test3)
                    }
                } else {
                    numberOfCommuters = Number(element)
                }
            }

            if(typeof numberOfCommuters !== 'undefined' && numberOfCommuters !== null && numberOfCommuters !== 0){
                console.log(destinationCommuneNames[y] + " : " + numberOfCommuters)

                // Get destination commune polygon
                var destPoly = getCommunePolygon(destinationCommuneNames[y], communePolys)

                var numberOfDrivers = Math.floor(numberOfCommuters / 2)

                var originPoints = randomPointsOnPolygon(numberOfDrivers, originPoly);
                var destinationPoints = randomPointsOnPolygon(numberOfDrivers, destPoly);
                
                // Create plans
                console.log("Calculating plans from " + communeName + " to " + destinationCommuneNames[y])
                originPoints.forEach((element, index) => {
                    personIdCounter += 1;
                    var personMode = randomlyChooseMode(probabilityReserve)

                    PopulationWriter.writePersonAndPlan(
                        root, 
                        personIdCounter, 
                        personMode, 
                        element.geometry.coordinates, 
                        destinationPoints[index].geometry.coordinates,
                        randomWorkStartTime(),
                        randomWorkEndTime()
                    );
                })
            } else {
                console.warn(destinationCommuneNames[y] + " : No commuters defined for this destination!")
            }
        }
    }

    //Handle transfrontaliers if asked
    if(includeTransfrontaliers){
        await generatePlansTransfrontaliers(root)
    }

    //Write plans to file
    var xml = root.end({pretty: true});

    fs.writeFile(process.cwd() + "/" + fileName, xml, (err) => {
        if (err) throw err;
        console.log('Plans saved!');
    });
    console.log("Done!");
}

async function handleLightlyPopulatedCommunes(xmlFileRoot){

}

// P2 with transfrontaliers
async function generatePlansTransfrontaliers(xmlFileRoot){
    var transfrontaliersRegionsQuery = await axios.get("https://ge.ch/sitgags3/rest/services/Hosted/GEO_COMMUNES_REGION/FeatureServer/0/query?where=pays%3D%27FRANCE%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Meter&relationParam=&outFields=&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&sqlFormat=none&resultType=&f=geojson")

    transfrontaliersData
}

console.log("Hello world!")
generatePopWPlans(0, false, "plans.xml");
