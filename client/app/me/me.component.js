'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './me.routes';

export class MeComponent {
  /*@ngInject*/
  constructor(Auth, $http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;
    this.gcu = Auth.getCurrentUser;
    this.page = 0;
    this.limit = 15;
    this.recentPosts = [];
  }
  
  $onInit(){
    this.gcu()
      .then((user)=>{
        this.getPostsLogged(user, this.page);
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
  
  removePost(id){
    this.recentPosts.map((a, i) => {
      if (a._id == id){
        this.recentPosts.splice(i, 1);
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
   
  getMorePosts(){
    this.gcu()
      .then((user)=>{
      this.getPostsLogged(user, this.page);
    })
  }
  
  canGetMore(){
    return (this.recentPosts.length < this.page*this.limit) ? true : false;
  }
  
  addToRecentPosts(data){
    data.sort((a, b) => {return a.date - b.date}).map((post, i) => {
      if (this.recentPosts.every((check) => {return check._id !== post._id})){
        this.recentPosts.push(post)
      }
    });
  }
  
  /*
   *  
    $http
   *
   */
  getPostsLogged(user, inc){
    let _inc = inc || 0;
    this.$http.get(`/api/posts/userlogged/${user.name}?pag=${this.page}&limit=${this.limit}`)
      .then(response => {
        this.page++;
        this.addToRecentPosts(response.data)
      });
  }
  
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

  deletePost(post) {
    this.$http.delete(`/api/posts/${post}`)
      .then((res) => {
        this.removePost(post)
    });
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
  
}

export default angular.module('interestApp.me', [uiRouter])
  .config(routes)
  .component('me', {
    template: require('./me.html'),
    controller: MeComponent
  })
  .name;
