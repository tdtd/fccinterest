/**
 * Post model events
 */

'use strict';
import Post from './post.model';
import {EventEmitter} from 'events';
var PostEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PostEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Post) {
  for(var e in events) {
    let event = events[e];
    Post.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    delete doc.like;
    delete doc.repost;
    Post.populate(doc, {path: 'user', select: 'name'}).then((doc, err) =>{
      if (err) return console.log(err);
      PostEvents.emit(event + ':' + doc._id, doc);
      PostEvents.emit(event, doc);
    })
  };
}

export {registerEvents};
export default PostEvents;
