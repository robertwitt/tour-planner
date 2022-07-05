const cds = require("@sap/cds");
const { isProjected } = require("./utils/cqn");
const { StringBuilder } = require("./utils/strings");

class PlanningService extends cds.ApplicationService {
  async init() {
    const { Workers } = this.entities;

    /**
     * Select additional columns required to compute fields in the worker.
     */
    this.before("READ", Workers, (req) => {
      if (!isProjected(req.query.SELECT.columns, "firstName")) {
        req.query.columns("firstName");
      }
      if (!isProjected(req.query.SELECT.columns, "lastName")) {
        req.query.columns("lastName");
      }
    });

    /**
     * Compute read-only fields in the worker.
     */
    this.after("READ", Workers, (results) => {
      this._determineFormattedName(results);
    });

    await super.init();
  }

  _determineFormattedName(workers) {
    workers = Array.isArray(workers) ? workers : [workers];
    workers.forEach((w) => {
      w.formattedName = new StringBuilder()
        .add(w.firstName)
        .add(w.lastName)
        .build(" ");
    });
  }
}

module.exports = { PlanningService };
