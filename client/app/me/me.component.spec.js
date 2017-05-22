'use strict';

describe('Component: MeComponent', function() {
  // load the controller's module
  beforeEach(module('interestApp.me'));

  var MeComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    MeComponent = $componentController('me', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
