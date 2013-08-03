
Pajama-JS, aka 'pjs'
===

The website for this project can be found here: www.pajamajs.com

The src for the website is in this repo.


Getting Started
---

To load all the necessary dependancies for testing: `make install`

To run the backend PajamaJS Vows tests: `node test/backend/test.js`

To run the frontend PajamaJS QUnit tests: `node test/frontend/server.js` then browse to `localhost:8080`

To run the clientside PajamaJS demo: `node demo/clientside/server.js` then browse to `localhost:8080`

To run the serverside PajamaJS demo: `node demo/serverside/server.js` then browse to `localhost:8080`

To run the inverted PajamaJS demo: `node demo/inverted/server.js` then browse to `localhost:8080/index`

After making any changes to the `src` folder: `make build`
