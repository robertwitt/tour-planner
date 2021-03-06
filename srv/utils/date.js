const { DateTime, Interval } = require("luxon");

/**
 * Constructs an ISO date-time string from a date and time.
 * @param {string} date an ISO date as string, e. g. "2022-07-06"
 * @param {string} time an ISO time as string, e. g. "09:30:00"
 * @returns an ISO date-time as string
 */
function dateTime(date, time) {
  return `${date}T${time}`;
}

/**
 * Adds a duration in hours to a given date-time and returns the new value.
 * @param {string} dateTime an ISO date-time string
 * @param {number} hours a duration in hours
 * @returns a date-time string
 */
function dateTimePlusHours(dateTime, hours) {
  return DateTime.fromISO(dateTime).plus({ hours }).toISO();
}

/**
 * Calculates and returns the duration between a start and end date-time in hours.
 * @param {string} start a date-time string
 * @param {end} end a date-time string
 * @returns the duration between `start` and `end` in hours
 */
function durationInHours(start, end) {
  const startDateTime = DateTime.fromISO(start);
  const endDateTime = DateTime.fromISO(end);
  return Interval.fromDateTimes(startDateTime, endDateTime).length("hours");
}

/**
 * Validates a given date(-time) range, i. e. whether or not the end is on or after the start.
 * @param {string} start a date or date-time string
 * @param {string} end a date or date-time string
 * @returns `true` whether the range is valid, `false` otherwise
 */
function isValidDateTimeRange(start, end) {
  return DateTime.fromISO(start) <= DateTime.fromISO(end);
}

/**
 * Returns the time part from a date-time string.
 * @param {string} dateTime a date-time string
 * @returns the time as string
 */
function time(dateTime) {
  return dateTime.slice(11, 19);
}

/**
 * Returns today's date as ISO date.
 * @returns today's date in ISO format
 */
function today() {
  return DateTime.now().toISODate();
}

module.exports = {
  dateTime,
  dateTimePlusHours,
  durationInHours,
  isValidDateTimeRange,
  time,
  today,
};
