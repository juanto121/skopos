var fs	= require('fs');
var userc = require('./controllers/userController');
var transc = require('./controllers/transcriptionController');
var collabc = require('./controllers/collabController');
var Merger = require('sub-merge/src/SubtitleMerger');

module.exports = function(app, passport) {

	/* ============================ PUBLIC USERS ============================*/

	app.get('/',function(req,res){
		res.render('index.ejs',{user:req.user});
	});

	app.get('/login', function(req, res) {
		res.render('login.ejs', {message: req.flash('loginMessage')});
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/',
		failureRedirect	: '/login',
		failureFlash	: true
	}));

	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect	: '/',
		failureRedirect	: '/signup',
		failureFlash	: true
	}));


	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/solo', function(req,res) {
		res.render('soloplay.ejs',{transcription:false});
	});

	/*
		TODO: this route should not be a route
		because if user is logged in it will change.
	*/
	app.post('/solo/:id*?/download', function(req, res){
		var filePath = './public/temp/files/file.srt';
		fs.writeFile(filePath, req.body.data, function(err){
			if(err) throw err;
			res.writeHead(200,{'content-type':'application/x-subrip'});
			//TODO : return file url.
			res.end('/temp/files/file.srt');
		});
	});

	/* ============================ LOGGED USERS ============================*/

	app.get('/collab/download/:id', isLoggedIn, function(req, res){
		var idCollab = req.params.id;
		var filepath = './public/temp/files/' + idCollab + '.srt';
		console.log("trying download merged files");
		collabc.getPartsId(idCollab, function(parts){
			if(parts){
				console.log(parts);
				var merger = new Merger(parts.map(function(part){
					return './public/temp/files/' + part + '.srt';
				}));
				merger.mergeToString(function(merged){
					fs.writeFile(filepath, merged, function(err){
						if(err) console.log(err);
						else{
							res.writeHead(200,{'content-type':'application/x-subrip'});
							res.end('/temp/files/'+ idCollab + '.srt');
						}
					});
				});
			}else{
				send("Not found", 404);
			}
		});
	});


	app.get('/collab/new', isLoggedIn, function(req, res){
			res.render('collabconfig.ejs');
	});

	
	app.post('/collab/new', isLoggedIn, function(req, res){
		collabc.newCollab(req, function(collab){
			res.render('collabadmin.ejs',{collab:collab});
		});
	});

	app.get('/collabList', isLoggedIn, function(req, res){
			collabc.getCollabs(req, function(collabs){
			res.render('collabList.ejs',{collabs:collabs});
		});
	});

	app.post('/collabList', isLoggedIn, function(req, res){
		var data = req.body;
		var url_colaboracion = data.colaboracion;
		res.redirect(url_colaboracion);
	});

	app.get('/collab/admin/:id', isLoggedIn, function(req, res){
		var id = req.params.id;
		collabc.findCollabById(id, function(collab){
			if(collab){
				if(collab.author+"" === req.user._id+"")
					res.render('collabadmin.ejs', {collab:collab});
				else
					res.redirect('/');
			}else
			{
				console.log("Error");
				res.send("Not found", 404);
			}
		});
	});

	app.get('/collab/:id', isLoggedIn, function(req, res){
		var collabId = req.params.id;
		var userId = req.user.id;
		collabc.addCollaborator(collabId, userId, function(collab){
			if(collab){
				res.render('collab.ejs',{collab:collab});
			}else{
				res.send("Not Found", 404);
			}
		});

	});

	app.get('/collab/:id/data', isLoggedIn, function(req, res){
		var id = req.params.id;
		var userId = req.user.id;
		collabc.populateCollab(id, function(err, collab){
			if(collab){
				collabc.findPartByUserInCollab(userId, collab, function(transcription){
					res.send({collab:collab, userId:userId, part:transcription});	
				});
			}else{
				console.log(collab);
			}
		});
	});

	app.post('/collab/:id', isLoggedIn, function(req, res){
		//console.log(req);
		collabc.saveCollab(req, function(err){
			if(err) throw err;
			console.log("Saved Collab");
		});
	});

	app.get('/profile', isLoggedIn, function(req, res) {
		userc.getTranscriptions(req, function(transcriptions){
		  userc.getCollabsUser(req, function(collabs){

			res.render('profile.ejs', {
				user : req.user,
				transcriptions : transcriptions,
				collabs : collabs,
				message:req.flash('updateStatus')
			});
		  });
		});


	});

	app.post('/profile', isLoggedIn, function(req, res) {
		console.log("User posted to profile:  " + req.user);
		userc.updateUserInfo(req,function(err){
			if(err) req.flash('updateStatus','No se pudo realizar la actualizacion');
			else req.flash('updateStatus','Actualizacion exitosa');
			res.redirect('/profile');
		});
	});

	app.get('/solo/new', isLoggedIn, function(req, res){
		userc.newTranscription(req, function(transcription){
			res.render('soloplay.ejs',{transcription:transcription});
		});
	});

	app.get('/solo/:id', isLoggedIn, function(req, res){
		userc.getTranscriptionById(req.params.id,function(transcript){
			if(transcript)
				res.render('soloplay.ejs',{transcription:transcript});
			else
				res.send('Not Found',404);
		});
	});

	app.post('/solo/:id*?', isLoggedIn, function(req, res){
		userc.saveTranscription(req, function(err){
			if(err) throw err;
			console.log("Saved Transcription");
		});
	});
};

// Helpers

function isLoggedIn(req, res, next){
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}