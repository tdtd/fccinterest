'use strict';
import Post from './post.model';
import {EventEmitter} from 'events';

const CustomEvents = new class {
  constructor(){
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(0);
  }
  
  emitLike(doc){
    this.emit('like', doc)
  }
  
  emitRepost(doc){
    this.emit('repost', doc)
  }
  
  emit(event, doc){
    Post.populate(doc, {path: 'user', select: 'name'}).then((doc, err) =>{
      if (err) return console.log(err);
      this.emitter.emit(event, doc);
    })
  }
  
}

export default CustomEvents;