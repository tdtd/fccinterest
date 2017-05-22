'use strict';
const angular = require('angular');

export class addPostComponent {
  /*@ngInject*/
  constructor($scope, $element, $attrs) {
    let self = this;
    this.$scope = $scope;
    this.$element = $element;

    /* Handle Elements */
    let click = false;
    let a = document.getElementById('message-panel');
    a.style.width = '0';
    let clickSet = function(){
      click = true;
    }
    
    let clickHide = function(){
      if ( !click ){
        self.hidePanel('message-panel');
      }
      click = false;
    }
    
    //bind element
    $element.on('click', click)
    //bind body
    angular.element('body').on('click', clickHide)
    //unbind element and body
    $scope.$on('$destroy', () => {
      $element.off('click', clickSet)
      angular.element('body').off('click', clickHide)
    })
  }
  
  $onInit(){
   
  }
  
  togglePanel(id){
    let expandPanel = document.getElementById(id);
    let x = expandPanel.style.width;
    let a = parseInt(x.substr(0, x.length - 2),10);
    if (a > 0) {
      expandPanel.style.width = "0";
    } else {
      expandPanel.style.width = "48rem";
    }
  }
  
  hidePanel(id){
    document.getElementById(id).style.width = 0;
  }
}

export default angular.module('interestApp.addPost', [])
  .component('addPost', {
    template: require('./addPost.html'),
    bindings: { post: '<', submit: '&' },
    controller: addPostComponent
  })
  .name;
