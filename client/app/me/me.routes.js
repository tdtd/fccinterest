'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('me', {
      url: '/me',
      template: '<me></me>'
    });
}
