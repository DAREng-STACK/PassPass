var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var database = require('../database/index.js');
var session = require('express-session');
var SessionStore = require('express-mysql-session')(session);
var cryptoRandomString = require('crypto-random-string');
var path = require('path');
var stripeHelpers = require('./middleware/transactionHelpers.js');
var stripe = require('stripe')(
  "sk_test_J9JR0cXKMJL61WGB8O0CWgfG"
);
var twilio = require('./twilioModule');

var session_secret;
var fb;
if (process.env.NODE_ENV === 'production') {
  fb = {
    clientID: process.env.FB_CLIENTID,
    clientSecret: process.env.FB_CLIENTSECRET,
    callbackURL: process.env.FB_CALLBACKURL
  };
  session_secret = process.env.SESSION_SECRET;
} else {
  fb = require('../facebook.config.js');
  session_secret = require('../session.config.js');
}

var app = express();
var sessionStore = new SessionStore({}, database.connection);

var headers = {'Content-Type': 'application/json'};

app.use(bodyParser.urlencoded({extended: false})); //will work when the req header Content-Type matches the type option (accepts only UTF-8 ), extended=false means the obj will contain key-value paires and values can be strings or arrays, change to true for any type
app.use(bodyParser.json()); //default strict parameter only accepts arrays and objects, can change to false, will work when the req header Content-Type matches the type option (default to application/json but can change)

app.use(session({
  secret: session_secret,
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}));
// session created on access, added to the DB,
// on authenication, user added to the session and cookie added to the req header

app.use(passport.initialize());
app.use(passport.session()); //good resource: http://toon.io/understanding-passportjs-authentication-flow/
// app.use(app.router);
app.use(express.static(__dirname + '/../react-client/dist'));

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  (username, password, done) => {
    database.findUser(username, (err, user) => {
      if (err) {
        console.log('************ server side in strategy - email lookup error ', err);
        return done(err);
      } else if (user.length === 0) {
        console.log('********** success on user email lookup in strategy -  but no user match ', user);
        return done(null, false, {message: 'Incorrect username. Please try again or signup for a new account.'});
      } else {
        database.authUser({email: username, password: password, salt: user[0].salt}, (err, user) => {
          if (err) {
            console.log('************ server side in strategy - password check login error ', err);
            return done(err);
          } else if (user.length === 0) {
            console.log('********** success on user password check in strategy -  but no password match ', user);
            return done(null, false, {message: 'Incorrect password. Please try again or signup for a new account.'});
          } else {
            return done(null, user);
          }
        });
      }
    });
  }
));

// ADD BACK IN FOR AUTHENTICATION
// passport.use(new FacebookStrategy(fb,
//     (accessToken, refreshToken, profile, done) => { //fb profile: http://passportjs.org/docs/profile
//       console.log('********** accessToken ', accessToken);
//       console.log('********** refreshToken ', refreshToken);
//       console.log('*********** profile ', profile);
//       // database.findOrCreateUser({email: profile.emails[0].value, name: profile.displayName, cookie: accessToken},
//       // (err, user) => {
//       //   if (err) {return done(err);}
//       //   done(null, user);
//       // });
//     }
// ));

passport.serializeUser(function(user, done) {
  done(null, user.id);
  // result of this is req.session.passport.user = { // our serialised user object // }
  // result also attached to req.user
});

passport.deserializeUser(function(id, done) {
  database.findUserById(id, (err, user) => {
    done(err, user[0]);
  });
  // Attaches the loaded user object to the request as req.user
});

var successUser = (req, res, user, callback) => {
    if (req.body.rememberMe) { // add this to user signup too
      req.session.cookie.maxAge = (30*24*60*60*1000); // 30 days
    } else {
      req.session.cookie.expires = false;
    }
    console.log(req.session.passport.user)
    database.addUserToSession(req.session.passport.user, req.sessionID, (err, results) => {
      if (err) {
        console.log('************ server side add user to session error ', err);
        callback(err);
      } else {
        callback(null, user);
      }
    });
}


