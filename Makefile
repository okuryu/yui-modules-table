.PHONY: lint build

lint:
	./node_modules/jshint/bin/jshint make_table.js

build:
	phantomjs make_table.js

all: lint
