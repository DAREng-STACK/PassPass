var request = require('supertest');
var express = require('express');
var server = require('../../server/index.js')
var path = require('path');
var server = require('../../server/index');
var db = require('../../database/index');
var superReq = supertest.agent(server);


xdescribe('Server', function() {
  describe('GET Static Files', () => {
    test('should return the content of index.html', (done) => {

        .get('/')
        .expect(200, /<div id="appLoggedOut"/, done);
    });

  });

  xdescribe('Priviledged Access', () => {
    test('Redirects to sign in page when not logged in', () => {
      superReq
        .get('/logged-in.html')
        .expect(302)
        .expect((res) => {
          expect(res.headers.location).to.equal('/');
        })
        .end(done);
    });

    test('should return the content of logged-in.html when logged in', (done) => {
      // TODO log in this session
      superReq
        .get('/logged-in.html')
        .expect(200, /<div id="appLoggedIn"/, done);
    });

  });

  xdescribe('Account Creation', () => {
    test('signup creates a new user record', (done) => {
      superReq
        .post('/signup')
        .type('form')
        .send({
          username: 'Cortin',
          password: 'Cortin'
        })
        .expect(201, function(err) {
          done(err);
        });
    });
    test('signup creates stripe customer account', done => {
      superReq
        .post('/signup')
        .type('form')
        .send({
          username:'abhi',
          password:'bahbi',
          email:'nonsense58493@gmail.com'
        })
        .expect(db.connection.query("SELECT customer_id FROM users WHERE username = 'abhi';")).toBeTruthy()
    })
  });

  describe('Add Passes', done => {
    superReq
      .post('/pass/new')
      .type('form')
      .send({

      })
  })


  describe('Buy Passes Search', () => {
    test('should send all for_sale_blocks (excluding logged-in user) on blank search', (done) => {
      superReq
        .post('/pass/buyer/search')
        .send({searchQueries: {}})
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body[0].first_name).to.equal('Sally');
        })
        .expect(200, function(err) {
          done(err);
        });
    });
    test('should handle POST request with search queries', (done) => {
      superReq
        .post('/pass/buyer/search')
        .send({
          searchQueries: {
                  startDateInput: '2017-05-10',
                  endDateInput: '2017-08-24',
                  priceInput: '20',
                  passesCountInput: '3',
                  gymInput: 'C.C. Cycling'
                }
        })
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body[0].first_name).to.equal('Sally');
        })
        .expect(200, function(err) {
          done(err);
        });
    });
    test('should handle POST request with invalid search queries', (done) => {
      superReq
        .post('/pass/buyer/search')
        .send({
          searchQueries: {
                  startDateInput: 'fawef',
                  endDateInput: 'sdfasdf',
                  priceInput: 'ewfaew',
                  passesCountInput: 'awefwe',
                  gymInput: 'wafaef,wefawef'
                }
        })
        .expect('Content-Type', /json/)
        .expect(500, function(err) {
          done(err);
        });
    });
  });

});

describe('Twilio integration', function() {
  var msg = {
    msgBody: 'stuff',
    msgTo: 'billy@bob.com'
  };
  test('does a thing in jest', (done) => {
    request(server)
      .post('/chat')
      .send(msg)
      .expect(res.status).toBe(635)
      .end(done);
  });
});
