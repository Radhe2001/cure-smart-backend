const mongoose = require('mongoose');
require('dotenv').config();

mongoose
	.connect(process.env.DB_URL)
	.then((msg) => console.log('Database connection established'))
	.catch((err) => console.log(err.msg));
