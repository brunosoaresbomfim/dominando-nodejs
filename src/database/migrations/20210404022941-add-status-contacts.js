module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("contacts", "status", {
      type: Sequelize.ENUM("ACTIVE", "ARCHIVED"),
      defaultValue: "ACTIVE",
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn("contacts", "status", {transaction});
      await queryInterface.sequelize.query("DROP TYPE enum_contacts_status", {transaction});
    });
}
};
