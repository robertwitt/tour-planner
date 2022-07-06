const { GET, POST, PATCH, DELETE, EDIT, SAVE, expect } = require("./utils");

describe("Planning service", () => {
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

  it("returns customers with name and address expanded from visits", async () => {
    const {
      status,
      data: { customer },
    } = await GET`/planning/Visits(ID=e79acf91-8eda-4fb7-9360-c1e5cf8a69ca,IsActiveEntity=true)?$expand=customer`;
    expect(status).to.equal(200);
    expect(customer).to.contain({
      formattedName: "Max Mustermann",
      mainAddress_formatted: "Georg-Hermann-Allee 99, 14469 Potsdam, Germany",
    });
  });

  it("returns workers with name", async () => {
    const { status, data } = await GET`/planning/Workers?$select=formattedName`;
    expect(status).to.equal(200);
    expect(data.value).to.containSubset([{ formattedName: "John Doe" }]);
  });

  it("returns workers with name expanded from tours", async () => {
    const {
      status,
      data: { worker },
    } = await GET`/planning/Tours(ID=6466ef4a-fc3d-11ec-b939-0242ac120002,IsActiveEntity=true)?$expand=worker`;
    expect(status).to.equal(200);
    expect(worker).to.contain({ formattedName: "John Doe" });
  });

  it("can create visits with computed duration and default status", async () => {
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
      status_code: "I",
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
});
