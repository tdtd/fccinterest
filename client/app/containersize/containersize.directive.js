'use strict';
const angular = require('angular');

export default angular.module('interestApp.containersize', [])
  .directive('containersize', function($window) {
  /*@ngInject*/
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        let _size = ((typeof attrs.size == 'number') ? attrs.size : parseInt(attrs.size, 10)) || 992;
        angular.element($window).on('resize', () =>{
          let _windowSize = angular.element($window).width();
          if (_size > _windowSize){
           element.toggleClass('container-fluid', true)
           element.toggleClass('container', false)
          } else {
            element.toggleClass('container', true)
            element.toggleClass('container-fluid', false)
          }
        })
      }
    };
  })
  .name;
