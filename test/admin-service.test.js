const cds = require("@sap/cds/lib");
const { GET, expect } = cds.test(__dirname + "/..");

describe("Admin service", () => {
  it("returns a list of countries", async () => {
    const { status, data } = await GET`/admin/Countries`;
    expect(status).to.equal(200);
    expect(data.value).to.containSubset([
      { code: "DE", name: "Germany" },
      { code: "AT", name: "Austria" },
      { code: "CH", name: "Switzerland" },
    ]);
  });
});
