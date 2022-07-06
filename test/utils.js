const cds = require("@sap/cds/lib");
const { GET, POST, PATCH, DELETE, axios, expect } = cds.test(__dirname + "/..");
const EDIT = (url) => POST(`${url}/draftEdit`, {});
const SAVE = (url) => POST(`${url}/draftActivate`);

if (cds.User.default) {
  cds.User.default = cds.User.Privileged;
} else {
  cds.User = cds.User.Privileged;
}

axios.defaults.validateStatus = () => true;

module.exports = { GET, POST, PATCH, DELETE, EDIT, SAVE, expect };
