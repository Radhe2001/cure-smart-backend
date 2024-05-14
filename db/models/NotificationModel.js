const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
	mes: {
		type: String,
	},
	date: {
		type: String,
	},
});

module.exports = mongoose.model('Notification', notificationSchema);
