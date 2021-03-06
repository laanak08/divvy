var Logic = require('../Model/logic');

module.exports = function(db){
	return {
		home : function(req, res) {
			db.getPosts(function(err, posts) {
				if(!err) {
				if(req.session.user) { //logged in
					posts = Logic.relevantPosts(req.session.user, posts);
				} else {
					posts = Logic.globalTrendingPosts(posts);
				}
				res.render('index', { user: req.session.user, posts: posts });
				}
			});
		},
		account : function(req, res) {
			var user = req.params.username;

			if(user) {
				db.getPostsByPoster(user,function(err,posts){
					res.render('account', {user: user, posts: posts});
				});
			} else {
				res.redirect('/');
			}
		},
		me : function(req,res){
			user = req.session.user;
			
			if(user) {
				db.getPostsByPoster(user,function(err, posts) {
					if(!err) {
						res.render('account', {user: req.session.user, posts: posts});
					}
				});
			} else {
				res.redirect('/');
			}
		},
		snippet : function(req, res) {
			db.User.find({username: req.body.username}, function (err, user) {
				if (err) { console.log(err) ;}

				if(!user) { //no user with this name
					res.send("");
				} else {
					res.send(user);
				}
			});
		},
		getPostsByPoster : function(req, res) {
			if(req.session.user) {
				var poster = req.user.username;
				db.getPostsByPoster(poster,function(err,posts){
					res.send(posts);
				});
			}
		},
		newpost : function(req, res) {
			db.addPost({bounty:req.body.bounty, task:req.body.task, title:req.body.title, skills:req.body.skills}, req.session.user, function(err, post) {
				if(!err) {
					res.redirect('/');
				} else {
					res.send('Error posting.');
				}
			});
		},
		update : function(req, res){
			if(req.session.user) {
				req.session.user.name = req.body.name;
				req.session.user.email = req.body.email;
				req.session.user.city = req.body.city;
				req.session.user.state = req.body.state;
				req.session.user.location.city = req.body.city;
				req.session.user.location.state = req.body.state;
				req.session.user.zip = req.body.zip;
				req.session.user.location.zip = req.body.zip;
				req.session.user.skills = req.body.skills;
				req.session.user.interest = req.body.interests;
				db.updateUser(req.session.user, req.body.skills, req.body.interests, function(err, newUser){
					res.redirect('/');
				});
			}
		},
		signup : function(req, res) {
			var uname = req.body.username;
			var passwd = req.body.password;
			var em = req.body.email;
			db.addUser({username: uname, email: em, password: passwd}, function(err, user){
				if(!err ) {
					req.logIn(user, function(err) {
						if (err) { return next(err); }
						req.session.user = user;
						console.log(user.username + " login successful");
					});					
					res.redirect('/account');
				} else {
					res.send('Error registering.');
				}
			});
		},
		login : function(req, res) {
			var username = req.body.user.username;
			var password = req.body.user.password;
			// login return json of new content
			// console.log( Logic.relevantPosts(req.body.user, db.allPosts() ) );
		},
		logout : function(req,res){
			req.session.destroy();
			req.logout();
			res.redirect('/');
		},
		profile : function(req,res) {
			var uname = req.params.username;
			db.getUser(uname, function(err, user) {
				if(!err) {
					db.getPostsByPoster(user, function(err, posts) {
						if(!err) {
							res.render('profile', { user: req.session.user, profile: user, posts: posts });
						} else {
							res.redirect('/');
						}
					});
				} else {
					res.redirect('/');
				}
			});
		}
	};
};
