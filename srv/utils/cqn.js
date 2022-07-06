function isProjected(columns, column, expand) {
  if (!columns) {
    return expand === undefined;
  }
  if (columns[0] === "*" && !expand) {
    return true;
  }
  const expandedColumn = columns.find((c) => c.expand && c.ref[0] === expand);
  if (expandedColumn) {
    return isProjected(expandedColumn.expand, column);
  }
  return columns.some((c) => (c.ref && c.ref[0] === column) || c.as === column);
}

module.exports = { isProjected };
