CURRENT_DIR := $(shell basename $(CURDIR))

all: reload

stop:
	docker-compose -f docker-compose.yml down

clean: stop
	docker system prune -af

fclean: clean
	docker volume rm -f $(CURRENT_DIR)_backend
	docker volume rm -f $(CURRENT_DIR)_frontend
	

nocache:
	docker-compose -f docker-compose.yml build --no-cache

reload:
	docker-compose -f docker-compose.yml up --build

re: fclean all
.PHONY: stop clean reload fclean all nocache