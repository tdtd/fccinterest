/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/posts              ->  index
 * POST    /api/posts              ->  create
 * GET     /api/posts/:id          ->  show
 * PUT     /api/posts/:id          ->  upsert
 * PATCH   /api/posts/:id          ->  patch
 * DELETE  /api/posts/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Post from './post.model';
import _ from 'lodash';
import * as u from './../user/user.controller';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function getUserByNameLogged(id, user, req, res){
  return u.getUserIdInternal(req.params.id)
    .then((doc) => {
      return Post.findUser({user: doc._id, pag: req.query.pag, limit: req.query.limt})
        .then(handleEntityNotFound(res))
        .then((posts) => {
        return u.getLikesInternal(user)
          .then((likes) => {
          let array = [];
              for (let i = 0, len = posts.length; i < len; i++){
                let cur = posts[i].toObject();
                if (likes.likes.indexOf(cur._id) >= 0){
                  cur.liked = true;
                } else {
                  cur.liked = false;
                }
                array.push(cur)
              }
              return res.status(200).json(array);       
            })
          .catch(handleError(res));
        })
        .catch(handleError(res));
  })
  .catch(handleError(res))
}

function getUserByIdLogged(id, user, req, res){
  return Post.findUser({user: id, pag: req.query.pag, limit: req.query.limt})
    .then(handleEntityNotFound(res))
    .then((posts) => {
    return u.getLikesInternal(user)
      .then((likes) => {
      let array = [];
      for (let i = 0, len = posts.length; i < len; i++){
        let cur = posts[i].toObject();
        if (likes.likes.indexOf(cur._id) >= 0){
          cur.liked = true;
        } else {
          cur.liked = false;
        }
        array.push(cur)
      }
      return res.status(200).json(array);       
    })
      .catch(handleError(res));
  })
    .catch(handleError(res));
}


/*
 * Gets a list of Posts Without checking if the user has posted them
 *  Supports pagination
 */

export function recent(req, res) {
  return Post.findRecent({pag: req.query.pag, limit: req.query.limit})
    .then(respondWithResult(res))
    .catch(handleError(res));
}

/*
 * Gets a list of Posts While checking if the user has posted them
 */

export function recentLoggedIn(req, res) {
  if (!('user' in req)){
    res.status(400).end();
  }
  
  let user = req.user._id;
  return Post.findRecentLoggedIn({user: user, pag: req.query.pag, limit: req.query.limit})
    .then((posts) => {
     return u.getLikesInternal(user)
        .then((likes) => {
          let array = [];
          for (let i = 0, len = posts.length; i < len; i++){
            let cur = posts[i].toObject();
            if (likes.likes.indexOf(cur._id) >= 0){
              cur.liked = true;
            } else {
              cur.liked = false;
            }
            array.push(cur)
          }
          return res.status(200).json(array);       
        })
      .catch((err)=>{
       handleError(res)});
    })
    .catch(handleError(res));
}


/*
 *  Gets a users posts.
 *   Supports pagination
 */

export function showUser(req, res) {
  if (!("params" in req) || !("id" in req.params)){
    res.status(400).end();
  }
  let user = req.params.id;
  return u.getUserIdInternal(user)
    .then((doc) => {
      return Post.findUser({user: doc._id, pag: req.query.pag, limit: req.query.limt})
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
    })
}

export function showLoggedUser(req, res) {
  if (!("params" in req) || !("id" in req.params)){
    res.status(400).end();
  }
  let user = req.user._id;
  let id = req.params.id;
  
  if (id.match(/^[0-9a-fA-F]{24}$/)){
    return getUserByIdLogged(id, user, req, res)
  } else {
    return getUserByNameLogged(id, user, req, res)
  }
}

// Creates a new Post in the DB
export function create(req, res) {
  let reg = /(http(s?):)|([/|.|\w|\s])*\.(?:jpg|gif|png)/g;
  let user = req.user._id;
  
  if (!("url" in req.body) || !reg.test(req.body.url)){
    res.status(400).end();
  }

  if (('title' in req.body) && typeof req.body.title != 'string') {
    req.body.title = '';
  }
  
  if (('comment' in req.body) && typeof req.body.comment != 'string') {
    req.body.comment = '';
  }
  
  delete req.body._id;
  delete req.body.id;
  delete req.body.date;
  delete req.body.updated;
  delete req.body.like;
  delete req.body.repost;

  req.body.user = user;
  return Post.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(err => {
      console.log(err)
    });
}

//Post Like
export function likePost(req, res){
  if (!req.params || !('id' in req.params)){
    return res.status(400).json(new Error('Must include id'));
  }
  return Post.findByIdandLike(req.params.id, req.user)
    .then(respondWithResult(res))
    .catch((err) => {
      return res.status(400).json(new Error('User has already liked'));
  })
}

//Post repost
export function repostPost(req, res){
  if (!req.params || !('id' in req.params)){
    return res.status(400).json(new Error('Must include id'));
  }
  
  return Post.findByIdandRepost(req.params.id, req.user)
    .then(respondWithResult(res))
    .catch((err)=> {
      return res.status(400).json(new Error('User has already reposted'));
    })
}

/*
 *  findForDelete takes an authenticated User and an id parameter. 
 *  Returns the first doc in the array (should only ever be one).
 *  Checks if the user is the creator or a reposter then removes that one
 */
export function markDelete(req, res){
  let user = req.user._id;
  let id = req.params.id;
  return Post.findForDelete(user, id)
    .then((doc) => {
      if(!doc) return res.status(404).end();
      if (doc.user && doc.user.equals(user)){
        return Post.removeOwner(user, id)
          .then(respondWithResult(res))
          .catch(handleError(res));
      } else{
        return Post.removeRepost(user, id)
          .then(respondWithResult(res))
          .catch(handleError(res))
      } 
    })
    .catch((err) => {
      console.log(err)
    })
}

// Deletes a Post from the DB 
export function destroy(req, res) {
  return Post.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
