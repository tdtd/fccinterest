'use strict';
const angular = require('angular');

export default angular.module('interestApp.float', [])
  .directive('float', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.$on('testLike', ()=>{
          console.log('a test like was received')
        })
        element.on('click', ()=>{ 
          console.log(element.offset())
        })
      }
    };
  })
  .name;
