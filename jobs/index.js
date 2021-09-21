function createMSSQLStorageJobs (execlib, sqlsentencinglib) {
  'use strict';
  var lib = execlib.lib, 
    mylib = {};
    require ('./basecreator')(lib, mylib);
    require ('./singlequerycreator')(lib, mylib);
    require ('./indexlistercreator')(lib, mylib, sqlsentencinglib);
    require ('./indexcreatorcreator')(lib, mylib, sqlsentencinglib);
    require ('./indexdroppercreator')(lib, mylib, sqlsentencinglib);
  return mylib;
}
module.exports = createMSSQLStorageJobs;