export const hexToDate = (timestamp) => {
    const timeInSeconds = parseInt(timestamp, 16)
    const timeInMilliseconds = timeInSeconds * 1000
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
    };

    const formattedDate = new Date(timeInMilliseconds).toLocaleString('en-US', options);
    return formattedDate.replace(',', '') + ' ' + options.timeZone;

}

export const parseUnixTime = (time) => {
    if (time == 0) return undefined
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


export function getTimeUntilNextHeartbeat(lastHeartbeatItem, heartbeatInterval) {
    // Convert the lastHeartbeatTimestamp to milliseconds
    const lastHeartbeatTimestamp = lastHeartbeatItem * 1000;
    
    // Calculate when the next heartbeat should occur
    const nextHeartbeatTimestamp = lastHeartbeatTimestamp + heartbeatInterval;
    
    // Calculate the time difference
    let timeUntilNextHeartbeat = nextHeartbeatTimestamp -  Date.now();
    
    // If the next heartbeat time is in the past, calculate the next one
    if (timeUntilNextHeartbeat < 0) {
        const missedHeartbeats = Math.floor(Math.abs(timeUntilNextHeartbeat) / heartbeatInterval) + 1;
        timeUntilNextHeartbeat = (missedHeartbeats * heartbeatInterval) + timeUntilNextHeartbeat;
    }
    
    return timeUntilNextHeartbeat;
}

export function parseCustomCron(cronExpr) {
    const [minute, hour, , , dayOfWeek] = cronExpr.split(' ');
    const now = new Date();
    const result = new Date(now);
    result.setSeconds(0);
    result.setMilliseconds(0);

    // Set minute and hour
    result.setMinutes(parseInt(minute));
    result.setHours(parseInt(hour));

    // If the resulting time is in the past, move to the next day
    if (result <= now) {
        result.setDate(result.getDate() + 1);
    }

    // Adjust for day of week if specified
    if (dayOfWeek !== '*') {
        const targetDay = parseInt(dayOfWeek);
        while (result.getDay() !== targetDay) {
            result.setDate(result.getDate() + 1);
        }
    }

    return result;
}

export function findNearestCronDate(cronExpressions) {
    const now = new Date();
    let nearestDate = null;

    cronExpressions.forEach(cronExpr => {
        try {
            const nextDate = parseCustomCron(cronExpr);
            if (nearestDate === null || nextDate < nearestDate) {
                nearestDate = nextDate;
            }
        } catch (err) {
            console.error(`Error parsing cron expression: ${cronExpr}`, err);
        }
    });

    return nearestDate;
}

export function timeUntilDate(targetDate) {
    const now = new Date();
    return targetDate.getTime() - now.getTime();
}
