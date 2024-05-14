const express = require('express');
const router = express.Router();
const User = require('../db/models/userModel');
const Prescription = require('../db/models/prescriptionModel');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { log } = require('console');
const prescriptionModel = require('../db/models/prescriptionModel');
const { decode } = require('punycode');
router.use(express.json());
require('dotenv').config();

router.get('/', (req, res) => {
	res.send('In user route');
});

router.post('/register', (req, res) => {
	const { body } = req;
	User.find({ name: body.name, email: body.email })
		.then((user) => {
			if (user.length > 0) {
				res.status(400).json({ msg: 'User already exists' });
			} else {
				const user = new User(body);
				user.save()
					.then((data) => {
						v;
						res.status(200).json({
							msg: 'User registered succcessfully',
						});
					})
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
	User.findOne({ email: req.body.email, password: req.body.password })
		.then((data) => {
			if (data) {
				const token = jwt.sign(
					{ id: data._id, email: data.email, name: data.name },
					process.env.SECRET
				);
				res.status(200).json({ token: token });
			} else res.status(400).json({ msg: 'No such user exists' });
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
	User.findOne({
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
	User.updateOne(
		{ _id: decodedVal.id, email: decodedVal.email, name: decodedVal.name },
		{
			$set: {
				name: body.name,
				dob: body.dob,
				gender: body.gender,
				phone: body.phone,
				email: body.email,
				language: body.language,
				address: body.address,
				image: fileName,
			},
		}
	)
		.then((data) => res.status(200).json({ msg: 'success' }))
		.catch((err) => res.status(400).json({ msg: 'failure' }));
});

router.post('/medicalprofile', (req, res) => {
	const { body } = req;
	const authHeader = req.headers.authorization;
	let decodedVal = jwt.verify(authHeader, process.env.SECRET);
	User.updateOne(
		{ _id: decodedVal.id, email: decodedVal.email, name: decodedVal.name },
		{
			$set: {
				bloodGroup: body.bloodGroup,
				height: body.height,
				weight: body.weight,
				illness: body.illness,
				allergy: body.allergy,
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
	User.findOne({
		_id: decodedVal.id,
		email: decodedVal.email,
		name: decodedVal.name,
	})
		.then((user) => {
			if (user.password === body.oldPassword) {
				User.updateOne(
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

router.get('/activeTreatment', (req, res) => {
	const authHeader = req.headers.authorization;
	let decodedVal = jwt.verify(authHeader, process.env.SECRET);
	Prescription.find({ patient: decodedVal.id, active: true })
		.populate('doctor', 'name')
		.then((data) => {
			res.status(200).json({ data: data });
		})
		.catch((err) => res.status(500).json({ mes: 'Some database error' }));
});

router.get('/pastTreatment', (req, res) => {
	const authHeader = req.headers.authorization;
	let decodedVal = jwt.verify(authHeader, process.env.SECRET);
	Prescription.find({ patient: decodedVal.id, active: false })
		.populate('doctor', 'name')
		.then((data) => {
			res.status(200).json({ data: data });
		})
		.catch((err) => res.status(500).json({ mes: 'Some database error' }));
});

router.get('/patientDetail', (req, res) => {
	const authHeader = req.headers.authorization;
	let decodedVal = jwt.verify(authHeader, process.env.SECRET);
	User.findById(decodedVal.id)
		.then((data) => {
			let date = new Date();
			const age =
				date.getFullYear() - parseInt(data.dob.split('-')[0]) - 1;
			res.status(200).json({
				data: {
					height: data.height,
					weight: data.weight,
					bloodGroup: data.bloodGroup,
					age: age,
				},
			});
		})
		.catch((err) => res.status(500).json({ mes: 'Some database error' }));
});

router.get('/requests', (req, res) => {
	const authHeader = req.headers.authorization;
	let decodedVal = jwt.verify(authHeader, process.env.SECRET);
	Prescription.find({ patient: decodedVal.id })
		.then((data) => {
			total = data.length;
			let arr = data.filter((val) => val.active === true);
			active = arr.length;
			arr = data.filter((val) => val.active === false);
			past = arr.length;
			res.status(200).json({
				data: {
					total: total,
					active: active,
					past: past,
				},
			});
		})
		.catch((err) => res.status(500).json({ mes: 'Some database error' }));
});

async function findQueryWithGemini(query) {
	// const apiKey = 'AIzaSyCgm6eXu35R3gsaQEI3W6zDSBHX3aqRxD8';
	// const modelName = 'gemini-pro';
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.MODEL}:generateContent?key=${process.env.API_KEY}`;
	const body = JSON.stringify({
		contents: [
			{
				parts: [
					{
						text: query,
					},
				],
			},
		],
	});
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body,
	});
	if (!response.ok) {
		throw new Error(
			`Error fetching data from Gemini API: ${response.statusText}`
		);
	}
	const data = await response.json();
	return data;
}

router.post('/chat', (req, res) => {
	const { body } = req;
	const mes = ` What to do in such a case ${body.mes}  including medicine name and regimen Generate in 30 words in paragraph format`;
	findQueryWithGemini(mes)
		.then((data) => {
			const generatedText = data.candidates[0].content.parts[0].text;
			res.send(generatedText);
		})
		.catch((error) => {
			console.error('Error:', error);
		});
});

router.post('/delete', (req, res) => {
	const { body } = req;
	const authHeader = req.headers.authorization;
	let decodedVal = jwt.verify(authHeader, process.env.SECRET);
	User.findById(decodedVal.id)
		.then((data) => {
			if (data.password === body.password) {
				User.deleteOne({ _id: decodedVal.id })
					.then((data) => {
						res.status(200).send(data);
					})
					.catch((err) => res.status(400).send(err));
			} else {
				res.status(500).send("user credential don't match");
			}
		})
		.catch((err) => res.status(501).send(err));
});

module.exports = router;
