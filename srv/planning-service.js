const cds = require("@sap/cds");
const { ExecutionStatus } = require("./model/executionStatus");
const { Visit } = require("./model/visit");
const { isSelected } = require("./utils/cqn");
const {
  durationInHours,
  dateTime,
  isValidDateTimeRange,
  time,
  dateTimePlusHours,
} = require("./utils/date");
const { StringBuilder } = require("./utils/strings");

class PlanningService extends cds.ApplicationService {
  async init() {
    const { Customers, Tours, Visits, Workers } = this.entities;

    /**
     * Select additional columns required to compute fields in the customer.
     */
    this.before("READ", Customers, (req) => {
      const query = req.query;
      if (isSelected(query.SELECT.columns, "formattedName")) {
        this._select("name1", query);
        this._select("name2", query);
        this._select("isNaturalPerson", query);
      }
      if (isSelected(query.SELECT.columns, "mainAddress_formatted")) {
        this._select("mainAddress_addressLine", query);
        this._select("mainAddress_postalCode", query);
        this._select("mainAddress_city", query);
        this._select("mainAddress_country_name", query);
      }
    });

    /**
     * Select additional columns required to compute fields in the tour.
     */
    this.before("READ", Tours, (req) => {
      const query = req.query;
      if (isSelected(query.SELECT.columns, "formattedName", "worker")) {
        this._select("firstName", query, "worker");
        this._select("lastName", query, "worker");
      }
    });

    /**
     * Select additional columns required to compute fields in the visit.
     */
    this.before("READ", Visits, (req) => {
      const query = req.query;
      if (isSelected(query.SELECT.columns, "formattedName", "customer")) {
        this._select("name1", query, "customer");
        this._select("name2", query, "customer");
        this._select("isNaturalPerson", query, "customer");
      }
      if (
        isSelected(query.SELECT.columns, "mainAddress_formatted", "customer")
      ) {
        this._select("mainAddress_addressLine", query, "customer");
        this._select("mainAddress_postalCode", query, "customer");
        this._select("mainAddress_city", query, "customer");
        this._select("mainAddress_country_name", query, "customer");
      }
    });

    /**
     * Set default values when creating visits.
     */
    this.before("CREATE", Visits, (req) => {
      req.data.status_code = ExecutionStatus.STATUS_INITIAL;
    });

    /**
     * Validate a visit's status before editing it.
     */
    this.before("EDIT", Visits, async (req) => {
      const visits = await req.query;
      if (!visits.length) {
        return req.reject(404);
      }

      if (new Visit(visits[0]).isClosed) {
        return req.reject(
          400,
          "Completed or cancelled visits cannot be edited anymore."
        );
      }
    });

    /**
     * Reset a visit's end-time if the start-time was changed.
     */
    this.before("PATCH", Visits, async (req) => {
      const data = req.data;
      if (!data.startTime || (data.startTime && data.endTime)) {
        return;
      }

      const query = SELECT.one
        .from(req.query.UPDATE.entity)
        .columns("visitDate", "duration");
      const { visitDate, duration } = await this.tx(req).run(query);

      data.endTime = time(
        dateTimePlusHours(dateTime(visitDate, data.startTime), duration)
      );
    });

    /**
     * Set computed valued when creating or updating visits.
     */
    this.before(["CREATE", "UPDATE"], Visits, (req) => {
      const data = req.data;

      if (
        !this._isValidDateRange(data.visitDate, data.startTime, data.endTime)
      ) {
        return req.reject(400, "Start time must be lower or equal to end time");
      }

      data.duration = this._calculateDuration(
        data.visitDate,
        data.startTime,
        data.endTime
      );
    });

    /**
     * Prohibit deletion of closed visits.
     */
    this.before("DELETE", Visits, async (req) => {
      const query = SELECT.one
        .from(req.query.DELETE.from)
        .columns("status_code");
      const visit = await this.tx(req).run(query);
      if (!visit) {
        return req.reject(404);
      }

      if (new Visit(visit).isClosed) {
        return req.reject(
          400,
          "Completed or cancelled visits cannot be edited anymore."
        );
      }
    });

    /**
     * Select additional columns required to compute fields in the worker.
     */
    this.before("READ", Workers, (req) => {
      const query = req.query;
      if (isSelected(query.SELECT.columns, "formattedName")) {
        this._select("firstName", query);
        this._select("lastName", query);
      }
    });

    /**
     * Compute read-only fields in the customer.
     */
    this.after("READ", Customers, (results, req) => {
      if (isSelected(req.query.SELECT.columns, "formattedName")) {
        this._setCustomerName(results);
      }
      if (isSelected(req.query.SELECT.columns, "mainAddress_formatted")) {
        this._setCustomerAddress(results);
      }
    });

    /**
     * Compute read-only fields in the tour.
     */
    this.after("READ", Tours, (results, req) => {
      if (isSelected(req.query.SELECT.columns, "formattedName", "worker")) {
        results = Array.isArray(results) ? results : [results];
        results.forEach((r) => {
          this._setWorkerName(r.worker);
        });
      }
    });

    /**
     * Compute read-only fields in visit.
     */
    this.after("READ", Visits, (results, req) => {
      const isNameSelected = isSelected(
        req.query.SELECT.columns,
        "formattedName",
        "customer"
      );
      const isAddressSelected = isSelected(
        req.query.SELECT.columns,
        "mainAddress_formatted",
        "customer"
      );
      results = Array.isArray(results) ? results : [results];
      results.forEach((r) => {
        if (isNameSelected) {
          this._setCustomerName(r.customer);
        }
        if (isAddressSelected) {
          this._setCustomerAddress(r.customer);
        }
      });
    });

    /**
     * Compute read-only fields in the worker.
     */
    this.after("READ", Workers, (results, req) => {
      if (isSelected(req.query.SELECT.columns, "formattedName")) {
        this._setWorkerName(results);
      }
    });

    await super.init();
  }

  _select(column, query, expand) {
    if (isSelected(query.SELECT.columns, column, expand)) {
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

  _isValidDateRange(date, startTime, endTime) {
    return isValidDateTimeRange(
      dateTime(date, startTime),
      dateTime(date, endTime)
    );
  }

  _calculateDuration(date, startTime, endTime) {
    return durationInHours(dateTime(date, startTime), dateTime(date, endTime));
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
