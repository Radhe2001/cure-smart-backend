const express = require('express');
const router = express.Router();
const User = require('../db/models/userModel');
const jwt = require('jsonwebtoken');
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

module.exports = router;
