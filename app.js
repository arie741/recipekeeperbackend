const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const db = require('./db/pg');
const uuid = require('uuid');
const multer  = require('multer')
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const path = require('path');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cors())
app.use(express.static('uploads'))

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/photos')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + uuid.v4() + path.extname(file.originalname));
  }
})

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/getrecipes', (req,res)=>{
	db.query('SELECT * FROM RECIPE', (error,response)=> {
		res.send(response.rows);
	})
})

app.post('/addrecipes', upload.array('photos'), (req, res)=> {
	let photosFiles = [];
	req.files.forEach((item, index)=>{
		photosFiles.push(item.filename);
	})
	db.query('INSERT INTO RECIPE (name, type, photos, description, steps, ingredients, uid) VALUES($1, $2, $3, $4, $5, $6, $7)', [
			req.body.name,
			req.body.type, 
			JSON.stringify({
				photos: photosFiles
			}),
			req.body.description,
			JSON.stringify({
				steps: req.body.steps
			}),
			'{"ingredients": [' + req.body.ingredients + ']}',
			uuid.v1()
		], (error, response)=>{
		if (error){
			res.send(error)
		} else {
			res.send(response)
		}
	})
})

app.listen(port, () => {
  console.log(`Recipe Keeper app listening at http://localhost:${port}`)
})