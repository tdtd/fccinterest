'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('recent', {
      url: '/recent',
      template: '<recent></recent>'
    });
}
