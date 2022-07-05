const cds = require("@sap/cds");
const { isProjected } = require("./utils/cqn");
const { StringBuilder } = require("./utils/strings");

class PlanningService extends cds.ApplicationService {
  async init() {
    const { Customers, Workers } = this.entities;

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
     * Select additional columns required to compute fields in the worker.
     */
    this.before("READ", Workers, (req) => {
      this._select("firstName", req.query);
      this._select("lastName", req.query);
    });

    /**
     * Compute read-only fields in the customer.
     */
    this.after("READ", Customers, (results, req) => {
      if (isProjected(req.query.SELECT.columns, "formattedName")) {
        this._setCustomerFormattedName(results, req.query);
      }
      if (isProjected(req.query.SELECT.columns, "formattedAddress")) {
        this._setCustomerFormattedAddress(results, req.query);
      }
    });

    /**
     * Compute read-only fields in the worker.
     */
    this.after("READ", Workers, (results, req) => {
      if (isProjected(req.query.SELECT.columns, "formattedName")) {
        this._setWorkerFormattedName(results, req.query);
      }
    });

    await super.init();
  }

  _select(column, query) {
    if (!isProjected(query.SELECT.columns, column)) {
      query.columns(column);
    }
  }

  _setCustomerFormattedName(customers, query) {
    this._setComputedProperty("formattedName", customers, query, (c) => {
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

  _setCustomerFormattedAddress(customers, query) {
    this._setComputedProperty("formattedAddress", customers, query, (c) => {
      c.formattedAddress = new StringBuilder()
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

  _setWorkerFormattedName(workers, query) {
    this._setComputedProperty("formattedName", workers, query, (w) => {
      w.formattedName = new StringBuilder()
        .add(w.firstName)
        .add(w.lastName)
        .build(" ");
    });
  }

  _setComputedProperty(property, results, query, setter) {
    if (!query.SELECT || !isProjected(query.SELECT.columns, property)) {
      return;
    }
    results = Array.isArray(results) ? results : [results];
    results.forEach(setter);
  }
}

module.exports = { PlanningService };
