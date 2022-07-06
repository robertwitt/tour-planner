class ExecutionStatus {
  static get STATUS_INITIAL() {
    return "I";
  }

  static get STATUS_COMPLETED() {
    return "C";
  }

  static get STATUS_CANCELLED() {
    return "X";
  }
}

module.exports = { ExecutionStatus };
