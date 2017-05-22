'use strict';
const angular = require('angular');

export default angular.module('interestApp.errSrc', [])
  .directive('errSrc', function() {
    return {
      link: function(scope, element, attrs) {
        
        element.on('error', function() {
          if (attrs.src != attrs.errSrc) {
            attrs.$set('src', attrs.errSrc);
          }
        });
        
        attrs.$observe('errSrc', function(value) {
          if (!value && attrs.errSrc) {
            attrs.$set('src', attrs.errSrc);
          }
        });
      }
    };
  })
  .name;
