
/**
 * 
 * @param {float} probabilityReserve 
 */
//Requires probably that reservation is used
//Returns a randomly chosen mode
function randomlyChooseMode(probabilityReserve){
    if(Math.random() >= probabilityReserve){
        return "car";
    } else {
        return "car-reserve";
    }
}


//Requires the scel sheet element (look at use for details)
//Returns the number of commuters for the element
function getNumberOfCommuters(element){
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
    return numberOfCommuters;
}

exports.randomlyChooseMode = randomlyChooseMode;
exports.getNumberOfCommuters = getNumberOfCommuters;