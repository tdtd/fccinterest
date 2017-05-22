'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './recent.routes';

export class RecentComponent {
  /*@ngInject*/
  constructor(Auth, $scope, $http, socket) {
    let self = this;
    this.$http = $http;
    this.socket = socket;
    this.$scope = $scope;
    this.isLoggedIn = Auth.isLoggedIn;
    this.recentPosts = [];
    this.page = 1;
    this.limit = 15;
    this.newPost = {
      title: '',
      comment: '',
      url: ''
    };
    
    function triggerLike(e){
      self.likeFloat(e)
    }
    
    function triggerRepost(e){
      self.repostFloat(e)
    }
    
    socket.socket.on('like', triggerLike)
    socket.socket.on('repost', triggerRepost)
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('post');
      socket.socket.removeAllListeners('like');
      socket.socket.removeAllListeners('repost');
    });
  }

  $onInit() {
    this.isLoggedIn()
      .then((b)=>{
        if (b){
          this.getPostsLogged();
        } else {
          this.getPostsAnon();
        }
      })
  }
  
  /*
   *
    UI
   *
   */
  isClass(bool, falseCase, trueCase){
    return (bool) ? trueCase : falseCase; 
  }
  
  getMorePosts(){
    this.isLoggedIn()
      .then((b)=>{
        if (b){
          this.getPostsLogged(this.page);
        } else {
          this.getPostsAnon(this.page);
        }
      })
    this.page++;
  }
  
  canGetMore(){
    return (this.recentPosts.length < this.page*this.limit) ? true : false;
  }
  
  /*
   *
    Voting System
   *
   */
  likeFloat(post){
    let id = post._id
    let likes = post.likeRating;
    if ($ && id){
      let post = $(`#${id} .like`);
      if (post){
        post.addClass('float').one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
          $(this).removeClass('float');
        });
        this.setLike(id, likes)
      }
    } 
  }
  
  repostFloat(post){
    let id = post._id
    let likes = post.likeRating;
    if ($ && id){
      let post = $(`#${id} .repost`);
      if (post){
        post.addClass('float').one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
          $(this).removeClass('float');
        });
        this.repostIncrement(id);
      }
    } 
  }
  
  likeIncrement(id){
    this.recentPosts.map((post, i) => {
      if (post._id == id){
        post.likeRating++;
      }
    })
  }
  
  repostIncrement(id){
    this.recentPosts.map((post, i) => {
      if (post._id == id){
        post.repostRating++;
      }
    })
  }
  
  setLike(id, rating){
    this.recentPosts.map((post, i) => {
      if (post._id == id){
        post.likeRating = rating;
      }
    })
  }
  
  repostRemove(id){
    this.recentPosts.map((post, i) => {
      if (post._id == id){
        this.recentPosts.splice(i, 1)
      }
    })
  }
  
  /*
   *
    HTTP
   *
   */
  
  addToRecentPosts(data){    
    data.sort((a, b) => {return a.date - b.date}).map((post, i) => {
      if (this.recentPosts.every((check) => {return check._id !== post._id})){
        this.recentPosts.push(post)
      }
    });
  }
  
  getPostsAnon(inc){
    let _inc = inc || 0;
    this.$http.get(`/api/posts?pag=${_inc}&limit=${this.limit}`)
      .then(response => {
        this.addToRecentPosts(response.data);
        this.socket.syncUpdates('post', this.recentPosts, (event, post, posts) => {
          this.recentPosts = posts.sort((a, b) => {
            let c = new Date(a.dateModified);
            let d = new Date(b.dateModified);
            return c>d ? -1 : c<d ? 1 : 0;
          });
        });
    });
  }
  
  getPostsLogged(inc){
    let _inc = inc || 0;
    this.$http.get(`/api/posts/logged?pag=${_inc}&limit=${this.limit}`)
      .then(response => {
        this.addToRecentPosts(response.data);
        this.socket.syncUpdates('post', this.recentPosts, (event, post, posts) => {
          this.recentPosts = posts.sort((a, b) => {
            let d = new Date(a.dateModified);
            let c = new Date(b.dateModified);
            return c>d ? -1 : c<d ? 1 : 0;
          });
        });
      });
  }
  
  /* Post & Put */
  addPost(post) {
    let reg = /(http(s?):)|([/|.|\w|\s])*\.(?:jpg|gif|png)/g;
    if(this.newPost && reg.test(this.newPost.url)) {
      this.$http.post('/api/posts', {
        url: this.newPost.url,
        title: this.newPost.title,
        comment: this.newPost.comment
      });
      this.newPost = {
        title: '',
        comment: '',
        url: ''
      };
    }
  }
  
  likePost(id){
    this.$http.put(`/api/posts/like/${id}`)
      .then((res) => {
        this.setLike(id, res.data.likeRating)
        this.recentPosts.map((post, i) => {
          if (post._id == id){
            this.recentPosts[i].liked = !this.recentPosts[i].liked;
          }
        })
      })
  }
  
  repostPost(id){
    this.$http.put(`/api/posts/repost/${id}`)
      .then((res) => {
        this.repostRemove(id)
      })
  }
  
}

export default angular.module('interestApp.recent', [uiRouter])
  .config(routes)
  .component('recent', {
    template: require('./recent.html'),
    controller: RecentComponent
  })
  .name;
