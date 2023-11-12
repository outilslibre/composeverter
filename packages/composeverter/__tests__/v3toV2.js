/* eslint-env jest */

import { migrateFromV3xToV2x } from '../src';

test('v3 to v2 with resources', () => {
    expect(
        migrateFromV3xToV2x(`
version: '3.3'
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
`),
    ).toMatchInlineSnapshot(`
        "version: \\"2.4\\"
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
                image: ubuntu"
    `);
});

test('v3 to v2 with resources', () => {
    expect(
        migrateFromV3xToV2x(`
version: '3.3'
services:
    ubuntu:
        deploy:
            restart_policy:
                condition: on-failure
            resources:
                limits:
                    cpus: 1.5
                    pids: 1500
                    memory: 15G
                reservations:
                    memory: 12G
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
`),
    ).toMatchInlineSnapshot(`
        "version: \\"2.4\\"
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
                restart: on-failure"
    `);
});

test('v3 to v2 with resources 2', () => {
    expect(
        migrateFromV3xToV2x(`
version: '3.3'
services:
    ubuntu:
        deploy:
            resources:
                limits:
                    cpus: 1.5
                    pids: 1500
                    memory: 15G
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
`),
    ).toMatchInlineSnapshot(`
        "version: \\"2.4\\"
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
                pids_limit: 1500"
    `);
});

test('v3 to v2 with resources 3', () => {
    expect(
        migrateFromV3xToV2x(`
version: '3.3'
services:
    ubuntu:
        deploy:
            resources:
                limits:
                    pids: 1500
                    memory: 15G
        image: ubuntu
`),
    ).toMatchInlineSnapshot(`
        "version: \\"2.4\\"
        services:
            ubuntu:
                image: ubuntu
                mem_limit: 15G
                pids_limit: 1500"
    `);
});

test('v3 to v2 with resources 4', () => {
    expect(
        migrateFromV3xToV2x(`
version: '3.3'
services:
    ubuntu:
        deploy:
            resources:
                limits:
                    memory: 15G
        image: ubuntu
`),
    ).toMatchInlineSnapshot(`
        "version: \\"2.4\\"
        services:
            ubuntu:
                image: ubuntu
                mem_limit: 15G"
    `);
});

test('v3 to v2 with resources 6', () => {
    expect(
        migrateFromV3xToV2x(`
version: '3.3'
services:
    ubuntu:
        deploy:
            resources:
                reservations:
                    memory: 15G
        image: ubuntu
`),
    ).toMatchInlineSnapshot(`
        "version: \\"2.4\\"
        services:
            ubuntu:
                image: ubuntu
                mem_reservation: 15G"
    `);
});

test('v3 to v2 with resources 5', () => {
    expect(
        migrateFromV3xToV2x(`
version: '3.3'
services:
    ubuntu:
        deploy:
            resources:
                limits:
                    cpus: 2
        image: ubuntu
`),
    ).toMatchInlineSnapshot(`
        "version: \\"2.4\\"
        services:
            ubuntu:
                image: ubuntu
                cpus: 2"
    `);
});

test('no conversion from V2 if V3', () => {
    expect(
        migrateFromV3xToV2x(`
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

test('no conversion from V2 if V1', () => {
    expect(
        migrateFromV3xToV2x(`
myapp:
  image: myapp-image
`),
    ).toMatchInlineSnapshot(`
            "
            myapp:
              image: myapp-image
            "
      `);
});
