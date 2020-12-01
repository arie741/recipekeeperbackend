const { Pool } = require('pg')

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDB,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false
  }
})

async function getRecipes(){
	try {
		let response = await pool.query('SELECT * FROM RECIPE');

		return response;
		await pool.end()
	} catch(error){
		return {error: true, message: error};
	}
}

async function getRecipe(uid){
	try {
		let response = await pool.query('SELECT * FROM RECIPE WHERE UID = $1', [uid]);

		return response;
		await pool.end()
	} catch(error){
		return {error: true, message: error};
	}
}

async function addRecipes(name, type, photos, description, steps, ingredients, uid){
	try {
		let response = await pool.query('INSERT INTO RECIPE (name, type, photos, description, steps, ingredients, uid) VALUES($1, $2, $3, $4, $5, $6, $7)', [
				name, 
				type, 
				photos, 
				description, 
				steps, 
				ingredients, 
				uid
			]);

		return response;
	} catch(error){
		return {error: true, message: error}
	}
}

async function deleteRecipe(uid){
	try {
		let response = await pool.query('DELETE FROM RECIPE WHERE UID = $1', [uid])

		return response;
	} catch(error){
		return {error: true, message: error}
	}
}

async function editRecipe(name, type, photos, description, steps, ingredients, uid){
	try {
		let response = await pool.query('UPDATE RECIPE SET (name, type, photos, description, steps, ingredients) = ($1, $2, $3, $4, $5, $6) where uid = $7', [
				name, 
				type, 
				photos, 
				description, 
				steps, 
				ingredients, 
				uid
			])
		
		return response;
	} catch(error) {
		return {error: true, message: error}
	}
}

async function deleteImage(uid, newPhotos){
	try{
		let response = await pool.query('UPDATE RECIPE SET photos = $2 where uid = $1', [
				uid,
				newPhotos
			])

		return response;
	} catch(error){
		return {error: true, message: error}
	}
}

module.exports = {
	query: (text, params, callback) => {
    return pool.query(text, params, callback)
    pool.end();
  	},
  	getRecipes,
  	getRecipe,
  	addRecipes,
  	deleteRecipe,
  	editRecipe,
  	deleteImage
}