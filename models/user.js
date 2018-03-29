var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
	username: { type: String, index:true },
	password: { type: String },
	email: { type: String },
	name: { type: String },
	surname : { type: String },
	birthday: { type: String },
	sex: { type: String },
	team: { type: String },
	numLicense: { type: String },
	categorie: { type: String },
	adresse1: { type: String },
	adresse2: { type: String },
	codePostal : { type: String },
	city: { type: String },
	email: { type: String },
	foneFix: { type: String },
	fonePort: { type: String },
	resetPasswordToken: { type: String },
	resetPasswordExpires: { type: String },
	certificat: {
		expiration_month : { type: String },
		expiration_year : { type: String },
		file : { type: String},
		updated: { type: Date }
	},
	
	//Comptabilité
	code_etablissement: { type: Number },
	code_guichet: { type: Number },
	numero_de_compte: { type: Number },
	cle_RIB: { type: Number },

	//log
	created_at : { type: Date, required: true, default: Date.now },
	updated: { type: Date }//updated: { type: String }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}