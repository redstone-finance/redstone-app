import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from "date-fns";
import { parseExpression } from "cron-parser";

export const hexToDate = (timestamp) => {
  if (timestamp === 0) return false;
  const timeInSeconds = parseInt(timestamp, 16);
  const timeInMilliseconds = timeInSeconds * 1000;
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  };

  const formattedDate = new Date(timeInMilliseconds).toLocaleString(
    "en-US",
    options
  );
  return formattedDate.replace(",", "") + " " + options.timeZone;
};

export const parseUnixTime = (time) => {
  if (time == 0) return undefined;
  return timeSince(new Date(time * 1000));
};

function timeSince(date) {
  const now = new Date();
  const seconds = differenceInSeconds(now, date);

  if (differenceInYears(now, date) >= 1) {
    return `${differenceInYears(now, date)} years`;
  }
  if (differenceInMonths(now, date) >= 1) {
    return `${differenceInMonths(now, date)} months`;
  }
  if (differenceInDays(now, date) >= 1) {
    return `${differenceInDays(now, date)} days`;
  }
  if (differenceInHours(now, date) >= 1) {
    return `${differenceInHours(now, date)} hours`;
  }
  if (differenceInMinutes(now, date) >= 1) {
    return `${differenceInMinutes(now, date)} minutes`;
  }
  return `${seconds} seconds`;
}
export function getTimeUntilNextHeartbeat(
  lastHeartbeatItem,
  heartbeatInterval
) {
  const lastHeartbeatTimestamp = lastHeartbeatItem * 1000;
  const now = Date.now();
  const timeSinceLastHeartbeat = now - lastHeartbeatTimestamp;
  if (timeSinceLastHeartbeat >= heartbeatInterval) {
    return 0;
  }
  const timeUntilNextHeartbeat = heartbeatInterval - timeSinceLastHeartbeat;
  return timeUntilNextHeartbeat;
}

export function parseCustomCron(cronExpr) {
  try {
    const options = {
      currentDate: new Date(),
      utc: true, // Assuming UTC, adjust if needed
    };

    const interval = parseExpression(cronExpr, options);
    return interval.next().toDate();
  } catch (err) {
    console.error(`Error parsing cron expression: ${cronExpr}`, err);
    return null;
  }
}

export function findNearestCronDate(cronExpressions) {
  const now = new Date();
  let nearestDate = null;

  cronExpressions.forEach((cronExpr) => {
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
