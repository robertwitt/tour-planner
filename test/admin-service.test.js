const { DateTime } = require("luxon");
const cds = require("@sap/cds/lib");
const { GET, POST, PATCH, DELETE, axios, expect } = cds.test(__dirname + "/..");
const EDIT = (url) => POST(`${url}/draftEdit`, {});
const SAVE = (url) => POST(`${url}/draftActivate`);

if (cds.User.default) {
  cds.User.default = cds.User.Privileged;
} else {
  cds.User = cds.User.Privileged;
}

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
    const { data: draft } = await POST(`/admin/Customers`, {
      name1: "SAP",
      isNaturalPerson: false,
      mainAddress_country_code: "DE",
      mainAddress_city: "Potsdam",
      mainAddress_postalCode: "14469",
      mainAddress_addressLine: "Konrad-Zuse-Ring 10",
    });
    expect(draft.ID).to.not.equal(undefined);
    const { status, data } = await SAVE(
      `admin/Customers(ID=${draft.ID},IsActiveEntity=false)`
    );
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
    const { data: draft } = await POST(`/admin/Customers`, {
      name1: "SAP",
      isNaturalPerson: false,
      mainAddress_country_code: "DE",
      mainAddress_city: "Potsdam",
      mainAddress_postalCode: "14469",
      mainAddress_addressLine: "Konrad-Zuse-Ring 10",
      isArchived: true,
    });
    expect(draft.ID).to.not.equal(undefined);
    const { status, data } = await SAVE(
      `admin/Customers(ID=${draft.ID},IsActiveEntity=false)`
    );
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

  it("cannot create customers with missing mandatory properties", async () => {
    const { data: draft } = await POST(`/admin/Customers`, {
      name1: "SAP",
      isNaturalPerson: false,
      mainAddress_city: "Potsdam",
      mainAddress_postalCode: "14469",
      mainAddress_addressLine: "Konrad-Zuse-Ring 10",
    });
    expect(draft.ID).to.not.equal(undefined);
    const { status } = await SAVE(
      `admin/Customers(ID=${draft.ID},IsActiveEntity=false)`
    );
    expect(status).to.equal(400);
  });

  it("cannot delete customers", async () => {
    const { status } =
      await DELETE`/admin/Customers(ID=20627858-46e5-4d15-88fd-286d15cbd193,IsActiveEntity=true)`;
    expect(status).to.equal(405);
  });

  it("can archive customers", async () => {
    const { data: draft } = await POST("/admin/Customers", {
      name1: "SAP",
      isNaturalPerson: false,
      mainAddress_country_code: "DE",
      mainAddress_city: "Potsdam",
      mainAddress_postalCode: "14469",
      mainAddress_addressLine: "Konrad-Zuse-Ring 10",
    });
    expect(draft.ID).to.not.equal(undefined);
    const { data } = await SAVE(
      `admin/Customers(ID=${draft.ID},IsActiveEntity=false)`
    );
    expect(data.ID).to.not.equal(undefined);
    expect(data.isArchived).to.equal(false);
    const {
      status,
      data: { isArchived },
    } = await POST(
      `/admin/Customers(ID=${data.ID},IsActiveEntity=true)/archive`,
      {}
    );
    expect(status).to.equal(200);
    expect(isArchived).to.equal(true);
  });

  it("fails archiving unknown customers", async () => {
    const { status } = await POST(
      "/admin/Customers(ID=00000000-0000-0000-0000-000000000001,IsActiveEntity=true)/archive",
      {}
    );
    expect(status).to.equal(404);
  });

  it("can create workers", async () => {
    const { data: draft } = await POST(`/admin/Workers`, {
      ID: "A",
      lastName: "Doe",
      firstName: "Jane",
      startDate: "2022-01-01",
      endDate: "2025-10-31",
    });
    expect(draft.ID).to.not.equal(undefined);
    const { status, data } = await SAVE(
      `admin/Workers(ID='${draft.ID}',IsActiveEntity=false)`
    );
    expect(status).to.equal(201);
    expect(data).to.contain({
      ID: "A",
      lastName: "Doe",
      firstName: "Jane",
      startDate: "2022-01-01",
      endDate: "2025-10-31",
    });
  });

  it("can create workers with default dates", async () => {
    const { data: draft } = await POST(`/admin/Workers`, {
      ID: "B",
      lastName: "Doe",
      firstName: "Jane",
    });
    expect(draft.ID).to.not.equal(undefined);
    const { status, data } = await SAVE(
      `admin/Workers(ID='${draft.ID}',IsActiveEntity=false)`
    );
    expect(status).to.equal(201);
    expect(data).to.contain({
      ID: "B",
      lastName: "Doe",
      firstName: "Jane",
      startDate: DateTime.now().toISODate(),
      endDate: "9999-12-31",
    });
  });

  it("cannot create workers where end is before start date", async () => {
    const { data: draft } = await POST(`/admin/Workers`, {
      ID: "C",
      lastName: "Doe",
      startDate: "2022-01-01",
      endDate: "2021-10-31",
    });
    expect(draft.ID).to.not.equal(undefined);
    const { status } = await SAVE(
      `admin/Workers(ID='${draft.ID}',IsActiveEntity=false)`
    );
    expect(status).to.equal(400);
  });

  it("can create workers only for one day", async () => {
    const { data: draft } = await POST(`/admin/Workers`, {
      ID: "D",
      lastName: "Doe",
      startDate: "2022-06-30",
      endDate: "2025-06-30",
    });
    expect(draft.ID).to.not.equal(undefined);
    const { status, data } = await SAVE(
      `admin/Workers(ID='${draft.ID}',IsActiveEntity=false)`
    );
    expect(status).to.equal(201);
    expect(data).to.contain({
      ID: "D",
      lastName: "Doe",
      startDate: "2022-06-30",
      endDate: "2025-06-30",
    });
  });

  it("can create workers with end date and default start date", async () => {
    const { data: draft } = await POST(`/admin/Workers`, {
      ID: "E",
      lastName: "Doe",
      endDate: "2022-01-30",
    });
    expect(draft.ID).to.not.equal(undefined);
    const { status, data } = await SAVE(
      `admin/Workers(ID='${draft.ID}',IsActiveEntity=false)`
    );
    expect(status).to.equal(201);
    expect(data).to.contain({
      ID: "E",
      lastName: "Doe",
      startDate: "2022-01-30",
      endDate: "2022-01-30",
    });
  });

  it("can update workers' end dates", async () => {
    await POST(`/admin/Workers`, {
      ID: "F",
      lastName: "Doe",
    });
    await SAVE(`admin/Workers(ID='F',IsActiveEntity=false)`);

    await EDIT(`/admin/Workers(ID='F',IsActiveEntity=true)`);
    await PATCH(`/admin/Workers(ID='F',IsActiveEntity=false)`, {
      endDate: "2099-12-30",
    });
    const {
      status,
      data: { endDate },
    } = await SAVE(`admin/Workers(ID='F',IsActiveEntity=false)`);
    expect(status).to.equal(201);
    expect(endDate).to.equal("2099-12-30");
  });

  it("can update workers' start dates", async () => {
    await POST(`/admin/Workers`, {
      ID: "G",
      lastName: "Doe",
    });
    await SAVE(`admin/Workers(ID='G',IsActiveEntity=false)`);

    await EDIT(`/admin/Workers(ID='G',IsActiveEntity=true)`);
    await PATCH(`/admin/Workers(ID='G',IsActiveEntity=false)`, {
      startDate: "2022-06-01",
    });
    const {
      status,
      data: { startDate },
    } = await SAVE(`admin/Workers(ID='G',IsActiveEntity=false)`);
    expect(status).to.equal(201);
    expect(startDate).to.equal("2022-06-01");
  });

  it("cannot update workers' end dates before start dates", async () => {
    await POST(`/admin/Workers`, {
      ID: "H",
      lastName: "Doe",
      startDate: "2022-06-15",
      endDate: "2022-06-30",
    });
    await SAVE(`admin/Workers(ID='H',IsActiveEntity=false)`);

    await EDIT(`/admin/Workers(ID='H',IsActiveEntity=true)`);
    await PATCH(`/admin/Workers(ID='H',IsActiveEntity=false)`, {
      endDate: "2022-05-10",
    });
    const { status } = await SAVE(`admin/Workers(ID='H',IsActiveEntity=false)`);
    expect(status).to.equal(400);
  });

  it("cannot update workers' start dates after end dates", async () => {
    await POST(`/admin/Workers`, {
      ID: "I",
      lastName: "Doe",
      startDate: "2022-06-15",
      endDate: "2022-06-30",
    });
    await SAVE(`admin/Workers(ID='I',IsActiveEntity=false)`);

    await EDIT(`/admin/Workers(ID='I',IsActiveEntity=true)`);
    await PATCH(`/admin/Workers(ID='I',IsActiveEntity=false)`, {
      startDate: "2022-07-10",
    });
    const { status } = await SAVE(`admin/Workers(ID='I',IsActiveEntity=false)`);
    expect(status).to.equal(400);
  });
});
