const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
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
	gender: {
		type: String,
		default: 'male',
	},
	phone: {
		type: String,
		default: '9999999999',
	},
	language: {
		type: String,
		default: 'english',
	},
	address: {
		type: String,
		default: '',
	},
	bloodGroup: {
		type: String,
		default: 'O+',
	},
	height: {
		type: String,
		default: '160',
	},
	weight: {
		type: String,
		default: '60',
	},
	illness: {
		type: [String],
		default: [],
	},
	allergy: {
		type: [String],
		default: [],
	},
});

module.exports = mongoose.model('User', userSchema);
