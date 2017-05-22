'use strict';
const angular = require('angular');

export default angular.module('interestApp.imgpop', [])
  .directive('imgpop', function($window) {
    return {
      template: require('./imgpop.html'),
      restrict: 'A',
      link: function(scope, element, attrs) {
        let imgModal;
        function width(){
          let w = angular.element($window).width();
          if (w < 512) return 'img-modal-img-xs';
          return (w < 992) ? 'img-modal-img-sm' : 'img-modal-img-lg';
        }
        element.on('click', function(){
          if (attrs.errSrc == attrs.src){
            return;
          }
          element.parent().append(`<div class="img-modal"><img class="${width()}" src="${attrs.src}"></div>`);
          imgModal = element.parent().find('.img-modal');
          imgModal.on('click', function(){
            imgModal.remove();
          })
        })
        
      }
    };
  })
  .name;
