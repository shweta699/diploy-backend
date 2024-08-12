const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./User');
const Note = require('./Note');

const SharedAccess = sequelize.define('SharedAccess', {
    permission: {
        type: DataTypes.ENUM('read', 'write'),
        allowNull: false,
    },
});

SharedAccess.belongsTo(User);
SharedAccess.belongsTo(Note);

module.exports = SharedAccess;
