/* eslint-env jest */

import { migrateToCommonSpec, validateDockerComposeToCommonSpec } from '../src';

test('invalid yaml', () => {
    expect(() => {
        migrateToCommonSpec(
            `
myapp:
  image: myapp-image
  volumes: 
    - data:/app/data
  - /data:/app/data
net: container:db
  ports:
    - "3000"
db:
  image: postgresql`,
            { expandVolumes: true, expandPorts: true },
        );
    }).toThrowErrorMatchingInlineSnapshot(`
"All collection items must start at the same column at line 2, column 1
A collection cannot be both a mapping and a sequence at line 3, column 3
Failed to resolve SEQ_ITEM node here at line 6, column 3
Implicit map keys need to be followed by map values at line 6, column 3
Nested mappings are not allowed in compact mappings at line 7, column 6
Implicit map keys need to be on a single line at line 7, column 6
Failed to resolve SEQ_ITEM node here at line 9, column 5
Implicit map keys need to be followed by map values at line 9, column 5"
`);
});

test('v1 to CommonSpec, custom indent 2', () => {
    expect(
        migrateToCommonSpec(
            `
myapp:
  image: myapp-image
  net: container:db
db:
  image: postgresql
`,
            { indent: 2 },
        ),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
          myapp:
            image: myapp-image
            network_mode: service:db
          db:
            image: postgresql"
    `);
});

test('validate valid Docker Compose', () => {
    expect(
        validateDockerComposeToCommonSpec(`
name: xxx
services:
  myapp:
    image: myapp-image
  db:
    image: postgresql
`),
    ).toEqual([]);
});

test('validate simple invalid Docker Compose', () => {
    expect(
        JSON.stringify(
            validateDockerComposeToCommonSpec(`
name: xxx
services:
  myapp:
    image: myapp-image
    net: container:db
    volumes:
      - xxx
  db:
    image: postgresql
`),
        ),
    ).toMatchInlineSnapshot(
        `"[{\\"line\\":6,\\"message\\":\\"Line 6(/services/myapp/net): 'net' is unknown for '/services/myapp/net'\\",\\"helpLink\\":\\"https://docs.docker.com/compose/compose-file/05-services/#net\\"},{\\"line\\":8,\\"message\\":\\"Line 8(/services/myapp/volumes/0): must have a valid syntax for 'volumes'\\",\\"helpLink\\":\\"https://docs.docker.com/compose/compose-file/05-services/#volumes\\"},{\\"line\\":8,\\"message\\":\\"Line 8(/services/myapp/volumes/0): must be object (type: {\\\\\\"type\\\\\\":\\\\\\"object\\\\\\"})\\",\\"helpLink\\":\\"https://docs.docker.com/compose/compose-file/05-services/#volumes\\"},{\\"line\\":8,\\"message\\":\\"Line 8(/services/myapp/volumes/0): must be either a Short Syntax (string(s)) or a Long Syntax (object(s))\\",\\"helpLink\\":\\"https://docs.docker.com/compose/compose-file/05-services/#volumes\\"}]"`,
    );
});

test('validate complex invalid Docker Compose', () => {
    expect(
        JSON.stringify(
            validateDockerComposeToCommonSpec(`
services:
   db:
     image: mysql:latest
     volumes:
       - db_data:/var/lib/mysql
     environment:
       MYSQL_ROOT_PASSWORD_FILE: /run/secrets/db_root_password
       MYSQL_DATABASE: wordpress
       MYSQL_USER: wordpress
       MYSQL_PASSWORD_FILE: /run/secrets/db_password
     secrets:
       - db_root_password
       - db_password

   wordpress:
     depends_on:
       - db
     image: wordpress:latest
     ports:
       - "8000:80"
     environment:
       WORDPRESS_DB_HOST: db:3306
       WORDPRESS_DB_USER: wordpress
       WORDPRESS_DB_PASSWORD_FILE: /run/secrets/db_password
     secrets:
       - db_password

dontexists:

networks:
  front-tier:
    truc:
  
configs:
  http_config:
    fiel: ./httpd.conf

secrets:
   db_password:
     fiel: db_password.txt
   db_root_password:
     file: db_root_password.txt

volumes:
    db_data:
      truc:
`),
        ),
    ).toMatchInlineSnapshot(
        `"[{\\"line\\":2,\\"message\\":\\"Line 2(/dontexists): 'dontexists' is unknown for '/dontexists'\\",\\"helpLink\\":\\"https://docs.docker.com/compose/compose-file/\\"},{\\"line\\":33,\\"message\\":\\"Line 33(/networks/front-tier/truc): 'truc' is unknown for '/networks/front-tier/truc'\\",\\"helpLink\\":\\"https://docs.docker.com/compose/compose-file/06-networks/#truc\\"},{\\"line\\":47,\\"message\\":\\"Line 47(/volumes/db_data/truc): 'truc' is unknown for '/volumes/db_data/truc'\\",\\"helpLink\\":\\"https://docs.docker.com/compose/compose-file/07-volumes/#truc\\"},{\\"line\\":41,\\"message\\":\\"Line 41(/secrets/db_password/fiel): 'fiel' is unknown for '/secrets/db_password/fiel'\\",\\"helpLink\\":\\"https://docs.docker.com/compose/compose-file/09-secrets/#fiel\\"},{\\"line\\":37,\\"message\\":\\"Line 37(/configs/http_config/fiel): 'fiel' is unknown for '/configs/http_config/fiel'\\",\\"helpLink\\":\\"https://docs.docker.com/compose/compose-file/08-configs/#fiel\\"}]"`,
    );
});
