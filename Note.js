const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./User');

const Note = sequelize.define('Note', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

Note.belongsTo(User, { as: 'creator' });

module.exports = Note;
