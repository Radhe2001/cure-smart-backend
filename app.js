const express = require('express');
const cors = require('cors');
const path = require('path');
require('./db/config');
const userRoute = require('./routes/userRoute');
const doctorRoute = require('./routes/doctorRoute');
const adminRoute = require('./routes/adminRoute');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/user', userRoute);
app.use('/doctor', doctorRoute);
app.use('/admin', adminRoute);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(5000, () => {
	console.log('Example app listening on port 5000!');
});
