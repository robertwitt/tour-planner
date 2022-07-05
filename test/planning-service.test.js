const cds = require("@sap/cds/lib");
const { GET, POST, PATCH, DELETE, axios, expect } = cds.test(__dirname + "/..");
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

  it("returns customers with name", async () => {
    const { status, data } =
      await GET`/planning/Customers?$select=formattedName`;
    expect(status).to.equal(200);
    expect(data.value).to.containSubset([
      { formattedName: "Max Mustermann" },
      { formattedName: "SAP Innovation Center" },
    ]);
  });

  it("returns customers with address", async () => {
    const { status, data } =
      await GET`/planning/Customers?$select=mainAddress_formatted`;
    expect(status).to.equal(200);
    expect(data.value).to.containSubset([
      {
        mainAddress_formatted: "Georg-Hermann-Allee 99, 14469 Potsdam, Germany",
      },
      {
        mainAddress_formatted: "Konrad-Zuse-Ring 10, 14469 Potsdam, Germany",
      },
    ]);
  });

  it("returns workers with name", async () => {
    const { status, data } = await GET`/planning/Workers?$select=formattedName`;
    expect(status).to.equal(200);
    expect(data.value).to.containSubset([{ formattedName: "John Doe" }]);
  });

  it("can create visits with computed duration", async () => {
    const { data: draft } = await POST(`/planning/Visits`, {
      customer_ID: "20627858-46e5-4d15-88fd-286d15cbd193",
      visitDate: "2022-08-03",
      startTime: "08:00:00",
      endTime: "10:30:00",
    });
    expect(draft.ID).to.not.equal(undefined);
    const { status, data } = await SAVE(
      `/planning/Visits(ID=${draft.ID},IsActiveEntity=false)`
    );
    expect(status).to.equal(201);
    expect(data).to.contain({
      customer_ID: "20627858-46e5-4d15-88fd-286d15cbd193",
      visitDate: "2022-08-03",
      startTime: "08:00:00",
      endTime: "10:30:00",
      duration: 2.5,
      status_code: "O",
    });
  });

  it("cannot create visits with end time lower than start time", async () => {
    const { data: draft } = await POST(`/planning/Visits`, {
      customer_ID: "20627858-46e5-4d15-88fd-286d15cbd193",
      visitDate: "2022-08-03",
      startTime: "11:00:00",
      endTime: "10:30:00",
    });
    expect(draft.ID).to.not.equal(undefined);
    const { status } = await SAVE(
      `/planning/Visits(ID=${draft.ID},IsActiveEntity=false)`
    );
    expect(status).to.equal(400);
  });

  it("can update duration of visits", async () => {
    const { data: draft } = await POST(`/planning/Visits`, {
      customer_ID: "20627858-46e5-4d15-88fd-286d15cbd193",
      visitDate: "2022-08-03",
      startTime: "08:00:00",
      endTime: "10:30:00",
    });
    await SAVE(`/planning/Visits(ID=${draft.ID},IsActiveEntity=false)`);
    await EDIT(`/planning/Visits(ID=${draft.ID},IsActiveEntity=true)`);
    await PATCH(`/planning/Visits(ID=${draft.ID},IsActiveEntity=false)`, {
      startTime: "11:00:00",
      endTime: "14:00:00",
    });
    const {
      status,
      data: { duration },
    } = await SAVE(`/planning/Visits(ID=${draft.ID},IsActiveEntity=false)`);
    expect(status).to.equal(201);
    expect(duration).to.equal(3.0);
  });

  it("can update end time of visits", async () => {
    const { data: draft } = await POST(`/planning/Visits`, {
      customer_ID: "20627858-46e5-4d15-88fd-286d15cbd193",
      visitDate: "2022-08-03",
      startTime: "08:00:00",
      endTime: "10:30:00",
    });
    await SAVE(`/planning/Visits(ID=${draft.ID},IsActiveEntity=false)`);
    await EDIT(`/planning/Visits(ID=${draft.ID},IsActiveEntity=true)`);
    await PATCH(`/planning/Visits(ID=${draft.ID},IsActiveEntity=false)`, {
      startTime: "11:00:00",
    });
    const {
      status,
      data: { endTime },
    } = await SAVE(`/planning/Visits(ID=${draft.ID},IsActiveEntity=false)`);
    expect(status).to.equal(201);
    expect(endTime).to.equal("13:30:00");
  });

  it("cannot update completed visits", async () => {
    const { status } = await EDIT(
      `/planning/Visits(ID=e79acf91-8eda-4fb7-9360-c1e5cf8a69ca,IsActiveEntity=true)`
    );
    expect(status).to.equal(400);
  });

  it("can delete visits", async () => {
    const { data: draft } = await POST(`/planning/Visits`, {
      customer_ID: "20627858-46e5-4d15-88fd-286d15cbd193",
      visitDate: "2022-08-03",
      startTime: "08:00:00",
      endTime: "10:30:00",
    });
    await SAVE(`/planning/Visits(ID=${draft.ID},IsActiveEntity=false)`);
    const { status } = await DELETE(
      `/planning/Visits(ID=${draft.ID},IsActiveEntity=true)`
    );
    expect(status).to.equal(204);
  });

  it("cannot delete completed visits", async () => {
    const { status } = await DELETE(
      `/planning/Visits(ID=e79acf91-8eda-4fb7-9360-c1e5cf8a69ca,IsActiveEntity=true)`
    );
    expect(status).to.equal(400);
  });

  it("can create tours with stops", async () => {
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
      await GET`/planning/Tours(ID=${draft.ID},IsActiveEntity=true)?$expand=stops($expand=visit)`;
    expect(data).to.contain({
      tourDate: "2022-07-22",
      stops: [
        {
          visit_ID: "b9866484-1811-496e-bb0e-f0124a68c74a",
          visit: { status_code: "O" },
        },
        {
          visit_ID: "1b0d6519-1fbf-44fd-9bf3-cf08739503cc",
          visit: { status_code: "O" },
        },
      ],
    });
  });

  it("can add stops to existing tours", async () => {
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
      await GET`/planning/Tours(ID=6466ef4a-fc3d-11ec-b939-0242ac120002,IsActiveEntity=true)?$expand=stops($expand=visit)`;
    expect(data).to.contain({
      tourDate: "2022-07-06",
      stops: [
        {
          visit_ID: "42619951-0e05-45cc-b7cc-025674309164",
          visit: { status_code: "O" },
        },
        {
          visit_ID: "4841bc74-d95b-4721-922c-cfa64bd7604d",
          visit: { status_code: "O" },
        },
      ],
    });
  });
});
