'use strict';

describe('Component: UsersearchComponent', function() {
  // load the controller's module
  beforeEach(module('interestApp.usersearch'));

  var UsersearchComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    UsersearchComponent = $componentController('usersearch', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
