// https://70c19a4e-e7dd-4b62-a8d4-601ed9470a1e.id.repl.co/login
const express = require('express'); 
const session = require('express-session') 
const exphbs = require('express-handlebars'); 
const mongoose = require('mongoose'); 
const passport = require('passport'); 

const localStrategy = require('passport-local').Strategy; 
const bcrypt = require('bcrypt'); 
const flash = require('connect-flash');
const bodyParser = require('body-parser');  // Node.js body parsing middleware.
var cors = require('cors')
const app = express(); // Creates an app for the client
let port = 8880; // The Port for the server
 // load the files that are in the public directory
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('trust proxy', true); // Trust Proxy (if behind one)
app.use(cors()); // Allow any origin
app.use("/api/auth", require(process.cwd() + "/model/auth/route"))


app.use(bodyParser.json()); // Express modules / packages
app.use(bodyParser.urlencoded({ extended: true })); // Express modules / packages


app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Connect to MongoDB

const db = `mongodb+srv://milk5173:X1v2qiaNGeow8UZY@radiancecluster.stkiair.mongodb.net/?retryWrites=true&w=majority`;
console.log('attempt connect db')
mongoose.connect(db, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => { err.stackTraceLimit = Infinity; console.log(err, "Could Not Connect"); });

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	}
});

const User = mongoose.model('User', UserSchema);

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});


passport.use(new localStrategy({ usernameField: 'username' }, async function(username, password, done) {
  try {
      const user = await User.findOne({
          username: username
      });
      if (!user) {
          return done(null, false, {
              message: 'Incorrect username.'
          });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
          return done(null, false, {
              message: 'Incorrect password.'
          });
      }
  
      return done(null, user);
  } catch (err) {
      return done(err);
  }
}));

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/login');
}

function isLoggedOut(req, res, next) {
	if (!req.isAuthenticated()) return next();
	res.redirect('/');
}

// ROUTES
app.get('/', isLoggedIn, (req, res) => {
	res.render("index", { title: "Home" });
});

app.get('/about', (req, res) => {
	res.render("index", { username: "About" });
});

app.get('/login', isLoggedOut, (req, res) => {
  	const response = {
		title: "Login | Radiance",
		err: req.query.error,
    err_msg: ''
	}
  // console.log(response.err)
  if (response.err == 'true') {
    response.err_msg = 'Username or Password is Incorrect!';
    console.log(response.err_msg)
  }

	res.render('login', response);
});



app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login?error=true'
}));

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get('/userslist', function(req, res) {
  User.find({}, function(err, users) {
    var userMap = {};

    users.forEach(function(user) {
      userMap[user._id] = user;
    });

    res.send(userMap);  
  });
});

app.get('/setup', async (req, res) => {
	const exists = await User.exists({ username: "admin" });

	if (exists) {
		res.redirect('/login');
		return;
	};

	bcrypt.genSalt(10, function (err, salt) {
		if (err) return next(err);
		bcrypt.hash("admin", salt, function (err,  hash) {
			if (err) return next(err);
			
			const newAdmin = new User({
				username: "admin",
				password: hash
			});

			newAdmin.save();

			res.redirect('/login');
		});
	});
});

/*
bcrypt.genSalt(10, function (err, salt) {
  if (err) return next(err);
  bcrypt.hash("test", salt, function (err, hash) {
    if (err) return next(err);
    
    const test = new User({
      username: "test2",
      password: hash
    });

    test.save();
  });
});
*/

// //  nX5vZuLa4ONpiPtL pass

// const uri = 'mongodb+srv://milk5173:nX5vZuLa4ONpiPtL@radiancecluster.stkiair.mongodb.net/?retryWrites=true&w=majority'

// const client = new MongoClient(uri);

// async function run() {
//   try {
//     const database = client.db('sample_mflix');
//     const movies = database.collection('movies');
//     // Query for a movie that has the title 'Back to the Future'
//     const query = { title: 'Back to the Future' };
//     const movie = await movies.findOne(query);
//     console.log(movie);
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

// app.get('/', (req, res) => { 
//   // const ip = req.ip;
//   // if (ip === '24.246.127.188') {
//   //   res.send(ip);
//   //   console.log(ip)
//   // } else {
//   // res.sendFile(process.cwd() + '/public/html/index.html');
//   // }
//   res.sendFile(process.cwd() + '/public/html/index.html');
// });

app.get('/home', (req, res) => {
  res.sendFile(process.cwd() + '/public/html/index.html');
});


app.get('/faq', (req, res) => {
  res.sendFile(process.cwd() + '/public/html/faq.html');
});

app.get('/contact', (req, res) => {
  res.sendFile(process.cwd() + '/public/html/contact.html');
});

app.get('/tos', (req, res) => {
  res.sendFile(process.cwd() + '/public/html/tos.html');
});

app.get('/privacy-policy', (req, res) => {
  res.sendFile(process.cwd() + '/public/html/privacy-policy.html');
});

app.get('/wr', isLoggedIn, (req, res) => {
  res.sendFile(process.cwd() + '/public/html/wr.html');
});

app.get('/api/ip', (req, res) => {
    const ip = req.ip;
    res.render('base', {ip: ip});
})

// app.get('/login', (req, res) => {
//     res.sendFile(process.cwd() + '/public/html/login.html');
// })

// app.post('/login', (req, res) => {
//   let username = req.body.username;
//   let password = req.body.password;
//   res.send(`Username: ${username} Password: ${password}`);
// })                                                                                                           



app.all('*', (req, res) => {
  console.log(Error)
    res.status(404).sendFile(process.cwd() + '/public/html/404.html');
  });


app.listen(port, () => console.log(`Server Has Started\nRunning On http://localhost:${port}`));

