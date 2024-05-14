const express = require('express');
const router = express.Router();
const RegistrationRequest = require('../db/models/registrationRequestModel');
const Doctor = require('../db/models/doctorModel');
const Notification = require('../db/models/notificationModel');
router.use(express.json());
require('dotenv').config();

router.get('/', (req, res) => {
	res.send('In user route');
});

router.post('/login', (req, res) => {
	if (
		req.body.email === process.env.ADMIN_USER &&
		req.body.password === process.env.ADMIN_PASSWORD
	)
		res.status(200).json({ msg: 'login successfull' });
	else res.status(400).json({ msg: 'No such user exists' });
});

router.get('/request', (req, res) => {
	RegistrationRequest.find()
		.then((user) => res.status(200).json({ user: user }))
		.catch((err) =>
			res.status(400).json({ msg: 'Some database error occured' })
		);
});

router.get('/doctors', (req, res) => {
	Doctor.find()
		.then((user) => res.status(200).json({ user: user }))
		.catch((err) =>
			res.status(400).json({ msg: 'Some database error occured' })
		);
});

router.post('/approve/:id', (req, res) => {
	const id = req.params.id;
	RegistrationRequest.findById(id)
		.then((data) => {
			const doctor = new Doctor({
				name: data.name,
				email: data.email,
				password: data.password,
			});
			doctor
				.save()
				.then((response) => {
					RegistrationRequest.deleteOne({ _id: data.id })
						.then((resp) =>
							res
								.status(200)
								.json({ msg: 'Updated successfully' })
						)
						.catch((err) =>
							res
								.status(400)
								.json({ msg: 'Some database error occured' })
						);
				})
				.catch((err) =>
					res.status(400).json({ msg: 'Some database error occured' })
				);
		})
		.catch((err) =>
			res.status(400).json({ msg: 'Some database error occured' })
		);
});

router.delete('/remove/:id', (req, res) => {
	const id = req.params.id;
	Doctor.deleteOne({ _id: id })
		.then((resp) => res.status(200).json({ msg: 'Updated successfully' }))
		.catch((err) =>
			res.status(400).json({ msg: 'Some database error occured' })
		);
});

router.post('/notification/add', (req, res) => {
	const { body } = req;
	const date = new Date();
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	const formattedDate = `${year}-${month}-${day}`;
	const notification = new Notification({
		mes: body.notification,
		date: formattedDate,
	});
	notification
		.save()
		.then((data) => res.status(200).send(data))
		.catch((err) => res.status(500).send(err));
});

router.get('/notification/get', (req, res) => {
	Notification.find()
		.then((data) => {
			res.status(200).send(data);
		})
		.catch((err) => res.status(500).send(err));
});

router.delete('/notification/delete/:id', (req, res) => {
	const id = req.params.id;
	Notification.deleteOne({ _id: id })
		.then((data) => {
			res.status(200).send(data);
		})
		.catch((err) => res.status(500).send(err));
});

module.exports = router;
