const cds = require("@sap/cds");
const { isValidDateTimeRange, today } = require("./utils/date");

const MAX_END_DATE = "9999-12-31";

class AdminService extends cds.ApplicationService {
  async init() {
    const { Customers, Workers } = this.entities;

    /**
     * Set the mandatory `isNaturalPerson` flag to `false` before creating a new customer (by activating the draft).
     * Otherwise this can lead to errors.
     */
    this.before("CREATE", Customers, (req) => {
      if (req.data.isNaturalPerson === null) {
        req.data.isNaturalPerson = false;
      }
    });

    /**
     * Set defaults for `startDate` and `endDate` of a new worker.
     */
    this.before("CREATE", Workers, (req) => {
      const data = req.data;
      data.startDate = data.startDate || data.endDate || today();
      data.endDate = data.endDate || MAX_END_DATE;
    });

    /**
     * Validate a worker's `startDate` and `endDate` before a draft is activated.
     */
    this.before("SAVE", Workers, (req) => {
      const { startDate, endDate } = req.data;
      if (!startDate || !endDate) {
        return req.reject(400, "Start date and end date are mandatory");
      }
      if (!isValidDateTimeRange(startDate, endDate)) {
        return req.reject(400, "Start date must be lower or equal to end date");
      }
    });

    /**
     * POST /Customers/{id}/archive
     */
    this.on("archive", Customers, async (req) => {
      const customers = await req.query;
      if (!customers.length) {
        return req.reject(404);
      }

      const db = await cds.connect.to("db");
      const dbEntities = db.entities("rwitt.tour.masterdata");
      await db
        .update(dbEntities.Customers, customers[0].ID)
        .set({ isArchived: true });

      return this.read(Customers, customers[0].ID);
    });

    await super.init();
  }
}

module.exports = { AdminService };
