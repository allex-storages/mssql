function createSqlFiltering (execlib, sqlsentencinglib) {
  'use strict';

  var lib = execlib.lib;

  var mylib = {};
  var map = new lib.Map();
  var BaseFilter = require('./baseproducer')(lib);
  var AllPassFilter = require('./allpassproducer')(lib, BaseFilter);
  var PropertyFilter = require('./propertycreator')(lib, BaseFilter);
  var EqFilter = require('./eqproducer')(lib, PropertyFilter, sqlsentencinglib);
  var LtFilter = require('./ltproducer')(lib, PropertyFilter, sqlsentencinglib);
  map.add('eq', EqFilter);
  map.add('lt', LtFilter);

  mylib.Factory = function(descriptor) {
    if (!descriptor) {
      return new AllPassFilter();
    }
    var filterctor = map.get(descriptor.op);
    if (!filterctor) {
      console.error('MSSQL Storage filter factory does not support', descriptor.op);
      filterctor = BaseFilter;
    }
    return new filterctor(descriptor);
  };

  return mylib;
}
module.exports = createSqlFiltering;