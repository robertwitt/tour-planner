const cds = require("@sap/cds");
const { DateTime, Interval } = require("luxon");
const { ExecutionStatus } = require("./model/executionStatus");
const { isProjected } = require("./utils/cqn");
const { StringBuilder } = require("./utils/strings");

class PlanningService extends cds.ApplicationService {
  async init() {
    const { Customers, Tours, Visits, Workers } = this.entities;

    /**
     * Select additional columns required to compute fields in the customer.
     */
    this.before("READ", Customers, (req) => {
      this._select("name1", req.query);
      this._select("name2", req.query);
      this._select("isNaturalPerson", req.query);
      this._select("mainAddress_addressLine", req.query);
      this._select("mainAddress_postalCode", req.query);
      this._select("mainAddress_city", req.query);
      this._select("mainAddress_country_name", req.query);
    });

    /**
     * Select additional columns required to compute fields in the tour.
     */
    this.before("READ", Tours, (req) => {
      this._select("firstName", req.query, "worker");
      this._select("lastName", req.query, "worker");
    });

    /**
     * Select additional columns required to compute fields in the visit.
     */
    this.before("READ", Visits, (req) => {
      this._select("name1", req.query, "customer");
      this._select("name2", req.query, "customer");
      this._select("isNaturalPerson", req.query, "customer");
      this._select("mainAddress_addressLine", req.query, "customer");
      this._select("mainAddress_postalCode", req.query, "customer");
      this._select("mainAddress_city", req.query, "customer");
      this._select("mainAddress_country_name", req.query, "customer");
    });

    /**
     * Set default values when creating visits.
     */
    this.before("CREATE", Visits, (req) => {
      const data = req.data;
      data.duration = this._calculateDuration(
        data.visitDate,
        data.startTime,
        data.endTime
      );
      data.status_code = ExecutionStatus.STATUS_INITIAL;
    });

    /**
     * Select additional columns required to compute fields in the worker.
     */
    this.before("READ", Workers, (req) => {
      this._select("firstName", req.query);
      this._select("lastName", req.query);
    });

    /**
     * Compute read-only fields in the customer.
     */
    this.after("READ", Customers, (results) => {
      this._setCustomerName(results);
      this._setCustomerAddress(results);
    });

    /**
     * Compute read-only fields in the tour.
     */
    this.after("READ", Tours, (results) => {
      results = Array.isArray(results) ? results : [results];
      results.forEach((r) => {
        this._setWorkerName(r.worker);
      });
    });

    /**
     * Compute read-only fields in visit.
     */
    this.after("READ", Visits, (results) => {
      results = Array.isArray(results) ? results : [results];
      results.forEach((r) => {
        this._setCustomerName(r.customer);
        this._setCustomerAddress(r.customer);
      });
    });

    /**
     * Compute read-only fields in the worker.
     */
    this.after("READ", Workers, (results) => {
      this._setWorkerName(results);
    });

    await super.init();
  }

  _calculateDuration(date, startTime, endTime) {
    const start = DateTime.fromISO(`${date}T${startTime}`);
    const end = DateTime.fromISO(`${date}T${endTime}`);
    return Interval.fromDateTimes(start, end).length("hours");
  }

  _select(column, query, expand) {
    if (isProjected(query.SELECT.columns, column, expand)) {
      return;
    }
    if (expand) {
      query.columns((b) => {
        b[expand]((e) => e[column]);
      });
    } else {
      query.columns(column);
    }
  }

  _setCustomerName(customers) {
    this._setComputedProperty(customers, (c) => {
      if (c.isNaturalPerson) {
        c.formattedName = new StringBuilder()
          .add(c.name2)
          .add(c.name1)
          .build(" ");
      } else {
        c.formattedName = new StringBuilder()
          .add(c.name1)
          .add(c.name2)
          .build(" - ");
      }
    });
  }

  _setCustomerAddress(customers) {
    this._setComputedProperty(customers, (c) => {
      c.mainAddress_formatted = new StringBuilder()
        .add(c.mainAddress_addressLine)
        .add(
          new StringBuilder()
            .add(c.mainAddress_postalCode)
            .add(c.mainAddress_city)
            .build(" ")
        )
        .add(c.mainAddress_country_name)
        .build(", ");
    });
  }

  _setWorkerName(workers) {
    this._setComputedProperty(workers, (w) => {
      w.formattedName = new StringBuilder()
        .add(w.firstName)
        .add(w.lastName)
        .build(" ");
    });
  }

  _setComputedProperty(results, setter) {
    results = Array.isArray(results) ? results : [results];
    results.forEach(setter);
  }
}

module.exports = { PlanningService };
