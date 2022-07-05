const cds = require("@sap/cds/lib");
const { GET, POST, axios, expect } = cds.test(__dirname + "/..");
const EDIT = (url) => POST(`${url}/draftEdit`, {});
const SAVE = (url) => POST(`${url}/draftActivate`);

if (cds.User.default) {
  cds.User.default = cds.User.Privileged;
} else {
  cds.User = cds.User.Privileged;
}

describe("Planning service", () => {
  let validateStatus;

  beforeAll(() => {
    validateStatus = axios.defaults.validateStatus;
    axios.defaults.validateStatus = () => true;
  });

  afterAll(() => {
    axios.defaults.validateStatus = validateStatus;
  });

  it("returns customer name", async () => {
    const { status, data } =
      await GET`/planning/Customers?$select=formattedName`;
    expect(status).to.equal(200);
    expect(data.value).to.containSubset([
      { formattedName: "Max Mustermann" },
      { formattedName: "SAP Innovation Center" },
    ]);
  });

  it("returns customer address", async () => {
    const { status, data } =
      await GET`/planning/Customers?$select=formattedAddress`;
    expect(status).to.equal(200);
    expect(data.value).to.containSubset([
      { formattedName: "Georg-Hermann-Allee 99, 14469 Potsdam, Germany" },
      { formattedName: "Konrad-Zuse-Ring 10, 14469 Potsdam, Germany" },
    ]);
  });

  it("returns worker name", async () => {
    const { status, data } = await GET`/planning/Workers?$select=formattedName`;
    expect(status).to.equal(200);
    expect(data.value).to.containSubset([{ formattedName: "John Doe" }]);
  });

  it("returns visit duration", async () => {
    const { status, data } = await GET`/planning/Visits`;
    expect(status).to.equal(200);
    expect(data.value).to.containSubset([
      {
        visitDate: "2022-07-06",
        startTime: "08:00:00",
        endTime: "11:00:00",
        duration: 3.0,
      },
    ]);
  });

  it("returns visit duration with partial selection", async () => {
    const { status, data } =
      await GET`/planning/Visits?$select=startTime,duration`;
    expect(status).to.equal(200);
    expect(data.value).to.containSubset([
      { startTime: "08:00:00", duration: 3.0 },
    ]);
  });

  it("returns expanded visit", async () => {
    const { status, data } =
      await GET`/planning/Tours(ID=6466ef4a-fc3d-11ec-b939-0242ac120002,IsActiveEntity=true)/stops?$expand=visit`;
    expect(status).to.equal(200);
    expect(data.value).to.containSubset([
      {
        counter: 1,
        visit: {
          visitDate: "2022-07-06",
          startTime: "08:00:00",
          endTime: "11:00:00",
          duration: 3.0,
        },
      },
    ]);
  });

  it("cannot filter visit by duration", async () => {
    const { status } = await GET`/planning/Visit?$filter=duration gt 1`;
    expect(status).to.equal(400);
  });

  it("cannot update completed visit", async () => {
    const { status } = await EDIT(
      `/planning/Visits(ID=e79acf91-8eda-4fb7-9360-c1e5cf8a69ca,IsActiveEntity=true)`
    );
    expect(status).to.equal(400);
  });

  it("can create tour with tour stops", async () => {
    const { data: draft } = await POST(`/planning/Tours`, {
      worker_ID: "JD",
      tourDate: "2022-07-22",
      stops: [
        { visit_ID: "b9866484-1811-496e-bb0e-f0124a68c74a" },
        { visit_ID: "1b0d6519-1fbf-44fd-9bf3-cf08739503cc" },
      ],
    });
    expect(draft.ID).to.not.equal(undefined);
    const { status } = await SAVE(
      `/planning/Tours(ID=${draft.ID},IsActiveEntity=false)`
    );
    expect(status).to.equal(201);
    const { data } =
      await GET`/planning/Tours(ID=${draft.ID},IsActiveEntity=true)?$expand=stops`;
    expect(data).to.contain({
      tourDate: "2022-07-22",
      stops: [
        { counter: 1, visit_ID: "b9866484-1811-496e-bb0e-f0124a68c74a" },
        { counter: 2, visit_ID: "1b0d6519-1fbf-44fd-9bf3-cf08739503cc" },
      ],
    });
  });

  it("can add stop to existing tour", async () => {
    await EDIT(
      `/planning/Tours(ID=6466ef4a-fc3d-11ec-b939-0242ac120002,IsActiveEntity=true)`
    );
    await POST(
      `/planning/Tours(ID=6466ef4a-fc3d-11ec-b939-0242ac120002,IsActiveEntity=false)/stops`,
      { visit_ID: "4841bc74-d95b-4721-922c-cfa64bd7604d" }
    );
    const { status } = await SAVE(
      `/planning/Tours(ID=6466ef4a-fc3d-11ec-b939-0242ac120002,IsActiveEntity=false)`
    );
    expect(status).to.equal(201);
    const { data } =
      await GET`/planning/Tours(ID=6466ef4a-fc3d-11ec-b939-0242ac120002,IsActiveEntity=true)?$expand=stops`;
    expect(data).to.contain({
      tourDate: "2022-07-22",
      stops: [
        { counter: 1, visit_ID: "42619951-0e05-45cc-b7cc-025674309164" },
        { counter: 2, visit_ID: "4841bc74-d95b-4721-922c-cfa64bd7604d" },
      ],
    });
  });
});
