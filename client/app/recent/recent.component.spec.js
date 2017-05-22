'use strict';

describe('Component: RecentComponent', function() {
  // load the controller's module
  beforeEach(module('interestApp.recent'));

  var RecentComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    RecentComponent = $componentController('recent', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
