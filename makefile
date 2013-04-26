.PHONY: test

setup: static/glimpse/glimpse.js

static/glimpse/glimpse.js:
	curl -L "https://raw.github.com/Glimpse/Glimpse/master/source/Glimpse.JavaScript/glimpse.js" > $@

node_modules: package.json
	npm install

test: setup
	node_modules/.bin/nodeunit tests/*.tests.js
	node_modules/.bin/nodeunit tests/global.tests-evil.js
