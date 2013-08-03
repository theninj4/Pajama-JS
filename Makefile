
build:
	cat \
	    src/jsTop.js \
	    src/main.js \
	    src/jsBottom.js \
	     > dist/browser.pajama.js
	uglifyjs dist/browser.pajama.js -m > dist/browser.pajama.min.js
	cat \
	    src/nodeTop.js \
	    src/main.js \
	    src/nodeBottom.js \
	     > dist/node.pajama.js
	uglifyjs dist/node.pajama.js -m > dist/node.pajama.min.js
	cp dist/browser.pajama.js test/frontend/
	cp dist/browser.pajama.js demo/clientside/
	cp dist/node.pajama.js test/backend/
	cp dist/node.pajama.js demo/inverted/
	cp dist/node.pajama.js demo/serverside/
	cp dist/browser.pajama.min.js website/

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
