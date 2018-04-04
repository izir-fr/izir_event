//MLAB
exports.mLab = process.env.MLAB_URL;

//CLOUDINARY
exports.cloudinaryCredits = { 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
};

//EMAIL SMTP
exports.smtpCredits = {
	host: process.env.EMAIL_HOST,
	port: process.env.EMAIL_PORT,
	secure: true, // secure:true for port 465, secure:false for port 587
	auth: {
	  user: process.env.EMAIL_AUTH_USER,
	  pass: process.env.EMAIL_AUTH_PASS
	}
};

//STRIPE
exports.stripeKey = {
	serveur : process.env.STRIPE_KEY_SK,
	front : process.env.STRIPE_KEY_PK
};

//SENDINBLUE
exports.sendinblueCredits = process.env.SENDINBLUE_KEY;