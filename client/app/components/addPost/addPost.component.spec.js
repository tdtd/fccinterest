'use strict';

describe('Component: addPost', function() {
  // load the component's module
  beforeEach(module('interestApp.addPost'));

  var addPostComponent;

  // Initialize the component and a mock scope
  beforeEach(inject(function($componentController) {
    addPostComponent = $componentController('addPost', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
