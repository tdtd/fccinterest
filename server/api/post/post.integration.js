'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newPost;

describe('Post API:', function() {
  describe('GET /api/posts', function() {
    var posts;

    beforeEach(function(done) {
      request(app)
        .get('/api/posts')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          posts = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(posts).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/posts', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/posts')
        .send({
          name: 'New Post',
          info: 'This is the brand new post!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newPost = res.body;
          done();
        });
    });

    it('should respond with the newly created post', function() {
      expect(newPost.name).to.equal('New Post');
      expect(newPost.info).to.equal('This is the brand new post!!!');
    });
  });

  describe('GET /api/posts/:id', function() {
    var post;

    beforeEach(function(done) {
      request(app)
        .get(`/api/posts/${newPost._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          post = res.body;
          done();
        });
    });

    afterEach(function() {
      post = {};
    });

    it('should respond with the requested post', function() {
      expect(post.name).to.equal('New Post');
      expect(post.info).to.equal('This is the brand new post!!!');
    });
  });

  describe('PUT /api/posts/:id', function() {
    var updatedPost;

    beforeEach(function(done) {
      request(app)
        .put(`/api/posts/${newPost._id}`)
        .send({
          name: 'Updated Post',
          info: 'This is the updated post!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedPost = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPost = {};
    });

    it('should respond with the updated post', function() {
      expect(updatedPost.name).to.equal('Updated Post');
      expect(updatedPost.info).to.equal('This is the updated post!!!');
    });

    it('should respond with the updated post on a subsequent GET', function(done) {
      request(app)
        .get(`/api/posts/${newPost._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let post = res.body;

          expect(post.name).to.equal('Updated Post');
          expect(post.info).to.equal('This is the updated post!!!');

          done();
        });
    });
  });

  describe('PATCH /api/posts/:id', function() {
    var patchedPost;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/posts/${newPost._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Post' },
          { op: 'replace', path: '/info', value: 'This is the patched post!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedPost = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedPost = {};
    });

    it('should respond with the patched post', function() {
      expect(patchedPost.name).to.equal('Patched Post');
      expect(patchedPost.info).to.equal('This is the patched post!!!');
    });
  });

  describe('DELETE /api/posts/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/posts/${newPost._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when post does not exist', function(done) {
      request(app)
        .delete(`/api/posts/${newPost._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
