/* eslint-env jest */

import { migrateFromV1ToV2x } from '../src';

test('v1 to v2', () => {
    expect(
        migrateFromV1ToV2x(`
someapp:
  build: ./
  dockerfile: Dockerfile
  command: /usr/bin/start
  dns:
    - 8.8.8.8
    - 9.9.9.9
  environment:
    RACK_ENV: development
    SESSION_SECRET:
  extends:
    file: common.yml
    service: webapp
  external_links:
    - redis_1
    - project_db_1:mysql
    - project_db_1:postgresql
  hostname: foo
  image: centos/centos7
  links:
    - db
    - db:database
    - redis
  mem_limit: 1000000000
  net: "bridge"
  ports:
    - "3000"
    - "8000:8000"
    - "49100:22"
    - "127.0.0.1:8001:8001"
  restart: always
  user: postgresql
  volumes:
    - /var/lib/mysql
    - cache/:/tmp/cache
    - ~/configs:/etc/configs/:ro
  volumes_from:
    - someapp
    - container_name
  working_dir: /code		
		`),
    ).toMatchInlineSnapshot(`
        "# Service someapp has links, which no longer create environment variables such as DB_PORT. If you are using those in your application code, you should instead connect directly to the hostname, e.g. 'db'.
        # Service someapp has external_links: redis_1,project_db_1:mysql,project_db_1:postgresql, which now work slightly differently. In particular, two containers must be connected to at least one network in common to communicate, even if explicitly linked together.
        #
        #Either connect the external container to your app's default network, or connect both the external container and your service's containers to a pre-existing network. See https://docs.docker.com/compose/networking/ for more on how to do this.
        version: \\"2.4\\"
        services:
            someapp:
                build:
                    context: ./
                    dockerfile: Dockerfile
                command: /usr/bin/start
                dns:
                    - 8.8.8.8
                    - 9.9.9.9
                environment:
                    RACK_ENV: development
                    SESSION_SECRET:
                extends:
                    file: common.yml
                    service: webapp
                external_links:
                    - redis_1
                    - project_db_1:mysql
                    - project_db_1:postgresql
                hostname: foo
                image: centos/centos7
                links:
                    - db
                    - db:database
                    - redis
                mem_limit: 1000000000
                ports:
                    - \\"3000\\"
                    - 8000:8000
                    - 49100:22
                    - 127.0.0.1:8001:8001
                restart: always
                user: postgresql
                volumes:
                    - /var/lib/mysql
                    - cache/:/tmp/cache
                    - ~/configs:/etc/configs/:ro
                volumes_from:
                    - someapp
                    - container:container_name
                working_dir: /code
                network_mode: bridge"
    `);
});

test('v1 net service: ', () => {
    expect(
        migrateFromV1ToV2x(`
myapp:
  image: myapp-image
  net: container:db
db:
  image: postgresql
`),
    ).toMatchInlineSnapshot(`
        "version: \\"2.4\\"
        services:
            myapp:
                image: myapp-image
                network_mode: service:db
            db:
                image: postgresql"
    `);
});

test('v1 net container: ', () => {
    expect(
        migrateFromV1ToV2x(`
myapp:
  image: myapp-image
  net: container:db
`),
    ).toMatchInlineSnapshot(`
        "version: \\"2.4\\"
        services:
            myapp:
                image: myapp-image
                network_mode: container:db"
    `);
});

test('v1 logging ', () => {
    expect(
        migrateFromV1ToV2x(`
myapp:
  image: myapp-image
  log_driver: json-file
  log_opt: 
    max-size: 15MB
`),
    ).toMatchInlineSnapshot(`
        "version: \\"2.4\\"
        services:
            myapp:
                image: myapp-image
                logging:
                    driver: json-file
                    options:
                        max-size: 15MB"
    `);
});

test('v1 logging 2 ', () => {
    expect(
        migrateFromV1ToV2x(`
myapp:
  image: myapp-image
  log_driver: json-file
`),
    ).toMatchInlineSnapshot(`
        "version: \\"2.4\\"
        services:
            myapp:
                image: myapp-image
                logging:
                    driver: json-file"
    `);
});

test('v1 net named volumes ', () => {
    expect(
        migrateFromV1ToV2x(`
myapp:
  image: myapp-image
  volumes: 
    - data:/app/data
`),
    ).toMatchInlineSnapshot(`
"# Named volumes ({\\"data\\":{\\"external\\":true,\\"name\\":\\"data\\"}}) must be explicitly declared. Creating a 'volumes' section with declarations.
#
#For backwards-compatibility, they've been declared as external. If you don't mind the volume names being prefixed with the project name, you can remove the 'external' option from each one.
version: \\"2.4\\"
services:
    myapp:
        image: myapp-image
        volumes:
            - data:/app/data
volumes:
    - data:
          external: true
          name: data"
`);
});

test('no conversion from V1 if V3', () => {
    expect(
        migrateFromV1ToV2x(`
version: '3'
services:
  myapp:
    image: myapp-image
`),
    ).toMatchInlineSnapshot(`
            "
            version: '3'
            services:
              myapp:
                image: myapp-image
            "
      `);
});

test('no conversion from V1 if V2', () => {
    expect(
        migrateFromV1ToV2x(`
version: '2'
services:
  myapp:
    image: myapp-image
`),
    ).toMatchInlineSnapshot(`
            "
            version: '2'
            services:
              myapp:
                image: myapp-image
            "
      `);
});
