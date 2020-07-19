#!/usr/bin/env node

const Excel = require('exceljs');
var axios = require('axios');
//import * as turf from '@turf/turf'
var turf = require('@turf/turf')
var randomPointsOnPolygon = require('random-points-on-polygon');
var builder = require('xmlbuilder');
const fs = require('fs');

function generateRandomHour(min, max){
    return Math.random() * (max - min) + min
}

function generateRandomMinute(){
    min = 0;
    max = 59;
    return Math.random() * (max - min) + min
}

function randomWorkStartTime(){
    if(Math.random() >= 0.9){
        return "09:00";
    } else {
        return "08:" + generateRandomMinute();
    }
}

function randomWorkEndTimer(){
    if(Math.random() >= 0.9){
        return "18:00";
    } else {
        return "17:" + generateRandomMinute();
    }
}
//Not useful anymore, using numbers
function oneBackAlphabet(string){
    length = string.length;
    if(length <= 0) {
        return string;
    } else if(length > 1){
        str.substr(0,index) + chr
    } else {
        return String.fromCharCode(string.charAt(0).charCodeAt(0) - 1)
    }
}
//Not useful anymore, using numbers
const columnsOrigin = [
    "C", "F", "I", "L", "O", "R", "U", "X", "AA", "AD", "AG", "AJ", "AM", "AP" 
    //nord, oeust, sud, est (AS AV AY BB), 
]
//Not useful anymore, using numbers
const columnsOriginData = [
    "B", "E", "H", "K", "N", "Q", "T", "W", "Z", "AC", "AF", "AI", "AL", "AO" 
    //nord, ouest, sub, est AR AU AX BA
]

//No longer need
//The random point library also handles multipolygons
function chooseRandomPolygon(polygons){
    return polygons[Math.floor(Math.random() * polygons.length)];
}

function randomlyChooseMode(probabilityReserve){
    if(Math.random() >= probabilityReserve){
        return "car";
    } else {
        return "car-reserve";
    }
}

function getCommunePolygon(communeName, polygons){
    var homeCommune
    if(communeName == "Genève"){
        homeCommune = polygons.filter(obj => {
            if(obj.properties.commune.includes(communeName)){
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

        /*var regions = []
        homeCommune.forEach(regionElement => {
            console.log("Got here : ")
            console.log(regionElement)
            regions.push(regionElement.geometry.coordinates[0])
        })

        var fc = turf.featureCollection(regions);
        var combined = turf.combine(fc);
        originPolygon = combined*/
    } else {
        throw "No commune of this name found! No bueno!";
    }

    /*if(originPolygon.features.length == 0){
        throw "Geometry not created properly! No features for " + communeName + " !";
    }*/
    console.log("Generated Geometry!")
    //console.log(originPolygon)
    return originPolygon;
}

function generateRandomPoints(numberToGenerate, sourceGeometry){
    if(sourceGeometry.geometry.type == "MultiPolygon"){
        var points = [];



    } else {
        return randomPointsOnPolygon(numberToGenerate, sourceGeometry);
    }
}

// P1 no transfrontaliers
async function generatePopWPlans(probabilityReserve, includeTransfrontaliers, fileName){
    // 0 : Define object to write to
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
    
    console.log(communePolysQuery)
    console.log(communePolys)

    // 2 : Load Commune columns from Excel
    var fullpath = "D:/Files/Uni/Projet Bachelor/Population Generation/brp-ts-popgen/bin/data/T_11_06_2_10.xlsx"
    var path = "./data/T_11_06_2_10.xlsx";
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(fullpath);
    const worksheet = workbook.worksheets[0] //workbook.getWorksheet("2013-2017")

    destinationCommuneNames = worksheet.getColumn(1).values.slice(14, 28)
    console.log(destinationCommuneNames)

    //Get data by columns
    //Foreach origin commune
    for(var x = 3; x <= 42 /* 54 if include generlised areas */; x += 3){
        var communeName = worksheet.getColumn(x).values[8]
        console.log(communeName)

        //Get commune polygon
        var originPoly = getCommunePolygon(communeName, communePolys)

        //Foreach destination commune
        communeValues = worksheet.getColumn(x - 1).values.slice(14, 28);
        for(var y = 0; y <= communeValues.length; y++){
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
                if(numberOfDrivers > 500){
                    numberOfDrivers = 500
                }

                var originPoints = randomPointsOnPolygon(numberOfDrivers, originPoly);
                var destinationPoints = randomPointsOnPolygon(numberOfDrivers, destPoly);
                //console.log(originPoints)

                //var originPoints = generateRandomPoints(numberOfDrivers, originPoly);
                //var destinationPoints = generateRandomPoints(numberOfDrivers, destPoly);
                
                // Create plans
                console.log("Calculating plans from " + communeName + " to " + destinationCommuneNames[y])
                originPoints.forEach((element, index) => {
                    personIdCounter += 1;
                    var personeMode = randomlyChooseMode(probabilityReserve)

                    var homeX = element.geometry.coordinates[0]
                    var homeY = element.geometry.coordinates[1]
                    var workX = destinationPoints[index].geometry.coordinates[0]
                    var workY = destinationPoints[index].geometry.coordinates[1]
                    
                    var person = root.ele("person");
                    person.att("id", personIdCounter);
                    var plan = person.ele("plan");

                    var start = plan.ele("act")
                    start.att("type", "h")
                    start.att("x",homeX)
                    start.att("y",homeY)
                    start.att("end_time", "07:00")

                    var legTo = plan.ele("leg")
                    legTo.att("mode", personeMode)
                    var routeTo = legTo.ele("route")
                    //Doing .end() often DRASTICALLY INCREASES TIME
                    //routeTo.end();

                    var work = plan.ele("act")
                    work.att("type", "w")
                    work.att("x",workX)
                    work.att("y",workY)
                    work.att("duration", "08:00")

                    var legBack = plan.ele("leg")
                    legBack.att("mode", personeMode)
                    var routeBack = legBack.ele("route")
                    //routeBack.end();

                    var end = plan.ele("act")
                    end.att("type", "h")
                    end.att("x",homeX)
                    end.att("y",homeY)
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

    //fs.writeFileSync('' + fileName, xml);
    fs.writeFile(process.cwd() + "/" + fileName, xml, (err) => {
        // throws an error, you could also catch it here
        if (err) throw err;
    
        // success case, the file was saved
        console.log('Plans saved!');
    });
}

// P2 with transfrontaliers
async function generatePlansTransfrontaliers(xmlFileRoot){
    var transfrontaliersRegionsQuery = await axios.get("https://ge.ch/sitgags3/rest/services/Hosted/GEO_COMMUNES_REGION/FeatureServer/0/query?where=pays%3D%27FRANCE%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Meter&relationParam=&outFields=&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&sqlFormat=none&resultType=&f=geojson")

    /*Not needed, filter done during query
    var frenchRegions = transfrontaliersRegionsQuery.filter(obj => {
        if(!Number.isNaN(Number(obj.properties.code_postal_fr))){
            return obj;
        }
    })*/
}

console.log("Hello world!")
generatePopWPlans(0, false, "plans.xml");
console.log("Done!");