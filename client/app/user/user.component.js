'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './user.routes';

export class UserComponent {
  /*@ngInject*/
  constructor(Auth, $stateParams, $http, $scope) {
    this.user = $stateParams.id;
    this.$http = $http;
    this.isLoggedIn = Auth.isLoggedIn;
    this.limit = 15;
    this.page = 1;
    this.searchFinished = false;
    this.recentPosts = [];
  }
  
  $onInit(){
    this.isLoggedIn()
      .then((b)=>{
        if (b){
          this.getPostsLogged(0);
        } else {
          this.getPostsAnon(0);
        }
      })
    
  }
  
  /*
   *
    UI
   *
   */
  canGetMore(){
    return (this.recentPosts.length < this.page*this.limit) ? true : false;
  }
  
  isClass(bool, falseCase, trueCase){
    return (bool) ? trueCase : falseCase; 
  }
  
  
  setLike(id, rating){
    this.recentPosts.map((post, i) => {
      if (post._id == id){
        post.likeRating = rating;
      }
    })
  }
  
  removePost(id){
    this.recentPosts.map((a, i) => {
      if (a._id == id){
        this.recentPosts.splice(i, 1);
      }
    })
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
  
  /*
   *  
    $http
   *
   
  getPostsAnon(){
    this.$http.get(`/api/posts/user/${this.user}`)
      .then(res => {
        this.searchFinished = true;
        console.log(res)
        this.recentPosts = res.data
    })
    .catch(err => {
      console.log(err)
      this.searchFinished = true;
    });
  }
  
  getPostsLogged(user){
    this.$http.get(`/api/posts/userlogged/${user}`)
      .then(response => {
        this.recentPosts = response.data;
      });
  }
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
    this.$http.get(`/api/posts/user/${this.user}?pag=${_inc}&limit=${this.limit}`)
      .then(response => {
        this.addToRecentPosts(response.data);
    });
  }
  
  getPostsLogged(inc){
    let _inc = inc || 0;
    this.$http.get(`/api/posts/userlogged/${this.user}?pag=${_inc}&limit=${this.limit}`)
      .then(response => {
        this.addToRecentPosts(response.data);
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
    
  repostPost(id){
    this.$http.put(`/api/posts/repost/${id}`)
      .then((res) => {
        this.removePost(id)
      })
      .catch(err => {
      console.log(err)
    })
  }
}

export default angular.module('interestApp.user', [uiRouter])
  .config(routes)
  .component('user', {
    template: require('./user.html'),
    controller: UserComponent,
    controllerAs: 'userCtrl'
  })
  .name;
