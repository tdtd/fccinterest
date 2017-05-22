'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './usersearch.routes';

export class UsersearchComponent {
  /*@ngInject*/
  constructor($stateParams, $http) {
    this.user = $stateParams.id;
    this.$http = $http;
    this.limit = 15;
    this.pag = 0;
    this.usersFound = []
    this.searchFinished = false;
  }
  
  $onInit(){
    this.getUsers(this.user)
  }
  
  getUsers(name){
    this.$http.get(`/api/users/find/${name}?limit=${this.limit}&pag=${this.pag}`)
      .then((res) => {
        this.searchFinished = true;
        this.usersFound = res.data;
      })
      .catch((err) => {
        this.searchFinished = true;
      })
  }
  
  changePage(delt){
    if (this.pag + delt >= 0){
      this.pag += delt;
      this.getUsers(this.user);
    }
  }
  
}

export default angular.module('interestApp.usersearch', [uiRouter])
  .config(routes)
  .component('usersearch', {
    template: require('./usersearch.html'),
    controller: UsersearchComponent,
    controllerAs: 'usCtrl'
  })
  .name;
