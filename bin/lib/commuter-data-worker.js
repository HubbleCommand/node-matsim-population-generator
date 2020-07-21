
/**
 * Returns a random mode
 * @param {float} probabilityReserve    the probability that Reserve will be selected
 * @returns {string}                    the mode
 */
function randomlyChooseMode(probabilityReserve){
    if(Math.random() >= probabilityReserve){
        return "car";
    } else {
        return "car-reserve";
    }
}

/**
 * Returns the number of commuters for the element
 * @param {string} element              the escel sheet element / cell (look at call examples)
 * @returns {(number|undefined)}        the number that was parsed
 */
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