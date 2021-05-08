cat tests-from-master/*.coffee | coffee -cbs > all-tests-from-master.js
cat all-tests-from-master.js run-tests-from-master.js | node 
