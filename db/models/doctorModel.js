const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
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
	dob: {
		type: String,
		default: '',
	},
	image: {
		type: String,
		default: '',
	},
	gender: {
		type: String,
		default: 'male',
	},
	phone: {
		type: String,
		default: '9999999999',
	},
	specialization: {
		type: String,
		default: '',
	},
	description: {
		type: String,
		default: '',
	},
	rating: {
		type: String,
		default: '4.5',
	},
});

module.exports = mongoose.model('Doctor', doctorSchema);