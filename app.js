const express = require('express');
const cors = require('cors');
const path = require('path');
require('./db/config');
const userRoute = require('./routes/userRoute');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/user', userRoute);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(5000, () => {
	console.log('Example app listening on port 5000!');
});
