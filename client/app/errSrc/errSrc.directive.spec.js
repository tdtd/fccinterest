'use strict';

describe('Directive: ngSrc', function() {
  // load the directive's module
  beforeEach(module('interestApp.ngSrc'));

  var element,
    scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<ng-src></ng-src>');
    element = $compile(element)(scope);
    expect(element.text()).to.equal('this is the ngSrc directive');
  }));
});
