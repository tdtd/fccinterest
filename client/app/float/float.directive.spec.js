'use strict';

describe('Directive: float', function() {
  // load the directive's module
  beforeEach(module('interestApp.float'));

  var element,
    scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<float></float>');
    element = $compile(element)(scope);
    expect(element.text()).to.equal('this is the float directive');
  }));
});
