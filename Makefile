.PHONY: build deploy-homepi

build:
	npm run build

deploy-homepi: build
	npm run deploy-homepi
