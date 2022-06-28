const cds = require("@sap/cds");

class AdminService extends cds.ApplicationService {
  async init() {
    const { Customers } = this.entities;

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
