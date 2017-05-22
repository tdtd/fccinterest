'use strict';
/*eslint no-invalid-this:0*/
import crypto from 'crypto';
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';
import {registerEvents} from './user.events';
import shortid from 'shortid';
const authTypes = ['github', 'twitter', 'facebook', 'google'];

var UserSchema = new Schema({
  id:{
    type: String,
    default: shortid.generate
  },
  name: String,
  joined: {
    type: Date,
    default: new Date
  },
  lastActive: {
    type: Date,
    default: new Date
  },
  likes:  [{ type : Schema.Types.ObjectId, ref: 'Post' }],
  email: {
    type: String,
    lowercase: true,
    required() {
      if(authTypes.indexOf(this.provider) === -1) {
        return true;
      } else {
        return false;
      }
    }
  },
  role: {
    type: String,
    default: 'user'
  },
  password: {
    type: String,
    required() {
      if(authTypes.indexOf(this.provider) === -1) {
        return true;
      } else {
        return false;
      }
    }
  },
  provider: String,
  salt: String,
  twitter: {},
  github: {}
});

/**
 * Statics
 */
UserSchema.statics = {
  findLikeUsers: function(opt, cb) {
    let _opt = opt || {};
    let _user = escapeRegExp(opt.user);
    let _pag = _opt.pag || 0;
    let _limit = _opt.limit || 1;
    return new Promise((resolve, reject)=>{
    this.find({name: new RegExp('^'+_user, "i")})
      .where()
      .sort('-lastActive')
      .select('id name last Active')
      .skip(_pag * _limit)
			.limit(_limit)
			.exec((err, docs)=>{
        if (err) return reject(err);
        return resolve(docs);
      });	
    })
  },
  findUserLikes: function(opt) {
    return new Promise((resolve, reject)=>{
    this.find({repost: {$nin: [_user]}})
      .select('_id')
			.exec((err, docs)=>{
        if (err) return reject(err);
        return resolve(docs);
      });	
    })
  },
  getLikes: function(user) {
    return new Promise((resolve, reject) => {
      this.findById(user)
        .select('_id likes')
        .exec((err, doc) => {
          if (err) return reject(err);
          return resolve(doc)
        })
    })
  },
  getUserId:function(user) {
    return new Promise((resolve, reject) => {
      this.findOne({name: user})
        .select('_id')
        .exec((err, doc) => {
          if (err) return reject(err);
          if (!doc) return reject(new Error('No document found.'))
          return resolve(doc)
        })
    })
  }, 
  /*
    Check if id is in array if not add, if remove
  */
  checkLike: function(user, post) {
    console.log(user)
    return new Promise((resolve, reject)=>{
    this.findOne({_id: user, likes: post})
      .select('_id')
			.exec((err, doc)=>{
        console.log(doc)
        if (err) return reject(err);
        return resolve(doc);
      });	
    })
  },
  addLike: function(user, id){
    return new Promise((resolve, reject) => {
      this.findByIdAndUpdate(user, {$push: {"likes": id}})
        .exec((err, doc) => {
          if (err) return reject(err);
          return resolve({add: true})
      })
    })
  },
  removeLike: function(user, id){
    return new Promise((resolve, reject) => {
      this.findByIdAndUpdate(user, {$pull: {"likes": id}})
        .exec((err, doc) => {
          if (err) return reject(err);
          return resolve({add: false})
      })
    })
  }
}


/**
 * Virtuals
 */

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      name: this.name,
      role: this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      _id: this._id,
      role: this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    if(authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('password')
  .validate(function(password) {
    if(authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return password.length;
  }, 'Password cannot be blank');

// Validate name is not taken
UserSchema
  .path('name')
    .validate(function(value, respond) {
    return this.constructor.findOne({ name: value }).exec()
      .then(user => {
        if(user) {
          if(this.id === user.id) {
            return respond(true);
          }
          return respond(false);
        }
        return respond(true);
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified name is already in use.');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    if(authTypes.indexOf(this.provider) !== -1) {
      return respond(true);
    }

    return this.constructor.findOne({ email: value }).exec()
      .then(user => {
        if(user) {
          if(this.id === user.id) {
            return respond(true);
          }
          return respond(false);
        }
        return respond(true);
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    // Handle new/update passwords
    if(!this.isModified('password')) {
      return next();
    }

    if(!validatePresenceOf(this.password)) {
      if(authTypes.indexOf(this.provider) === -1) {
        return next(new Error('Invalid password'));
      } else {
        return next();
      }
    }

    // Make salt with a callback
    this.makeSalt((saltErr, salt) => {
      if(saltErr) {
        return next(saltErr);
      }
      this.salt = salt;
      this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
        if(encryptErr) {
          return next(encryptErr);
        }
        this.password = hashedPassword;
        return next();
      });
    });
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate(password, callback) {
    if(!callback) {
      return this.password === this.encryptPassword(password);
    }

    this.encryptPassword(password, (err, pwdGen) => {
      if(err) {
        return callback(err);
      }

      if(this.password === pwdGen) {
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    });
  },

  /**
   * Make salt
   *
   * @param {Number} [byteSize] - Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt(byteSize, callback) {
    var defaultByteSize = 16;

    if(typeof arguments[0] === 'function') {
      callback = arguments[0];
      byteSize = defaultByteSize;
    } else if(typeof arguments[1] === 'function') {
      callback = arguments[1];
    } else {
      throw new Error('Missing Callback');
    }

    if(!byteSize) {
      byteSize = defaultByteSize;
    }

    return crypto.randomBytes(byteSize, (err, salt) => {
      if(err) {
        return callback(err);
      } else {
        return callback(null, salt.toString('base64'));
      }
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword(password, callback) {
    if(!password || !this.salt) {
      if(!callback) {
        return null;
      } else {
        return callback('Missing password or salt');
      }
    }

    var defaultIterations = 10000;
    var defaultKeyLength = 64;
    var salt = new Buffer(this.salt, 'base64');

    if(!callback) {
      return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength)
        .toString('base64');
    }

    return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, (err, key) => {
      if(err) {
        return callback(err);
      } else {
        return callback(null, key.toString('base64'));
      }
    });
  }
};

//USER functions
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


registerEvents(UserSchema);
export default mongoose.model('User', UserSchema);
