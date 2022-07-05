const { expect } = require("chai");
const { StringBuilder } = require("../../srv/utils/strings");

describe("String builder", () => {
  it("build string", () => {
    expect(new StringBuilder().add("Hello").add("World").build(", ")).to.equal(
      "Hello, World"
    );
  });

  it("build nested string", () => {
    expect(
      new StringBuilder()
        .add(new StringBuilder().add("Hello").add("World").build(", "))
        .add("!")
        .build()
    ).to.equal("Hello, World!");
  });

  it("ignores null", () => {
    expect(
      new StringBuilder().add("Hello").add(null).add("World").build(", ")
    ).to.equal("Hello, World");
  });
});
