/**
 * Broadcast updates to client when the model changes
 */

'use strict';

import PostEvents from './post.events';
import CustomEvents from './custom.events';


// Model events to emit
var events = ['save', 'remove'];
var cEvents = ['like', 'repost'];

export function register(socket) {
  // Bind model events to socket events
  for(var i = 0, eventsLength = events.length; i < eventsLength; i++) {
    var event = events[i];
    var listener = createListener(`post:${event}`, socket);
    PostEvents.on(event, listener);
    socket.on('disconnect', removeListener(event, listener));
  }
  
  for(var i = 0, len = cEvents.length; i < len; i++) {
    var event = cEvents[i];
    var listener = createListener(event, socket);
    
    CustomEvents.emitter.on(event, listener)
    socket.on('disconnect', removeCustomListener(event, listener));
  }
}


function createListener(event, socket) {
  return function(doc) {
    socket.emit(event, doc);
  };
}

function removeListener(event, listener) {
  return function() {
    PostEvents.removeListener(event, listener);
  };
}

function removeCustomListener(event, listener){
  return function() {
    CustomEvents.emitter.removeListener(event, listener);
  };
}