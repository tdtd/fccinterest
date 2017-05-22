'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('user', {
      url: '/user/:id',
      template: '<user></user>'
    });
}
