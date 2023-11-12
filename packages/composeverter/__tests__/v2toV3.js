/* eslint-env jest */

import { migrateFromV2xToV3x } from '../src';

test('v2 to v3', () => {
    expect(
        migrateFromV2xToV3x(`
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
        "# Service ubuntu has cpu_quota:undefined These have been replaced by the resources key under deploy (https://docs.docker.com/compose/compose-file/compose-file-v3/#resources). deploy configuration only takes effect when using docker stack deploy, and is ignored by docker-compose.
        # Service ubuntu has memswap_limit:undefined These have been replaced by the resources key under deploy (https://docs.docker.com/compose/compose-file/compose-file-v3/#resources). deploy configuration only takes effect when using docker stack deploy, and is ignored by docker-compose.
        version: \\"3\\"
        services:
            ubuntu:
                shm_size: 15G
                mem_swappiness: zzz
                cpu_period: xxx
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

test('basic v2 tp v3', () => {
    expect(
        migrateFromV2xToV3x(`
version: '2'
services:
  myapp:
    image: myapp-image
`),
    ).toMatchInlineSnapshot(`
            "version: \\"3\\"
            services:
                myapp:
                    image: myapp-image"
      `);
});

test('volume_from and other resources', () => {
    expect(
        migrateFromV2xToV3x(`
version: '2'
services:
  myapp:
    image: myapp-image
    volume_driver: json
    memswap_limit: 1GB
    cpu_shares: 73
    cpu_quota: 0.5
    cpuset: 1
    group_add: xxx
    extends:
        - common
    volumes_from:
        - db
    volumes:
        - data:/var/lib
        - '/dev/net/tun:/dev/net/tun'
        `),
    ).toMatchInlineSnapshot(`
        "# Service myapp has volume_driver:json: Instead of setting the volume driver on the service, define a volume using the top-level volumes option (https://docs.docker.com/compose/compose-file/compose-file-v3/#volume-configuration-reference) and specify the driver there.
        # Service myapp has volumes_from:db To share a volume between services, define it using the top-level volumes option (https://docs.docker.com/compose/compose-file/compose-file-v3/#volume-configuration-reference) and reference it from each service that shares it using the service-level volumes option (https://docs.docker.com/compose/compose-file/compose-file-v3/#driver).
        # Service myapp has cpu_shares:undefined These have been replaced by the resources key under deploy (https://docs.docker.com/compose/compose-file/compose-file-v3/#resources). deploy configuration only takes effect when using docker stack deploy, and is ignored by docker-compose.
        # Service myapp has cpu_quota:undefined These have been replaced by the resources key under deploy (https://docs.docker.com/compose/compose-file/compose-file-v3/#resources). deploy configuration only takes effect when using docker stack deploy, and is ignored by docker-compose.
        # Service myapp has cpuset:undefined These have been replaced by the resources key under deploy (https://docs.docker.com/compose/compose-file/compose-file-v3/#resources). deploy configuration only takes effect when using docker stack deploy, and is ignored by docker-compose.
        # Service myapp has memswap_limit:undefined These have been replaced by the resources key under deploy (https://docs.docker.com/compose/compose-file/compose-file-v3/#resources). deploy configuration only takes effect when using docker stack deploy, and is ignored by docker-compose.
        # Service myapp has extends:common This option has been removed for version: \\"3.x\\" Compose files. For more information on extends, see https://docs.docker.com/compose/multiple-compose-files/extends/.
        # Service myapp has group_add:xxx This option has been removed for version: \\"3.x\\" Compose files.
        version: \\"3\\"
        services:
            myapp:
                image: myapp-image
                volumes:
                    - data:/var/lib
                    - /dev/net/tun:/dev/net/tun"
    `);
});

test('volume_from and other resources less', () => {
    expect(
        migrateFromV2xToV3x(`
version: '2'
services:
  myapp:
    image: myapp-image
    volume_driver: json
    memswap_limit: 1GB
    cpu_shares: 73
    cpuset: 1
    group_add: xxx
    extends:
        - common
    volumes_from:
        - db
    volumes:
        - data:/var/lib
        - '/dev/net/tun:/dev/net/tun'
        `),
    ).toMatchInlineSnapshot(`
        "# Service myapp has volume_driver:json: Instead of setting the volume driver on the service, define a volume using the top-level volumes option (https://docs.docker.com/compose/compose-file/compose-file-v3/#volume-configuration-reference) and specify the driver there.
        # Service myapp has volumes_from:db To share a volume between services, define it using the top-level volumes option (https://docs.docker.com/compose/compose-file/compose-file-v3/#volume-configuration-reference) and reference it from each service that shares it using the service-level volumes option (https://docs.docker.com/compose/compose-file/compose-file-v3/#driver).
        # Service myapp has cpu_shares:undefined These have been replaced by the resources key under deploy (https://docs.docker.com/compose/compose-file/compose-file-v3/#resources). deploy configuration only takes effect when using docker stack deploy, and is ignored by docker-compose.
        # Service myapp has cpuset:undefined These have been replaced by the resources key under deploy (https://docs.docker.com/compose/compose-file/compose-file-v3/#resources). deploy configuration only takes effect when using docker stack deploy, and is ignored by docker-compose.
        # Service myapp has memswap_limit:undefined These have been replaced by the resources key under deploy (https://docs.docker.com/compose/compose-file/compose-file-v3/#resources). deploy configuration only takes effect when using docker stack deploy, and is ignored by docker-compose.
        # Service myapp has extends:common This option has been removed for version: \\"3.x\\" Compose files. For more information on extends, see https://docs.docker.com/compose/multiple-compose-files/extends/.
        # Service myapp has group_add:xxx This option has been removed for version: \\"3.x\\" Compose files.
        version: \\"3\\"
        services:
            myapp:
                image: myapp-image
                volumes:
                    - data:/var/lib
                    - /dev/net/tun:/dev/net/tun"
    `);
});

test('no conversion from V2 if V3', () => {
    expect(
        migrateFromV2xToV3x(`
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

test('no conversion from V2 if V1', () => {
    expect(
        migrateFromV2xToV3x(`
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
