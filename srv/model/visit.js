const {
  durationInHours,
  dateTime,
  isValidDateTimeRange,
  time,
  dateTimePlusHours,
} = require("../utils/date");
const { ExecutionStatus } = require("./executionStatus");

class Visit {
  constructor(data) {
    this._data = data;
  }

  get duration() {
    const start = dateTime(this._data.visitDate, this._data.startTime);
    const end = dateTime(this._data.visitDate, this._data.endTime);
    return durationInHours(start, end);
  }

  get endTime() {
    const start = dateTime(this._data.visitDate, this._data.startTime);
    return time(dateTimePlusHours(start, this._data.duration));
  }

  get isClosed() {
    return [
      ExecutionStatus.STATUS_COMPLETED,
      ExecutionStatus.STATUS_CANCELLED,
    ].includes(this._data.status_code);
  }

  get isValid() {
    const start = dateTime(this._data.visitDate, this._data.startTime);
    const end = dateTime(this._data.visitDate, this._data.endTime);
    return isValidDateTimeRange(start, end);
  }
}

module.exports = { Visit };
