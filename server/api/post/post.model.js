'use strict';

import mongoose from 'mongoose';
import _ from 'lodash';
let Schema = mongoose.Schema;
import * as u from './../user/user.controller';
import {registerEvents} from './post.events';
import CustomEvents from './custom.events';

import shortid from 'shortid';

var PostSchema = new mongoose.Schema({
  id:{
    type: String,
    default: shortid.generate
  },
  title: String,
  url: String,
  comment: String,
  like: [{ type : Schema.Types.ObjectId, ref: 'User' }],
  likeRating: {
    type: Number,
    default: 0
  },
  repost : [{ type : Schema.Types.ObjectId, ref: 'User' }],
  repostRating: {
    type: Number,
    default: 0
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    default: new Date
  },
  updated: {
    type: Date,
    default: new Date
  }
});

PostSchema.statics = {
	findByIdandLike: function(id, user) {
    return new Promise((resolve, reject)=>{
    if (!user) return reject(new Error('User was not provided.'))
    this.findById(id)
			.exec((err, doc)=>{
        if (err) return reject(err);
      
        u.userLike(user._id, id)
        .then((change) => {
          if (!change){
            doc.likeRating++;
            CustomEvents.emitLike(doc);
          } else {
            ( doc.likeRating - 1 < 0 ) ? doc.likeRating = 0 : doc.likeRating--;
          }
          this.findByIdAndUpdate(id, doc)
            .select('_id likeRating')
            .exec((err, ndoc) => {
              if (err) { return reject(err)}
              return resolve({_id: doc._id, likeRating: doc.likeRating})
            })
          })
        .catch((err) => {
          return reject(err)
        })
      });	
    })
  },
  findByIdandRepost: function(id, user) {
    let _user = user._id;
    return new Promise((resolve, reject)=>{
    this.find({$and:[{repost: {$nin: [_user]}},  {_id: id}]})
      .where()
			.exec((err, doc) => {
        if (err) return reject(err);
        let _doc = doc[0];
        if(!_doc ) {return reject(new Error("User has already Reposted"))}
        CustomEvents.emitRepost(_doc)
        if (Array.isArray(_doc.repost)){
          _doc.repostRating++;
          _doc.repost.push(_user);
        }
        
        this.findByIdAndUpdate(id, _doc, (err,doc) => {
          if (err) return reject(err)
          return resolve(doc);
        })
        return resolve(doc);
      });	
    })
  },
  findRecent: function(opt, cb) {
    let _opt = opt || {};
    let _pag = normalize(_opt.pag, 0);
    let _limit = normalize(_opt.limit, 15);
    let _user = opt.user || '';
    return new Promise((resolve, reject)=>{
    this.find({})
      .where()
      .sort('-updated')
      .select('-like -repost')
      .populate('user', 'name')
      .skip(_pag * _limit)
			.limit(_limit)
			.exec((err, docs)=>{
        if (err) return reject(err);
        return resolve(docs);
      });	
    })
  },
  //Find Posts that the user has not posted or reposted
  findRecentLoggedIn: function(opt, cb) {
    let _opt = opt || {};
    let _pag = normalize(_opt.pag, 0);
    let _limit = normalize(_opt.limit, 15);
    let _user = opt.user || '';
    return new Promise((resolve, reject)=>{
    this.find({$and:[{repost: {$nin: [_user]}},  {user: {$ne: _user}}]})
      .sort('-updated')
      .select('-like -repost')
      .populate('user', 'name')
      .skip(_pag * _limit)
			.limit(_limit)
			.exec((err, docs)=>{
        if (err) return reject(err);
        return resolve(docs);
      });	
    })
  },
  //Find Recent Posts by a user, allows for pagination
  findUser: function(opt, cb) {
    let _opt = opt || {};
    let _pag = normalize(_opt.pag, 0);
    let _limit = normalize(_opt.limit, 15);
    let _user = opt.user || '';
    return new Promise((resolve, reject)=>{
    this.find({$or:[{repost: {$in: [_user]}},  {user: {$eq: _user}}]})
      .where()
      .sort('-updated')
      .select('-like -repost')
      .populate('user', 'name')
      .skip(_pag * _limit)
			.limit(_limit)
			.exec((err, docs)=>{
        if (err) return reject(err);
        return resolve(docs)
      });	
    })
  },
  //Find Recent Posts by a user, allows for pagination
  findRecentUser: function(opt, cb) {
    let _opt = opt || {};
    let _pag = normalize(_opt.pag, 0);
    let _limit = normalize(_opt.limit, 15);
    let _user = opt.user || '';
    return new Promise((resolve, reject)=>{
    this.find({$or:[{repost: {$in: [_user]}},  {user: {$eq: _user}}]})
      .where()
      .sort('-updated')
      .populate('user', 'name')
      .skip(_pag * _limit)
			.limit(_limit)
			.exec((err, docs)=>{
        if (err) return reject(err);
        u.findLikes(_user, docs)
          .then((liked) => {
            return resolve(liked)
          })
          .catch((err) => {
            return reject(err)
          })
      });	
    })
  },
  //Find If User has post
  findForDelete: function(user, id) {
    return new Promise((resolve, reject) => {
      this.findOne({$and:[{_id: id}, {$or:[{repost: {$in: [user]}},  {user: {$eq: user}}]}]})
        .exec((err, doc) => {
          if (err) return reject(err);
          return resolve(doc)
      })
    })
  },
  removeOwner: function(user, id) {
    return new Promise((resolve, reject) => {
      this.findByIdAndRemove(id)
        .exec((err, doc) => {
          if (err) return reject(err);
          return resolve(doc)
        })
    })
  },
  removeRepost: function(user, id) {
    return new Promise((resolve, reject) => {
      this.findById(id)
        .exec((err, doc) => {
          if (err) return reject(err)
          if (!doc) return reject(new Error("Document not found"))
          if (doc){
            let rating = ( doc.repostRating - 1 < 0 ) ? 0 : doc.repostRating - 1;
            this.update({_id: id}, {$pull: {repost: user }, $set: {repostRating: rating} } )
              .exec((err, docInfo) => {
                if (err) return reject(err);
                return resolve(doc)
            })
          }
      })
    })
  },
  
};

/*
 *  Normalize numbers by turning all strings into integers or just replacing it with a given number
 *  num {number, string or object?} : Parses it to an integer or replaces it
 *  replace {number} : A number to return if the original num does not parse to int
 *  returns an integer either the original or a replacement
 */
function normalize(num, replace){
	let x = parseInt(num, 10)
	return (x && typeof x == 'number') ? x : replace;
}

registerEvents(PostSchema);
export default mongoose.model('Post', PostSchema);
