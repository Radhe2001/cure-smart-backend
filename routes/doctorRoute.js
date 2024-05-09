const express = require('express');
const router = express.Router();
const RegistrationRequest = require('../db/models/registrationRequestModel');
const Prescription = require('../db/models/prescriptionModel');
const Doctor = require('../db/models/doctorModel');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
router.use(express.json());
require('dotenv').config();

router.get('/', (req, res) => {
	res.send('In user route');
});

router.post('/register', (req, res) => {
	const { body } = req;
	Doctor.find({ name: body.name, email: body.email })
		.then((user) => {
			if (user.length > 0) {
				res.status(400).json({ msg: 'User already exists' });
			} else {
				const user = new RegistrationRequest(body);
				user.save()
					.then((data) =>
						res
							.status(200)
							.json({ msg: 'User registered succcessfully' })
					)
					.catch((err) =>
						res
							.status(500)
							.json({ msg: 'Failed to add data to the database' })
					);
			}
		})
		.catch((err) =>
			res.status(402).json({ msg: 'Unexprected error occured' })
		);
});

router.post('/login', (req, res) => {
	Doctor.findOne({ email: req.body.email, password: req.body.password })
		.then((data) => {
			if (data) {
				const token = jwt.sign(
					{ id: data._id, email: data.email, name: data.name },
					process.env.SECRET
				);
				res.status(200).json({ token: token });
			} else res.status(400).json({ msg: 'No such Doctor exists' });
		})
		.catch((err) =>
			res
				.status(500)
				.json({ msg: 'Some error occured while fetching the data' })
		);
});

router.get('/get', (req, res) => {
	const authHeader = req.headers.authorization;
	let decodedVal = jwt.verify(authHeader, process.env.SECRET);
	Doctor.findOne({
		_id: decodedVal.id,
		email: decodedVal.email,
		name: decodedVal.name,
	})
		.then((data) => res.status(200).json({ msg: 'success', data: data }))
		.catch((err) => res.status(400).json({ msg: 'failure' }));
});

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, 'public/Images/');
	},
	filename: (req, file, callback) => {
		callback(
			null,
			file.fieldname + '_' + Date.now() + path.extname(file.originalname)
		);
	},
});

const upload = multer({
	storage,
});

router.post('/basicprofile', upload.single('file'), (req, res) => {
	const { body, file } = req;
	const authHeader = req.headers.authorization;
	let decodedVal = jwt.verify(authHeader, process.env.SECRET);
	const fileName = file ? file.filename : '';
	Doctor.updateOne(
		{ _id: decodedVal.id, email: decodedVal.email, name: decodedVal.name },
		{
			$set: {
				name: body.name,
				dob: body.dob,
				gender: body.gender,
				phone: body.phone,
				email: body.email,
				specialization: body.specialization,
				description: body.description,
				image: fileName,
			},
		}
	)
		.then((data) => res.status(200).json({ msg: 'success' }))
		.catch((err) => res.status(400).json({ msg: 'failure' }));
});

router.post('/setpassword', (req, res) => {
	const { body } = req;
	const authHeader = req.headers.authorization;
	let decodedVal = jwt.verify(authHeader, process.env.SECRET);
	Doctor.findOne({
		_id: decodedVal.id,
		email: decodedVal.email,
		name: decodedVal.name,
	})
		.then((user) => {
			if (user.password === body.oldPassword) {
				Doctor.updateOne(
					{
						_id: decodedVal.id,
						email: decodedVal.email,
						name: decodedVal.name,
					},
					{
						$set: {
							password: body.newPassword,
						},
					}
				)
					.then((data) =>
						res
							.status(200)
							.json({ mes: 'Password updated successfully' })
					)
					.catch((err) =>
						res
							.status(400)
							.json({ mes: 'Failed ot update password' })
					);
			} else res.status(500).json({ mes: 'Password mismatch' });
		})
		.catch((err) => res.status(402).json({ mes: 'Unauthorized access' }));
});

