'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import 'angular-socket-io';

import uiRouter from 'angular-ui-router';

// import ngMessages from 'angular-messages';
// import ngValidationMatch from 'angular-validation-match';


import {
  routeConfig
} from './app.config';

import _Auth from '../components/auth/auth.module';
import account from './account';
import admin from './admin';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';

import RecentComponent from './recent/recent.component';
import MeComponent from './me/me.component';
import UserComponent from './user/user.component';
import UsersearchComponent from './usersearch/usersearch.component';

import errSrc from './errSrc/errSrc.directive';
import float from './float/float.directive'

import addPost from './components/addPost/addPost.component';
import containersize from './containersize/containersize.directive.js'
import imgpop from './directives/imgpop/imgpop.directive.js'
import './app.scss';

angular.module('interestApp', [ngCookies, ngResource, ngSanitize, 'btford.socket-io', uiRouter,
  _Auth, account, admin, navbar, footer, main, constants, socket, util, RecentComponent, MeComponent, errSrc, addPost, UserComponent, UsersearchComponent, containersize, float, imgpop
])
  .config(routeConfig)
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in

    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if(next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['interestApp'], {
      strictDi: true
    });
  });
