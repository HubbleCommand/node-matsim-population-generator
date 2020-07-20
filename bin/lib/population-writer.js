function writeLeg(xmlPlanEle, mode){
    var leg = xmlPlanEle.ele("leg")
    leg.att("mode", mode)
    var route = leg.ele("route")
}

function writeActivity(){

}

function writePersonAndPlan(xmlRootEle, personId, mode, homeXY, workXY, workStart, workEnd){
    var person = xmlRootEle.ele("person");
    person.att("id", personId);
    var plan = person.ele("plan");

    var start = plan.ele("act")
    start.att("type", "h")
    start.att("x",homeXY[0])
    start.att("y",homeXY[1])
    //start.att("end_time", "07:00")

    writeLeg(plan, mode);
    /*
    var legTo = plan.ele("leg")
    legTo.att("mode", mode)
    var routeTo = legTo.ele("route")
    //Doing .end() often DRASTICALLY INCREASES TIME
    //routeTo.end();*/

    var work = plan.ele("act")
    work.att("type", "w")
    work.att("x",workXY[0])
    work.att("y",workXY[1] )
    //work.att("duration", "08:00")
    work.att("start_time", workStart);
    work.att("end_time", workEnd);

    writeLeg(plan, mode);
    /*var legBack = plan.ele("leg")
    legBack.att("mode", mode)
    var routeBack = legBack.ele("route")
    //routeBack.end();*/

    var end = plan.ele("act")
    end.att("type", "h")
    end.att("x",homeXY[0])
    end.att("y",homeXY[1])
}

exports.writeActivity = writeActivity
exports.writeLeg = writeLeg
exports.writePersonAndPlan = writePersonAndPlan