/* eslint-env jest */

import {
    migrateToCommonSpec,
    validateDockerComposeToCommonSpec,
    migrateFromV3xToV2x,
    migrateFromV2xToV3x,
} from '../src';

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
"A block sequence may not be used as an implicit map key at line 6, column 1
Implicit keys need to be on a single line at line 6, column 3
Implicit map keys need to be followed by map values at line 6, column 3
Nested mappings are not allowed in compact mappings at line 7, column 6
Implicit keys need to be on a single line at line 7, column 6"
`);
});

test('invalid yaml 2', () => {
    expect(() => {
        migrateToCommonSpec(
            `
myapp:
  image: myapp-image
  volumes: 
    - data:/app/data
    - '/data:/app/data
db:
  image: postgresql`,
            { expandVolumes: true, expandPorts: true },
        );
    }).toThrowErrorMatchingInlineSnapshot(`"Missing closing 'quote at line 8, column 20"`);
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
        `"[{\\"line\\":30,\\"message\\":\\"Line 30(/dontexists): 'dontexists' is unknown for '/dontexists'\\",\\"helpLink\\":\\"https://docs.docker.com/compose/compose-file/\\"},{\\"line\\":34,\\"message\\":\\"Line 34(/networks/front-tier/truc): 'truc' is unknown for '/networks/front-tier/truc'\\",\\"helpLink\\":\\"https://docs.docker.com/compose/compose-file/06-networks/#truc\\"},{\\"line\\":48,\\"message\\":\\"Line 48(/volumes/db_data/truc): 'truc' is unknown for '/volumes/db_data/truc'\\",\\"helpLink\\":\\"https://docs.docker.com/compose/compose-file/07-volumes/#truc\\"},{\\"line\\":41,\\"message\\":\\"Line 41(/secrets/db_password/fiel): 'fiel' is unknown for '/secrets/db_password/fiel'\\",\\"helpLink\\":\\"https://docs.docker.com/compose/compose-file/09-secrets/#fiel\\"},{\\"line\\":37,\\"message\\":\\"Line 37(/configs/http_config/fiel): 'fiel' is unknown for '/configs/http_config/fiel'\\",\\"helpLink\\":\\"https://docs.docker.com/compose/compose-file/08-configs/#fiel\\"}]"`,
    );
});

test('invalid yaml (comment only)', () => {
    expect(migrateToCommonSpec(`#az`, { expandVolumes: true, expandPorts: true })).toMatchInlineSnapshot(`"#az"`);
});

test('invalid yaml (string)', () => {
    expect(migrateToCommonSpec(`foo bar`, { expandVolumes: true, expandPorts: true })).toMatchInlineSnapshot(
        `"foo bar"`,
    );
});

test('return empty when no services yaml', () => {
    expect(
        migrateToCommonSpec(`
    version: '3.3'
    services:
  `),
    ).toMatchInlineSnapshot(`
"name: <your project name>
services:"
`);
});

test('invalid yaml 2x 3x (comment only)', () => {
    expect(migrateFromV2xToV3x(`#az`, { expandVolumes: true, expandPorts: true })).toMatchInlineSnapshot(`"#az"`);
});

test('invalid yaml 2x 3x (string)', () => {
    expect(migrateFromV2xToV3x(`foo bar`, { expandVolumes: true, expandPorts: true })).toMatchInlineSnapshot(
        `"foo bar"`,
    );
});

test('return empty when no services yaml 2x 3x', () => {
    expect(
        migrateFromV2xToV3x(`
    # ignored : docker stop

    version: '3.3'
    services:
  `),
    ).toMatchInlineSnapshot(`
"
    # ignored : docker stop

    version: '3.3'
    services:
  "
`);
});

test('invalid yaml 3x 2x(comment only)', () => {
    expect(migrateFromV3xToV2x(`#az`, { expandVolumes: true, expandPorts: true })).toMatchInlineSnapshot(`"#az"`);
});

test('invalid yaml 3x 2x (string)', () => {
    expect(migrateFromV3xToV2x(`foo bar`, { expandVolumes: true, expandPorts: true })).toMatchInlineSnapshot(
        `"foo bar"`,
    );
});

test('return empty when no services yaml 3x 2x', () => {
    expect(
        migrateFromV3xToV2x(`
    # ignored : docker stop

    version: '3.3'
    services:
  `),
    ).toMatchInlineSnapshot(`
"
    # ignored : docker stop

    version: '3.3'
    services:
  "
`);
});
