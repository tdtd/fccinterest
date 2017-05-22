'use strict';

describe('Directive: containersize', function() {
  // load the directive's module
  beforeEach(module('interestApp.containersize'));

  var element,
    scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<containersize></containersize>');
    element = $compile(element)(scope);
    expect(element.text()).to.equal('this is the containersize directive');
  }));
});
