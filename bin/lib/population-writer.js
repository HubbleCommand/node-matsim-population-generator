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
    /*var start = plan.ele("act")
    start.att("type", "h")
    start.att("x",homeXY[0])
    start.att("y",homeXY[1])
    //start.att("end_time", "07:00")*/

    writeLeg(plan, mode);

    writeActivity(plan, "w", homeXY[0], homeXY[1], workStart, workEnd);
    /*var work = plan.ele("act")
    work.att("type", "w")
    work.att("x",workXY[0])
    work.att("y",workXY[1] )
    //work.att("duration", "08:00")
    work.att("start_time", workStart);
    work.att("end_time", workEnd);*/

    writeLeg(plan, mode);

    writeActivity(plan, "h", homeXY[0], homeXY[1], null, null);
    /*var end = plan.ele("act")
    end.att("type", "h")
    end.att("x",homeXY[0])
    end.att("y",homeXY[1])*/
}

exports.writePersonAndPlan = writePersonAndPlan