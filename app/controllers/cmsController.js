//Controllers
var cmsCtrl = {
	index : function(req, res){
		if(req.user) {
			res.redirect('/event/finder')
		} else{
			res.render('partials/index');
		}
	},
	entreprise : function(req, res){
		res.render('partials/cms/entreprise');
	},
	partenaires : function(req, res){
		res.render('partials/cms/partenaires');
	},
	medias : function(req, res){
		res.render('partials/cms/medias');
	},
	tarifs : function(req, res){
		res.render('partials/cms/tarifs');
	},
	contact : function(req, res){
		res.render('partials/cms/contact');
	},
	mentionsLegales : function(req, res){
		res.render('partials/cms/mentions-legales');
	},
	cgv : function(req, res){
		res.render('partials/cms/cgv');
	},
	cgu : function(req, res){
		res.render('partials/cms/cgu');
	},
	faq : function(req, res){
		res.render('partials/cms/faq');
	},
	comptabilite : function(req, res){
		res.render('partials/cms/comptabilite');
	},
	securite : function(req, res){
		res.render('partials/cms/securite');
	},
	commande : function(req, res){
		res.render('partials/cms/commande');
	},
	remboursement : function(req, res){
		res.render('partials/cms/remboursement');
	}
}

module.exports = cmsCtrl