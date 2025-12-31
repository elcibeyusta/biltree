.PHONY: dev prod build-dev clean help

help:
	@echo "Available commands:"
	@echo "  make dev       - Start development environment (hot reload, ports 8001/5174)"
	@echo "  make prod      - Start production environment (ports 8000/5173)"
	@echo "  make build-dev - Build development containers"
	@echo "  make clean     - Remove all containers and volumes"
	@echo "  make logs      - View logs from all services"

dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up

dev-build:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up --build

dev-detach:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up -d

prod:
	docker compose up

prod-build:
	docker compose up --build

prod-detach:
	docker compose up -d

down:
	docker compose down

down-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

logs:
	docker compose logs -f

logs-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

clean:
	docker compose down -v
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v

restart:
	docker compose restart

restart-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml restart

db-shell:
	docker compose exec db psql -U postgres -d bilkent_secret_gifts

db-shell-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml exec db psql -U postgres -d bilkent_secret_gifts_dev

backend-shell:
	docker compose exec backend sh

backend-shell-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend sh

migrate:
	docker compose exec backend python manage.py migrate

migrate-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py migrate

createsuperuser:
	docker compose exec backend python manage.py createsuperuser

createsuperuser-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py createsuperuser
