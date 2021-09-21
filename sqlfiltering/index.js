function createSqlFiltering (execlib, sqlsentencinglib) {
  'use strict';

  var lib = execlib.lib;

  var mylib = {};
  var map = new lib.Map();
  var BaseFilter = require('./baseproducer')(lib);
  var AllPassFilter = require('./allpassproducer')(lib, BaseFilter);
  var PropertyFilter = require('./propertycreator')(lib, BaseFilter);
  var EqFilter = require('./eqproducer')(lib, PropertyFilter, sqlsentencinglib);
  map.add('eq', EqFilter);

  mylib.Factory = function(descriptor) {
    if (!descriptor) {
      return new AllPassFilter();
    }
    var filterctor = map.get(descriptor.op);
    if (!filterctor) filterctor = BaseFilter;
    return new filterctor(descriptor);
  };

  return mylib;
}
module.exports = createSqlFiltering;