router.get('/detail/:id', (req, res) => {
	Doctor.findById(req.params.id)
		.then((data) => res.status(200).json({ user: data }))
		.catch((err) => res.status(500).json({ mes: "Doctor doesn't exists" }));
});

router.post(
	'/prescriptionRequest',
	upload.fields([
		{ name: 'symptoms', maxCount: 1 },
		{ name: 'test', maxCount: 1 },
	]),
	(req, res) => {
		const { body, files } = req;
		const authHeader = req.headers.authorization;
		let decodedVal = jwt.verify(authHeader, process.env.SECRET);
		Doctor.findOne({ name: body.doc })
			.then((data) => {
				const currentDate = new Date();
				const year = currentDate.getFullYear();
				const month = (currentDate.getMonth() + 1)
					.toString()
					.padStart(2, '0');
				const day = currentDate.getDate().toString().padStart(2, '0');
				const formattedDate = `${year}-${month}-${day}`;
				const prescription = new Prescription({
					date: formattedDate,
					treatment: data.specialization,
					issue: body.description,
					medicalReport: files['test'][0].filename,
					symptom: files['symptoms'][0].filename,
					doctor: data._id,
					patient: decodedVal.id,
				});
				prescription
					.save()
					.then((response) => {
						res.status(200).json({ data: response });
					})
					.catch((err) =>
						res
							.status(500)
							.json({ mes: 'Failed to save prescription' })
					);
			})
			.catch((err) =>
				res.status(500).json({ mes: 'some database error' })
			);
	}
);

router.get('/activeTreatment', (req, res) => {
	const authHeader = req.headers.authorization;
	let decodedVal = jwt.verify(authHeader, process.env.SECRET);
	Prescription.find({ doctor: decodedVal.id, active: true })
		.populate('patient', 'name')
		.then((data) => {
			res.status(200).json({ data: data });
		})
		.catch((err) => res.status(500).json({ mes: 'Some database error' }));
});

router.get('/pastTreatment', (req, res) => {
	const authHeader = req.headers.authorization;
	let decodedVal = jwt.verify(authHeader, process.env.SECRET);
	Prescription.find({ doctor: decodedVal.id, active: false })
		.populate('patient', 'name')
		.then((data) => {
			res.status(200).json({ data: data });
		})
		.catch((err) => res.status(500).json({ mes: 'Some database error' }));
});

router.post('/addPrescription', (req, res) => {
	const { body } = req;
	console.log(body);
	Prescription.updateOne(
		{ _id: body.id },
		{
			$set: {
				prescription: body.prescription,
				active: false,
			},
		}
	)
		.then((data) => {
			res.status(200).json({ msg: 'success' });
		})
		.catch((err) => res.status(400).json({ msg: 'failure' }));
});

router.get('/getActivePrescription/:id', (req, res) => {
	const id = req.params.id;
	Prescription.findById(id)
		.populate('patient')
		.then((data) => {
			const obj = {
				name: data.patient.name,
				dob: data.patient.dob,
				gender: data.patient.gender,
				bloodGroup: data.patient.bloodGroup,
				height: data.patient.height,
				weight: data.patient.weight,
				illness: data.patient.illness,
				allergy: data.patient.allergy,
				issue: data.issue,
				test: data.medicalReport,
				symptom: data.symptom,
			};
			res.status(200).json(obj);
		})
		.catch((err) => res.status(400).json({ msg: 'failure' }));
});

router.get('/getPastPrescription/:id', (req, res) => {
	const id = req.params.id;
	Prescription.findById(id)
		.populate('patient')
		.then((data) => {
			const obj = {
				issue: data.issue,
				test: data.medicalReport,
				symptom: data.symptom,
				prescription: data.prescription,
			};
			res.status(200).json(obj);
		})
		.catch((err) => res.status(400).json({ msg: 'failure' }));
});

module.exports = router;
