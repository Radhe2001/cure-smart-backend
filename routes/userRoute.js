const express = require('express');
const router = express.Router();
const User = require('../db/models/userModel');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { log } = require('console');
const { ADDRGETNETWORKPARAMS } = require('dns');
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

module.exports = router;