app.post('/auth/email', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => { //info is optional argument passed by the strategy's callback
    //req.user contains the authenticated user if approved
    //req.user = false if fails
    //if exists, updates cookie
    // var cookie = req.cookies['connect.sid'];
    if (err) {
      console.log('************ server side in post - email login error ', err);
      res.send(err);
    } else if (!user) {
      return res.send(info); //error message and redirect on client side
    } else {
      req.login(user[0], err => { //req.login is called by passport if user is passed back but called by application in this custom setup
        //this will call serializeUser method defined above
        //find user id at req.session.passport.user
        if (err) {
          return next(err);
        } else {
          successUser(req, res, user, (err, user) => {
            if (err) {res.send(err);}
            res.send(user);
          });
        }
      });
    }
  })(req, res, next);
});

app.post('/passes/all', (req, res) => {
  database.getPendingPasses(req.body.userId, (result) => {
    res.send(result);
  });
});

app.post('/passes/pending/seller', (req, res) => {
  database.getPendingSellerData(req.body.userId, (result) => {
    res.send(result);
  });
});

app.post('/passes/restricted', (req, res) => {
  database.getAllRestrictedStudios((result) => {
    res.send(result);
  })
})

app.post('/passes/pending/add', (req, res) => {
  database.addToPending(req.body.pass.id, req.body.profileData.id, () => {
    res.sendStatus(200);
  })
})



app.post('/passes/pending/change', (req, res) => {
  database.updatePassesAvailable(req.body.pass, req.body.id, (err, result) => {
    if(err) {
      console.log('error in change');
    }
    res.send('succes');
  });
});

app.post('/passes/delete', (req, res) => {
  database.deletePendingPass(req.body.id, req.body.userId, (err, result) => {
    if(err){
      console.log('error in delete')
    }
    res.send('success');
  });
});


app.post ('/passes/pending/buy', (req, res) => {
  console.log(req.body, '@@###$$$@@##$$$')
  stripeHelpers.createTransferToPassPass(req.body, (err, res) => {
    if(err){
      console.log('transfercreation bruk', err)
    }else{
      console.log(res, '!@#$%^&*(*&^%$)')
      database.switchFromPendingtoBought(res.transfer_group)
    }
  });
});

app.post('/auth/signup', (req, res) => {
  var rememberMe = req.body.rememberMe;
  req.body.salt = cryptoRandomString(10);
   //use this salt to create a new user
  //create a stripe customer account before saving user to database
  stripe.customers.create({
    description: 'Customer for' + req.body.first_name + ' ' + req.body.last_name,
  }, function(err, customer) {
    // asynchronously called
    var newreq = req.body;
    newreq.customerId = customer.id;
    database.newUser(newreq, (err, user) => {
      if (err) {
        console.log('************ server side new user signup error ', err);
        res.send(err);
      } else {
        req.body.id = user.insertId;
        req.logIn(user[0], err => { //calls serializeUser
          //find user id at req.session.passport.user
          if (err) {
            res.send(err);
          } else {
            successUser(req, res, req.body, (err, user) => {
              if (err) {res.send(err);}
              console.log('*************** about to redirect to interactions');
              res.redirect('/interactions');
              //or res.send(user);
            });
          }
        });
      }
    });
  });
});

// ADD BACK IN FOR AUTHENTICATION
// app.get('/auth/facebook', passport.authenticate('facebook'));
//
// app.get('/auth/facebook/callback', passport.authenticate('facebook', {
//   successRedirects: '/interactions',
//   failureRedirect: '/login'
// }));

app.post('/user/search', (req, res) => {
  // req has user id
  // call to db for user profile data based on id
  //if successful, return record
  //else send error message try again
  //how granular can the error be?
  res.send(JSON.stringify(req.body, null, 2));
});

app.get('/user/restricted', (req, res) => {
  database.getRestrictedStudios({ id: req.session.passport.user }, (err, results) => {
    if (err) {
      console.log('ERROR failed to get restricted studios ', err);
      res.sendStatus(500);
    }
    res.status(200).send(results);
  });
});

app.post('/user/restricted', (req, res) => {
  const studio = req.body.studio;
  database.addRestrictedStudio({ id: req.session.passport.user }, studio, (err, results) => {
    if (err) {
      console.log('ERROR failed to add restricted studio ', err);
      res.sendStatus(500);
    }
    res.sendStatus(201);
  });
});

