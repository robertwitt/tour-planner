/**
 * Construct large strings by assembling from smaller pieces. Undefined or null string parts and separators are handled.
 */
class StringBuilder {
  constructor() {
    this._parts = [];
  }

  /**
   * Adds a part to the string to be build. Undefined or null values do not throw an error but are silently ignored.
   * @param {string | undefined | null} part a string or `undefined` or `null`
   * @returns the string builder instance
   */
  add(part) {
    if (part === undefined || part === null) {
      return this;
    }
    this._parts.push(part);
    return this;
  }

  /**
   * Builds and returns the string constructed by the parts.
   * @param {string | undefined} separator an optional separator, empty string if not specified
   * @returns the constructed string
   */
  build(separator) {
    return this._parts.join(separator || "");
  }
}

module.exports = { StringBuilder };
