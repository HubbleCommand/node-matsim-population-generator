function writeLeg(xmlPlanEle, mode){
    var leg = xmlPlanEle.ele("leg")
    leg.att("mode", mode)
    var route = leg.ele("route")
}

function writeActivity(planXMLEle, activityType, X, Y, startTime, endTime){
    var activity = planXMLEle.ele("act");
    activity.att("type", activityType);
    activity.att("x", X);
    activity.att("Y", Y);
    if(activityType == 'w'){
        activity.att("start_time", startTime);
        activity.att("end_time", endTime);
    }
}

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