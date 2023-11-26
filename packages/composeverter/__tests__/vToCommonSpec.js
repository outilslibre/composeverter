/* eslint-env jest */

import { migrateToCommonSpec } from '../src';

test('v1 to CommonSpec', () => {
    expect(
        migrateToCommonSpec(`
myapp:
  image: myapp-image
  net: container:db
db:
  image: postgresql
`),
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

test('v1 with comments to CommonSpec', () => {
    expect(
        migrateToCommonSpec(`
myapp:
  image: myapp-image
  volumes: 
    - data:/app/data
  net: container:db
db:
  image: postgresql
`),
    ).toMatchInlineSnapshot(`
"# Named volumes ({\\"data\\":{\\"external\\":true,\\"name\\":\\"data\\"}}) must be explicitly declared. Creating a 'volumes' section with declarations.
# #
# #For backwards-compatibility, they've been declared as external. If you don't mind the volume names being prefixed with the project name, you can remove the 'external' option from each one.
name: <your project name>
services:
    myapp:
        image: myapp-image
        volumes:
            - data:/app/data
        network_mode: service:db
    db:
        image: postgresql
volumes:
    - data:
          external: true
          name: data"
`);
});

test('no convert if already CommonSpec', () => {
    expect(
        migrateToCommonSpec(`
name: xxx
services:
  myapp:
    image: myapp-image
    net: container:db
  db:
    image: postgresql
`),
    ).toMatchInlineSnapshot(`
        "
        name: xxx
        services:
          myapp:
            image: myapp-image
            net: container:db
          db:
            image: postgresql
        "
    `);
});

test('v3 to CommonSpec', () => {
    expect(
        migrateToCommonSpec(`
version: '3'
services:
  myapp:
    image: myapp-image
  db:
    image: postgresql
`),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            myapp:
                image: myapp-image
            db:
                image: postgresql"
    `);
});

test('v2.x to CommonSpec', () => {
    expect(
        migrateToCommonSpec(`
version: '2'
services:
    ubuntu:
        shm_size: 15G
        memswap_limit: yyy
        mem_swappiness: zzz
        cpu_period: xxx
        cpu_quota: xxx
        cpu_rt_period: xxx
        cpu_rt_runtime: xxx
        volume_from:
            - other2
        image: ubuntu
        cpus: 1.5
        mem_limit: 15G
        pids_limit: 1500
        mem_reservation: 12G
`),
    ).toMatchInlineSnapshot(`
        "name: <your project name>
        services:
            ubuntu:
                shm_size: 15G
                memswap_limit: yyy
                mem_swappiness: zzz
                cpu_period: xxx
                cpu_quota: xxx
                cpu_rt_period: xxx
                cpu_rt_runtime: xxx
                volume_from:
                    - other2
                image: ubuntu
                deploy:
                    resources:
                        limits:
                            cpus: 1.5
                            memory: 15G
                            pids: 1500
                        reservations:
                            memory: 12G"
    `);
});
