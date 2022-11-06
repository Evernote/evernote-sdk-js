NPM = npm

.PHONY: start
start:
	$(NPM) start

.PHONY: install
install:
	$(MAKE) config
	$(NPM) install

config:
	cp -n config.json.template config.json
