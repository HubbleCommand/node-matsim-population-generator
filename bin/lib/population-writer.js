var builder = require('xmlbuilder');
var Proj4js = require('proj4');

Proj4js.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");

var firstProjection = Proj4js('WGS84');
var secondProjection = Proj4js('EPSG:25832');

/**
 * Writes a Leg
 * @param {object} xmlPlanEle   the xml element of the plan
 * @param {string} mode         the mode of this leg (for example "car", "car-reserved", "pt", etc.)
 */
function writeLeg(xmlPlanEle, mode){
    var leg = xmlPlanEle.ele("leg")
    leg.att("mode", mode)
    var route = leg.ele("route")
}

/**
 * Writes an activity
 * @param {object} planXMLEle               the xml element of the plan
 * @param {string} activityType             the type of activity ("w" or "h")
 * @param {(number|string)} X               the X position of the activity
 * @param {(number|string)} Y               the Y position of the activity
 * @param {(string|null)} startTime         time the activity starts
 * @param {(string|null)} endTime           time the activity ends
 */
function writeActivity(planXMLEle, activityType, XY, startTime, endTime){
    //FIXME coordinate transformation is not 100% correct
    /**
     * However this should not cause problems, as we are
     * at the random generation of points level. If we were
     * dealing with MATSim links, it would be another story,
     * but deviations from already random points is not critical.
     */

    // The activity seems to need at least an end time (except for the last one)
    var transfXY = Proj4js(firstProjection, secondProjection, XY);
    XY = transfXY;
    var activity = planXMLEle.ele("act");
    activity.att("type", activityType);
    activity.att("x", XY[0]/*.toFixed(4)*/);            //Flooring will 1: decrease file size, and 2: may fix runtime errors in MATSim
    activity.att("y", XY[1]/*.toFixed(4)*/);

    if(endTime != null){
        activity.att("end_time", endTime);
    }

    /*if(activityType == 'w'){
        activity.att("start_time", startTime);
        //activity.att("end_time", endTime);
    }*/
    if(activityType == 'w'){
        activity.att("dur", "08:00");
        //activity.att("end_time", endTime);
    }
}

//Format of plans.xml is : http://www.matsim.org/files/dtd/plans_v4.dtd
/**
 * Writes a person and their plan
 * @param {object} xmlRootEle   the root XML element of the current document
 * @param {number} personId     the id of the person
 * @param {string} mode         the mode for the person to use
 * @param {number[]} homeXY     x and y position of where the person's home is (array length 2)
 * @param {number[]} workXY     x and y position of where the person's work is (array length 2)
 * @param {string} workStart    time to start work at
 * @param {string} workEnd      time to end work at
 */
function writePersonAndPlan(xmlRootEle, personId, mode, homeXY, workXY, workStart, workEnd){
    var person = xmlRootEle.ele("person");
    person.att("id", personId);
    var plan = person.ele("plan");

    writeActivity(plan, "h", homeXY, null, workStart);
    writeLeg(plan, mode);
    writeActivity(plan, "w", workXY, null, null);
    writeLeg(plan, mode);
    writeActivity(plan, "h", homeXY, null, null);
}

exports.writePersonAndPlan = writePersonAndPlan