app.post('/pass/new', (req, res) => {
  console.log(req.body)
  console.log(req.session)
  database.findUserById(req.session.passport.user, (err, rows, fields) => {
    if(!rows[0].merchant_id){
      stripe.accounts.create({
        type: 'custom',
        country: 'US',
        email: rows[0].email
      }, function(err, account) {
        // asynchronously called
        if(err){
          console.log(err, "error@")
        }
        database.newMerchantAcct(rows[0].id, account.id);
      });
    }
  })
  const forSaleBlock = {
    seller_id: req.session.passport.user,
    pass_volume: req.body.quantity,
    current_price: req.body.price,
    period_start: req.body.dateStart,
    period_end: req.body.dateEnd,
    period_end: req.body.dateEnd,
    passes_sold: 0
  };
  const restrictedStudios = req.body.restrictedSelect;

  database.addSale(forSaleBlock, restrictedStudios, (err, results) => {
    // console.log('gets into addsale')
    if (err) {
      console.log('ERROR failed to add sale block: ', err);
      res.sendStatus(500);
    }
    res.sendStatus(201);
  });
  //req has obj of pass data and any new restricted studios
  //call to db to add the new pass data and create new for_sale_block
  // create new restricted studio if needed
  //if successful, return insert id
  //else send error message try again
  //how granular can the error be?
});

app.post('/pass/edit', (req, res) => {
  database.makeBlockChanges(Object.assign({ userId: req.session.passport.user }, req.body), req.body.addSaleRestrictedSelect, function(err, data) {
    err && res.sendStatus(500);
    data && res.status(200).send(data);
  });
});

app.post('/pass/buyer/search', (req, res) => {
  // for display to buyers - req obj has search values (volume, dates, price)
  // call to db for passes based on search values
  // if successful, return records
  // else send error message try again
  // how granular can the error be?
  var startDate = req.body.searchQueries.startDateInput || '1000-01-01';
  var endDate = req.body.searchQueries.endDateInput || '9999-12-31';
  req.body.searchQueries.dateRange = [startDate, endDate];
  req.body.searchQueries.ignoreUserId = req.session.passport.user; // replace this with req.session.user[0].id;
  database.getForSaleBlocks(req.body.searchQueries, function(error, forSaleBlocks) {
    error && res.sendStatus(500);
    forSaleBlocks && res.status(200).send(forSaleBlocks);
  });
});

app.post('pass/buyer/buy', (req, res) => {
  transfers.createTransferToPassPass(req.body, (err, res) => {
    database.updateForSaleBlock(res.body, (err, res) => {
      if(err){
        alert(err)
      }
      res.redirect('/interactions');
    })
  })
});

app.get('/pass/seller/search', (req, res) => {
  database.findAllFromCurrentUser(req.session.passport.user, function(userCurrentSaleBlocks) {
    res.send(userCurrentSaleBlocks);
  });
});




app.post('/pass/seller/clone', (req, res) => {
  // for creating a new record for seller off an old one (req obj has id)
  // call to db for one pass based on matching id
  // if successful, return records
  // else send error message try again
  // how granular can the error be?
});

app.post('/review/new', (req, res) => {
  //req has obj of review data
  //call to db to add a review
  // db should increment rating calc value
  //if successful, return insert id
  //else send error message try again
  //how granular can the error be?
});

app.post('/review/edit', (req, res) => {
  //req has review obj data
  //call to db to edit that review record with new data
  //if successful, return record id
  //else send error message try again
  //how granular can the error be?
});

app.post('/review/search', (req, res) => {
  //req has user id info
  //call to db to select all reviews with that user id
  //if successful, return review records
  //else send error message try again
  //how granular can the error be?
});

app.post('/chat', (req, res) => {
  let message = req.body;
    //message.msgBody is a string representing the text the buyeer wants to sent to seller
    //message.msgTo is expected to be the sellers email initially
  //db lookup of user record by email
  database.findUser(message.msgTo, (err, user) => {
    //grab sellers user record from their email
    if(err) {
      res.status(500).send('Woops! Something went wrong here! Try purchasing a different pass');
    } else {
      //on positive lookup update message object with the users phone number
      message.msgTo = user[0].phone;
      //send message object and callback to twilio module
      twilio.twilioMessage(message, () => {
        //callback for twilio module passing the response object
        res.status(201).send('yay! your message has been sent to the seller!');
      });
    }
  })
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../react-client/dist/index.html'));
});

var port = process.env.PORT || 3000;
app.set('port', port);

if (module.parent) {
  module.exports = app;
} else {
  app.listen(app.get('port'));
  console.log('Listening on', app.get('port'));
}
