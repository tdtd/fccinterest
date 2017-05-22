'use strict';

describe('Directive: imgpop', function() {
  // load the directive's module and view
  beforeEach(module('interestApp.imgpop'));
  beforeEach(module('app/directives/imgpop/imgpop.html'));

  var element, scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<imgpop></imgpop>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the imgpop directive');
  }));
});
