
build:
	cat \
	    src/jsTop.js \
	    src/main-*.js \
	    src/jsBottom.js \
	     > dist/browser.pajama.js
	cat \
	    src/nodeTop.js \
	    src/main-*.js \
	    src/nodeBottom.js \
	     > dist/node.pajama.js
	cp dist/browser.pajama.js test/frontend/
	cp dist/browser.pajama.js demo/clientside/
	cp dist/node.pajama.js test/backend/
	cp dist/node.pajama.js demo/inverted/
	cp dist/node.pajama.js demo/native/
	cp dist/node.pajama.js demo/serverside/
	cp dist/browser.pajama.js website/js/
	cp dist/browser.pajama.js website/todo-mvc/
	chmod 755 demo/native/sampleApp.js
	uglifyjs dist/browser.pajama.js -m > dist/browser.pajama.min.js
	uglifyjs dist/node.pajama.js -m > dist/node.pajama.min.js

install:
	npm install express socket.io uglify-js vows
	curl -o website/es5-shim.js https://raw.github.com/kriskowal/es5-shim/master/es5-shim.js
	curl -o website/es5-sham.js https://raw.github.com/kriskowal/es5-shim/master/es5-sham.js
	cp website/es5-shim.js test/frontend/
	cp website/es5-sham.js test/frontend/
	curl -o website/qunit-1.12.0.js http://code.jquery.com/qunit/qunit-1.12.0.js
	curl -o website/qunit-1.12.0.css http://code.jquery.com/qunit/qunit-1.12.0.css
	cp website/qunit-1.12.0.js test/frontend/
	cp website/qunit-1.12.0.css test/frontend/
