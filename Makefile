build-kvoip-v2-pg-image:
	docker build -t kvoipcrm/v2-kvoip-pg-spilo:latest -f ./packages/twenty-docker/twenty-postgres-spilo/Dockerfile .

build-kvoip-v2-app-image:
	docker build -t kvoipcrm/v2:latest -f ./packages/twenty-docker/twenty/Dockerfile .

kvoip-postgres-on-docker:
	docker run -d \
	--name kvoip_pg \
	-e PGUSER_SUPERUSER=postgres \
	-e PGPASSWORD_SUPERUSER=kvoipv2_password \
	-e ALLOW_NOSSL=true \
	-v kvoip_db_data:/home/postgres/pgdata \
	-p 5433:5432 \
	kvoipcrm/v2-kvoip-pg-spilo:latest
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec kvoip_pg psql -U postgres -d postgres \
		-c 'SELECT pg_is_in_recovery();' 2>/dev/null | grep -q 'f'; do \
		sleep 1; \
	done
	docker exec kvoip_pg psql -U postgres -d postgres \
		-c "CREATE DATABASE \"kvoip-v2_db\" WITH OWNER postgres;" \
		-c "CREATE DATABASE \"kvoip-v2_db_test\" WITH OWNER postgres;"
		
DOCKER_NETWORK=twenty_network

ensure-docker-network:
	docker network inspect $(DOCKER_NETWORK) >/dev/null 2>&1 || docker network create $(DOCKER_NETWORK)

postgres-on-docker:
	make ensure-docker-network
	docker run -d --network $(DOCKER_NETWORK) \
	--name twenty_pg \
	-e POSTGRES_USER=postgres \
	-e POSTGRES_PASSWORD=postgres \
	-e ALLOW_NOSSL=true \
	-v twenty_db_data:/var/lib/postgresql/data \
	-p 5432:5432 \
	postgres:16
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec twenty_pg psql -U postgres -d postgres \
		-c 'SELECT pg_is_in_recovery();' 2>/dev/null | grep -q 'f'; do \
		sleep 1; \
	done
	docker exec twenty_pg psql -U postgres -d postgres \
		-c "CREATE DATABASE \"default\" WITH OWNER postgres;" \
		-c "CREATE DATABASE \"test\" WITH OWNER postgres;"

redis-on-docker:
	make ensure-docker-network
	docker run -d --network $(DOCKER_NETWORK) --name twenty_redis -p 6379:6379 redis/redis-stack-server:latest

clean-local-dev:
	npx nx reset;
	yarn cache clean --all;
	rm -rf "./.swc";
	rm -rf "./packages/twenty-emails/.swc";
	rm -rf "./packages/twenty-emails/dist";
	rm -rf "./packages/twenty-server/.swc";
	rm -rf "./packages/twenty-server/dist";
	rm -rf "./packages/twenty-front/.swc";
	rm -rf "./packages/twenty-front/build";
	rm -rf "./packages/twenty-shared/.swc";
	rm -rf "./packages/twenty-shared/dist";
	rm -rf "./packages/twenty-ui/dist";
	
clickhouse-on-docker:
	make ensure-docker-network
	docker run -d --network $(DOCKER_NETWORK) --name twenty_clickhouse -p 8123:8123 -p 9000:9000 -e CLICKHOUSE_PASSWORD=devPassword clickhouse/clickhouse-server:latest \

grafana-on-docker:
	make ensure-docker-network
	docker run -d --network $(DOCKER_NETWORK) \
	--name twenty_grafana \
	-p 4000:3000 \
	-e GF_SECURITY_ADMIN_USER=admin \
	-e GF_SECURITY_ADMIN_PASSWORD=admin \
	-e GF_INSTALL_PLUGINS=grafana-clickhouse-datasource \
	-v $(PWD)/packages/twenty-docker/grafana/provisioning/datasources:/etc/grafana/provisioning/datasources \
	grafana/grafana-oss:latest

opentelemetry-collector-on-docker:
	make ensure-docker-network
	docker run -d --network $(DOCKER_NETWORK) \
	--name twenty_otlp_collector \
	-p 4317:4317 \
	-p 4318:4318 \
	-p 13133:13133 \
	-v $(PWD)/packages/twenty-docker/otel-collector/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
	otel/opentelemetry-collector-contrib:latest \
	--config /etc/otel-collector-config.yaml
