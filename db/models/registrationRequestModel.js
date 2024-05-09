const mongoose = require('mongoose');

const registrationRequestSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		default: '',
	},
	email: {
		type: String,
		required: true,
		default: 'a@example.com',
		unique: true,
	},
	password: {
		type: String,
		required: true,
		default: '',
	},
});

module.exports = mongoose.model(
	'RegistrationRequest',
	registrationRequestSchema
);
