const cds = require("@sap/cds/lib");
const { GET, POST, DELETE, axios, expect } = cds.test(__dirname + "/..");

describe("Admin service", () => {
  let validateStatus;

  beforeAll(() => {
    validateStatus = axios.defaults.validateStatus;
    axios.defaults.validateStatus = () => true;
  });

  afterAll(() => {
    axios.defaults.validateStatus = validateStatus;
  });

  it("returns a list of countries", async () => {
    const { status, data } = await GET`/admin/Countries`;
    expect(status).to.equal(200);
    expect(data.value).to.containSubset([
      { code: "DE", name: "Germany" },
      { code: "AT", name: "Austria" },
      { code: "CH", name: "Switzerland" },
    ]);
  });

  it("cannot create countries", async () => {
    const { status } = await POST(`/admin/Countries`, {
      code: "FR",
      name: "France",
    });
    expect(status).to.equal(405);
  });

  it("returns a list of non-archived customers", async () => {
    const { status, data } =
      await GET`/admin/Customers?$filter=isArchived eq false&$select=name1,name2,isNaturalPerson,mainAddress_city,mainAddress_postalCode,mainAddress_addressLine,isArchived&$expand=mainAddress_country`;
    expect(status).to.equal(200);
    expect(data.value).to.containSubset([
      {
        name1: "Mustermann",
        name2: "Max",
        isNaturalPerson: true,
        mainAddress_city: "Potsdam",
        mainAddress_postalCode: "14469",
        mainAddress_addressLine: "Georg-Hermann-Allee 99",
        mainAddress_country: {
          code: "DE",
          name: "Germany",
        },
      },
    ]);
  });

  it("can create new customers", async () => {
    const { status, data } = await POST(`/admin/Customers`, {
      name1: "SAP",
      isNaturalPerson: false,
      mainAddress_country_code: "DE",
      mainAddress_city: "Potsdam",
      mainAddress_postalCode: "14469",
      mainAddress_addressLine: "Konrad-Zuse-Ring 10",
    });
    expect(status).to.equal(201);
    expect(data.name1).to.equal("SAP");
    expect(data.isNaturalPerson).to.equal(false);
    expect(data.mainAddress_country_code).to.equal("DE");
    expect(data.isArchived).to.equal(false);
  });

  it("can create new customers", async () => {
    const { status, data } = await POST(`/admin/Customers`, {
      name1: "SAP",
      isNaturalPerson: false,
      mainAddress_country_code: "DE",
      mainAddress_city: "Potsdam",
      mainAddress_postalCode: "14469",
      mainAddress_addressLine: "Konrad-Zuse-Ring 10",
    });
    expect(status).to.equal(201);
    expect(data).to.contain({
      name1: "SAP",
      isNaturalPerson: false,
      mainAddress_country_code: "DE",
      mainAddress_city: "Potsdam",
      mainAddress_postalCode: "14469",
      mainAddress_addressLine: "Konrad-Zuse-Ring 10",
      isArchived: false,
    });
  });

  it("ignores readonly fields when creating customers", async () => {
    const { status, data } = await POST(`/admin/Customers`, {
      name1: "SAP",
      isNaturalPerson: false,
      mainAddress_country_code: "DE",
      mainAddress_city: "Potsdam",
      mainAddress_postalCode: "14469",
      mainAddress_addressLine: "Konrad-Zuse-Ring 10",
      isArchived: true,
    });
    expect(status).to.equal(201);
    expect(data).to.contain({
      name1: "SAP",
      isNaturalPerson: false,
      mainAddress_country_code: "DE",
      mainAddress_city: "Potsdam",
      mainAddress_postalCode: "14469",
      mainAddress_addressLine: "Konrad-Zuse-Ring 10",
      isArchived: false,
    });
  });

  it("canot create customers with missing mandatory properties", async () => {
    const { status } = await POST(`/admin/Customers`, {
      name1: "SAP",
      isNaturalPerson: false,
      mainAddress_city: "Potsdam",
      mainAddress_postalCode: "14469",
      mainAddress_addressLine: "Konrad-Zuse-Ring 10",
    });
    expect(status).to.equal(400);
  });

  it("cannot delete customers", async () => {
    const { status } =
      await DELETE`/admin/Customers/20627858-46e5-4d15-88fd-286d15cbd193`;
    expect(status).to.equal(405);
  });
});
