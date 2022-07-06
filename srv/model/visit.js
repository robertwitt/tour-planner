const { ExecutionStatus } = require("./executionStatus");

class Visit {
  constructor(data) {
    this._data = data;
  }

  get isClosed() {
    return [
      ExecutionStatus.STATUS_COMPLETED,
      ExecutionStatus.STATUS_CANCELLED,
    ].includes(this._data.status_code);
  }
}

module.exports = { Visit };
