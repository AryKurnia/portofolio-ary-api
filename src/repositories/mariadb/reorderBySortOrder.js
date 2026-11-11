// Menyimpan sort_order = indeks + 1 untuk setiap id, dalam satu transaksi.
const reorderBySortOrder = (model, orderedIds, extraWhere = {}) =>
  model.sequelize.transaction(async (transaction) => {
    for (const [index, id] of orderedIds.entries()) {
      await model.update({ sortOrder: index + 1 }, { where: { id, ...extraWhere }, transaction });
    }
  });

module.exports = reorderBySortOrder;
