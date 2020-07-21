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
    if(Math.random() >= 0.9){
        return "09:00";
    } else {
        return "08:" + generateRandomMinute();
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

exports.randomWorkStartTime = randomWorkStartTime
exports.randomWorkEndTime = randomWorkEndTime