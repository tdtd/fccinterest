'use strict';

import User from './user.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';

let objectID = require('mongodb').ObjectID;

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.find({}, '-salt -password').exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save()
    .then(function(user) {
      var token = jwt.sign({ _id: user._id }, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      res.json({ token });
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;

  return User.findById(userId).exec()
    .then(user => {
      if(!user) {
        return res.status(404).json(new Error('Invalid request')).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

/**
 *  Get a single users like history
 */
export function getLikesInternal(user){ 
  return User.getLikes(user)
    .then((doc) => {
      return doc;
    })
}

export function getUserIdInternal(name){
  console.log(name)
  return User.getUserId(name)
    .then((doc) => {
      return doc;
    })
  .catch(err => {
    return err;
  })
}

/**
 *  Search for a group of users
 */
export function search(req, res){
  if (!req.params || !('search' in req.params)){
    res.status(400).end();
  }
  
  return User.findLikeUsers({user: req.params.search, limit: req.query.limit, pag: req.query.pag})
    .then((doc) => {
      res.status(200).json(doc)
  })
  .catch(handleError(res))
}

/**
 *  Toggle ID into a like
 *  Not Forward facing
 */
export function userLike(userid, postid){
  return User.checkLike(userid, postid)
    .then((doc) => {
      if (!doc){
        console.log('adding Like')
        User.addLike(userid, postid)
          .then((ndoc) => {
            return ndoc;
          })
      } else {
        console.log('removing like')
        User.removeLike(userid, postid)
          .then((ndoc) => {
            return ndoc;
          })
      }
      return doc;
    })
    .catch(err => {
      console.log('none found')
      return err;
    })
}

/**
 *  Takes a user _id and an array of mongoose objectids, returns the keys that are in located in the user object
 */
export function findLikes(user, array) {
  let finalArr = [];
  return new Promise((resolve, reject) => {
    User.findById(user, '-salt -password').exec()
      .then((doc) => {
        if(!doc) return reject(doc);
        let lenArr = array.length;
        let lenDoc = doc.likes.length;
        for (let i = 0; i < lenArr; i++){
          for (let j = 0; j < lenDoc; j++){
            if (array[lenArr]._id == doc.likes[lenDoc]){
              array[lenArr].hasBeenLiked = true;
            }
          }
          finalArr.push(array[lenArr]);
        }
      return resolve(finalArr)
      })
      .catch(err => { return reject(err) })
    })
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.findById(userId).exec()
    .then(user => {
      if(user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
