var express = require('express'),
	router = express.Router();

// ---------------- INDEX ----------------
// Get Homepage
router.get('/', function(req, res){
	if(req.user) {
		res.redirect('/event/finder')
	} else{
		res.render('index');
	}
});

// ---------------- CMS ----------------
// Get "l'entreprise"
router.get('/info/entreprise', function(req, res){
	res.render('cms/entreprise');
});

// Get "nos partenaires"
router.get('/info/partenaires', function(req, res){
	res.render('cms/partenaires');
});

// Get "nos medias"
router.get('/info/medias', function(req, res){
	res.render('cms/medias');
});

// Get "tarifs"
router.get('/info/tarifs', function(req, res){
	res.render('cms/tarifs');
});

// Get "contact"
router.get('/info/contact', function(req, res){
	res.render('cms/contact');
});

// Get "Mentions légales"
router.get('/info/mentions-legales', function(req, res){
	res.render('cms/mentions-legales');
});

// Get "CGV"
router.get('/info/cgv', function(req, res){
	res.render('cms/cgv');
});

// Get "Conditons d'utilisation"
router.get('/info/cgu', function(req, res){
	res.render('cms/cgu');
});

// Get "FAQ"
router.get('/info/faq', function(req, res){
	res.render('cms/faq');
});

// Get "Comptabilité"
router.get('/info/comptabilite', function(req, res){
	res.render('cms/comptabilite');
});

// Get "Sécurité"
router.get('/info/securite', function(req, res){
	res.render('cms/securite');
});

// Get "Commande"
router.get('/info/commande', function(req, res){
	res.render('cms/commande');
});

// Get "Remboursement"
router.get('/info/remboursement', function(req, res){
	res.render('cms/remboursement');
});

module.exports = router;