const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const {BasicStrategy} = require('passport-http')

const {
	DATABASE_URL,
	PORT
} = require('./config');
const {
	BlogPost,
	User
} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

const basicStrategy = new BasicStrategy((username, password, callback) => {
  let user;
  User
    .findOne({username: username})
    .exec()
    .then(_user => {
      user = _user;
      if (!user) {
        return callback(null, false, {message: 'Incorrect username'});
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return callback(null, false, {message: 'Incorrect password'});
      }
      else {
        return callback(null, user)
      }
    });
});

passport.use(basicStrategy);
app.use(passport.initialize());

app.get('/posts', (req, res) => {
  BlogPost
		.find()
		.exec()
		.then(posts => {
  res.json(posts.map(post => post.apiRepr()));
})
		.catch(err => {
  console.error(err);
  res.status(500).json({
    error: 'something went terribly wrong'
  });
});
});

app.get('/posts/:id', (req, res) => {
  BlogPost
		.findById(req.params.id)
		.exec()
		.then(post => res.json(post.apiRepr()))
		.catch(err => {
  console.error(err);
  res.status(500).json({
    error: 'something went horribly awry'
  });
});
});

app.get('/users', (req, res) => {
	User
	.find()
	.exec()
	.then(users => {
		console.log('hello');
		res.status(201).json(users);
	})
})
app.post('/users', (req, res) => {
	if (!req.body) {
    return res.status(400).json({message: 'No request body'});
  }

  if (!('username' in req.body)) {
    return res.status(422).json({message: 'Missing field: username'});
  }

  let {username, password, firstName, lastName} = req.body;

  if (typeof username !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: username'});
  }
	username = username.trim();

	if (username === '') {
		return res.status(422).json({message: 'Incorrect field length: username'});
	}

	if (!(password)) {
		return res.status(422).json({message: 'Missing field: password'});
	}

	if (typeof password !== 'string') {
		return res.status(422).json({message: 'Incorrect field type: password'});
	}

	password = password.trim();

	if (password === '') {
		return res.status(422).json({message: 'Incorrect field length: password'});
	}

	return User
	.find({username})
	.exec()
	.then(count => {
		if (count > 0) {
			return res.status(422).json({message: 'username already exists'});
		}
		return User.hashPassword(password)
	})
	.then(hash => {
		return User
		.create({
			username: username,
			password: hash,
			firstName: firstName,
			lastName: lastName
		})
	})
	.then(user => {
		return res.status(201).json(user.apiRepr());
	})
	.catch(err => {
		res.status(500).json({message: `Internal server error, ${err}`})
	});
});


app.post('/posts', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  BlogPost
		.create({
  title: req.body.title,
  content: req.body.content,
  author: req.body.author
})
		.then(blogPost => res.status(201).json(blogPost.apiRepr()))
		.catch(err => {
  console.error(err);
  res.status(500).json({
    error: 'Something went wrong'
  });
});

});


app.delete('/posts/:id', (req, res) => {
  BlogPost
		.findByIdAndRemove(req.params.id)
		.exec()
		.then(() => {
  res.status(204).json({
    message: 'success'
  });
})
		.catch(err => {
  console.error(err);
  res.status(500).json({
    error: 'something went terribly wrong'
  });
});
});


app.put('/posts/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['title', 'content', 'author'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  BlogPost
		.findByIdAndUpdate(req.params.id, {
  $set: updated
}, {
  new: true
})
		.exec()
		.then(updatedPost => res.status(201).json(updatedPost.apiRepr()))
		.catch(() => res.status(500).json({
  message: 'Something went wrong'
}));
});


app.delete('/:id', (req, res) => {
  BlogPost
		.findByIdAndRemove(req.params.id)
		.exec()
		.then(() => {
  console.log(`Deleted blog post with id \`${req.params.ID}\``);
  res.status(204).end();
});
});


app.use('*', function (req, res) {
  res.status(404).json({
    message: 'Not Found'
  });
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
				.on('error', err => {
  mongoose.disconnect();
  reject(err);
});
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {
  runServer,
  app,
  closeServer
};
