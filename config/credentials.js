// MLAB
exports.mLab = process.env.MLAB_URL

// CLOUDINARY
exports.cloudinaryCredits = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
}

// STRIPE
exports.stripeKey = {
  serveur: process.env.STRIPE_KEY_SK,
  front: process.env.STRIPE_KEY_PK
}

// SENDINBLUE
exports.sendinblueCredits = process.env.SENDINBLUE_KEY
