const cds = require("@sap/cds");

class AdminService extends cds.ApplicationService {
  async init() {
    const { Customers } = this.entities;

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
