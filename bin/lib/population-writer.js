var builder = require('xmlbuilder');
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
function writeActivity(planXMLEle, activityType, X, Y, startTime, endTime){
    var activity = planXMLEle.ele("act");
    activity.att("type", activityType);
    activity.att("x", X.toFixed(4));            //Flooring will 1: decrease file size, and 2: may fix runtime errors in MATSim
    activity.att("y", Y.toFixed(4));
    if(activityType == 'w'){
        activity.att("start_time", startTime);
        activity.att("end_time", endTime);
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

    writeActivity(plan, "h", homeXY[0], homeXY[1], null, null);
    writeLeg(plan, mode);
    writeActivity(plan, "w", workXY[0], workXY[1], workStart, workEnd);
    writeLeg(plan, mode);
    writeActivity(plan, "h", homeXY[0], homeXY[1], null, null);
}

exports.writePersonAndPlan = writePersonAndPlan