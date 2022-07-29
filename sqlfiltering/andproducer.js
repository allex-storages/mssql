function createAndFilter (lib, BooleanFilter) {
  'use strict';

  function AndFilter (descriptor) {
    BooleanFilter.call(this, descriptor);
  }
  lib.inherit(AndFilter, BooleanFilter);
  AndFilter.prototype.booleanKeyword = 'AND';


  return AndFilter;
}
module.exports = createAndFilter;