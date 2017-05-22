'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('usersearch', {
      url: '/usersearch/:id',
      template: '<usersearch></usersearch>'
    });
}
