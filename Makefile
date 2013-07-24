
build:
	cat \
	    jsTop.js \
	    main.js \
	    jsBottom.js \
	     > ./browser.pajama.js
	uglifyjs browser.pajama.js -m > browser.pajama.min.js
	cat \
	    nodeTop.js \
	    main.js \
	    nodeBottom.js \
	     > ./node.pajama.js
	uglifyjs node.pajama.js -m > node.pajama.min.js

