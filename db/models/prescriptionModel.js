const mongoose = require('mongoose');

const prescriptionSchema = mongoose.Schema({
	date: {
		type: String,
		default: '',
	},
	treatment: {
		type: String,
		default: '',
	},
	prescription: {
		type: String,
		default: '',
	},
	issue: {
		type: String,
		default: '',
	},
	medicalReport: {
		type: String,
		default: '',
	},
	symptom: {
		type: String,
		default: '',
	},
	active: {
		type: Boolean,
		default: true,
	},
	doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
	patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
