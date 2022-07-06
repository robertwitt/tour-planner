/**
 * Checks whether a given `column` is already selected by `columns`.
 * @param {array} columns an array of CQN columns
 * @param {string} column a column's name
 * @param {string} expand name of an expanded elemenr
 * @returns `true` if the column is already selected, `false` otherwise
 */
function isSelected(columns, column, expand) {
  if (!columns) {
    return expand === undefined;
  }
  if (columns[0] === "*" && !expand) {
    return true;
  }
  const expandedColumn = columns.find((c) => c.expand && c.ref[0] === expand);
  if (expandedColumn) {
    return isSelected(expandedColumn.expand, column);
  }
  return columns.some((c) => (c.ref && c.ref[0] === column) || c.as === column);
}

module.exports = { isSelected };
