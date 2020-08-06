var turf = require(`@turf/turf`);  
/**
 * Generates a random minute between 0 and 59
 * @returns {string} random time
 */
function generateRandomMinute(){
    min = 0; max = 59;
    var minute = Math.round(Math.random() * (max - min) + min);
    if(minute < 10){
        minute = "0" + minute
    }
    return minute;
}

/**
 * Returns a random work start time between 8h and 9h
 * @returns {string} random time
 */
function randomWorkStartTime(){
    /*if(Math.random() >= 0.9){
        return "09:00";
    } else {
        return "08:" + generateRandomMinute();
    }*/
    if(Math.random() >= 0.9){
        return "08:00";
    } else {
        return "07:" + generateRandomMinute();
    }
}

/**
 * Returns a random work end time between 17h and 18h
 * @returns {string} random time
 */
function randomWorkEndTime(){
    if(Math.random() >= 0.9){
        return "18:00";
    } else {
        return "17:" + generateRandomMinute();
    }
}

//Inspired by https://www.w3resource.com/javascript-exercises/javascript-basic-exercise-51.php
function time_convert(num) { 
    var hours = Math.floor(num / 60);  
    var minutes = Math.floor(num % 60);
    return hours + ":" + minutes;         
}

function getRealTime(minutesNeeded){
    
}

/**
 * 
 * @param {[double, double]} XYOrigin 
 * @param {[double, double]} XYDestination 
 * @returns random time based on the absolute distance needed to travel
 */
function randomWorkStartTimeDistanceDependant(XYOrigin, XYDestination){
    var from = turf.point([XYOrigin[0], XYOrigin[1]]);
    var to = turf.point([XYDestination[0], XYDestination[1]]);
    var options = {units: 'kilometers'};
    var distance = turf.distance(from, to, options);    //Get the straight line distance between the two points
    /*
        https://www.swissinfo.ch/eng/getting-around_half-of-swiss-population-commutes-half-an-hour-to-work/44717548
        https://www.bfs.admin.ch/bfs/en/home/statistics/mobility-transport/passenger-transport/commuting.html
        https://www.swissinfo.ch/eng/transport_swiss-face-longer-commutes/43868180

        Average travel time: 15 km = 30 minutes => 1km = 2 minutes
    */

    var startTime = 480     //start at 8h = 480 minutes
    var randomFactor = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 10)    //Random factor, negative or positive
    var leaveTime = time_convert(startTime - randomFactor - (distance*2))       //Convert minutes to hours
    console.log(leaveTime)
    return time_convert(leaveTime)
}

/**
 * Calculates an actual route between the two points, determines time needed to do route, then does 8h - calculated time
 * @param {*} XYOrigin 
 * @param {*} XYDestination 
 * @returns random time based on the distance needed to trajet an actual route between the two points
 */
function randomWorkStartTimeDistanceDependantAdvanced(XYOrigin, XYDestination){
     //Use https://openrouteservice.org/dev/#/api-docs/directions/get
     //HOly christ I can't even log into their service.
    
}

exports.randomWorkStartTime = randomWorkStartTime
exports.randomWorkEndTime = randomWorkEndTime
exports.randomWorkStartTimeDistanceDependant = randomWorkStartTimeDistanceDependant
exports.randomWorkStartTimeDistanceDependantAdvanced = randomWorkStartTimeDistanceDependantAdvanced
