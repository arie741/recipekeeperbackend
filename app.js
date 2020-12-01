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
const fs = require('fs');

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

app.get('/getrecipes', async (req,res)=>{
	try {
		let response = await db.getRecipes();
		if(response.error){
			res.send(response.message);
		} else {
			res.send(response.rows);
		}
	} catch(err){
		res.send(err);
	}
})

app.get('/getrecipe/:id', async (req,res)=>{
	try {
		let response = await db.getRecipe(req.params.id);
		if(response.error){
			res.send(response.message);
		} else {
			res.send(response.rows[0]);
		}
	}catch(err){
		res.send(err);
	}
})

app.post('/addrecipes', upload.array('photos'), async (req, res)=> {
	try {
		let photosFiles = [];
		req.files.forEach((item, index)=>{
			photosFiles.push(item.filename);
		})

		let response = await db.addRecipes(
			req.body.name,
			req.body.type, 
			JSON.stringify({
				photos: photosFiles
			}),
			req.body.description,
			JSON.stringify({
				steps: JSON.parse(req.body.steps)
			}),
			JSON.stringify({
				ingredients: JSON.parse(req.body.ingredients)
			}),
			uuid.v1())

		if(response.error){
			res.send(response.message);
		} else {
			res.send(response);
		}
	}catch(err){
		res.send(err);
	}
})

app.post('/deleterecipe', async (req, res) => {
	let getResponse = await db.getRecipes();
	let getRecipeById = getResponse.rows.find(item => item.uid == req.body.uid);
	let photosArray = getRecipeById.photos;
	
	if (photosArray.photos.length != 0){
		photosArray.photos.forEach(photo => {
			fs.unlink('uploads/photos/' + photo, (err) => {
			  if (err) {
			  	if(err.code != 'ENOENT'){
			  		throw err;
			  	}
			  };
			  console.log('uploads/photos/' + photo + ' was deleted');
			});
		})
	}
	
	let response = await db.deleteRecipe(req.body.uid);

	if (response.error){
		res.send(response.message);
	} else {
		res.send(response);
	}
})

app.put('/editrecipe', upload.array('photos'), async (req,res)=>{
	try {

		let dataResponse = await db.getRecipe(req.body.uid);

		let photosFiles = await dataResponse.rows[0].photos.photos;

		req.files.forEach((item, index)=>{
			photosFiles.push(item.filename);
		})

		let response = await db.editRecipe(
			req.body.name,
			req.body.type, 
			JSON.stringify({
				photos: photosFiles
			}),
			req.body.description,
			JSON.stringify({
				steps: JSON.parse(req.body.steps)
			}),
			JSON.stringify({
				ingredients: JSON.parse(req.body.ingredients)
			}),
			req.body.uid);

		if(response.error){
			res.send(response.message);
		} else {
			res.send(response);
		}
	} catch (err){
		res.send(err);
	}
})

app.post('/deleteimage', async(req, res)=>{
	try{
		let dataResponse = await db.getRecipe(req.body.uid);

		let photosFiles = await dataResponse.rows[0].photos.photos;

		let deletedPhotos = photosFiles.filter(item => item != req.body.photo);

		let response = await db.deleteImage(
			req.body.uid, 
			JSON.stringify({
				photos: deletedPhotos
		}));

		if(response.error){
			res.send(response.message);
		} else {
			res.send(response);
		}
	} catch (err){
		res.send(err);
	}
})

app.listen(port, () => {
  console.log(`Recipe Keeper app listening at http://localhost:${port}`)
})