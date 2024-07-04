export default (timestamp) => {
    const timeInSeconds = parseInt(timestamp, 16)
    // convert to miliseconds
    const timeInMiliseconds = timeInSeconds * 1000
    return new Date(timeInMiliseconds).toLocaleDateString()
}

export const parseUnixTime = (time) => {
    if(time == 0) return undefined
    return timeSince(new Date(time * 1000))
}

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}
