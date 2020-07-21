var turf = require('@turf/turf');                                           //https://www.npmjs.com/package/@turf/turf

var communespeupeuplees = require('../data/communespeupeuplees.js');
/**
 * 
 * @param {string} communeName 
 * @param {Array} polygons 
 */
//Requires the commune name to search for, and the list of polygons
//Returns the polygon of the commune
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
        //throw "No commune of this name found! No bueno! Commune : " + communeName;
    }
    
    console.log("Generated Geometry!")
    //console.log(originPolygon)
    return originPolygon;
}

exports.getCommunePolygon = getCommunePolygon;