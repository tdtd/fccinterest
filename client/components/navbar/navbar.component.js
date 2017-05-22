'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  menu = [{
    title: 'Home',
    state: 'main'
  },
  {
    title: 'Recent Posts',
    state: 'recent'
  }];

  isCollapsed = true;

  constructor(Auth, $state) {
    'ngInject';

    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.userSearch = '';
    
    this.$state = $state;
    $('.navbar-nav').on('click', function(){
      $('.navbar-collapse').collapse('hide');
    });
  }

  $onInit(){
    
  }

  searchSubmit(){
    this.$state.go('usersearch', {id: this.userSearch});
    this.userSearch = '';
  }

}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
