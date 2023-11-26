/* eslint-env jest */

import { migrateToCommonSpec } from '../src';

test('v1 with expand volumes and ports', () => {
    expect(
        migrateToCommonSpec(
            `
myapp:
  image: myapp-image
  volumes: 
    - data:/app/data
    - /data:/app/data
    - c:/data:/app/data
    - c:\\data:/app/data:rw
    - /data2:/app/data2:ro
    - /data3:/app/data3:z
    - /data4:/app/data4:Z
    - notvalid
  net: container:db
  ports:
    - "3000"
    - "4000/udp"
    - "3000-3005"
    - "8000:8000"
    - "9090-9091:8080-8081"
    - "49100:22"
    - "8000-9000:80"
    - "127.0.0.1:8001:8001"
    - "127.0.0.1:5000-5010:5000-5010"
    - "6060:6060/udp"
    - notvalid
    - target: 4444
      protocol: udp
      mode: ingress
db:
  image: postgresql
`,
            { expandVolumes: true, expandPorts: true },
        ),
    ).toMatchInlineSnapshot(`
"# Named volumes ({\\"data\\":{\\"external\\":true,\\"name\\":\\"data\\"}}) must be explicitly declared. Creating a 'volumes' section with declarations.
# #
# #For backwards-compatibility, they've been declared as external. If you don't mind the volume names being prefixed with the project name, you can remove the 'external' option from each one.
name: <your project name>
services:
    myapp:
        image: myapp-image
        volumes:
            - type: volume
              source: data
              target: /app/data
            - type: bind
              source: /data
              target: /app/data
            - type: bind
              source: c:/data
              target: /app/data
            - type: bind
              source: c:\\\\data
              target: /app/data
            - type: bind
              source: /data2
              target: /app/data2
              volume:
                  nocopy: true
            - type: bind
              source: /data3
              target: /app/data3
              bind:
                  selinux: z
            - type: bind
              source: /data4
              target: /app/data4
              bind:
                  selinux: Z
            - notvalid
        ports:
            - target: 3000
              mode: ingress
            - target: 4000
              protocol: udp
              mode: ingress
            - target: 3000
              published: \\"3000\\"
              mode: ingress
            - target: 3001
              published: \\"3001\\"
              mode: ingress
            - target: 3002
              published: \\"3002\\"
              mode: ingress
            - target: 3003
              published: \\"3003\\"
              mode: ingress
            - target: 3004
              published: \\"3004\\"
              mode: ingress
            - target: 3005
              published: \\"3005\\"
              mode: ingress
            - target: 8000
              published: \\"8000\\"
              mode: ingress
            - target: 8080
              published: \\"9090\\"
              mode: ingress
            - target: 8081
              published: \\"9091\\"
              mode: ingress
            - target: 22
              published: \\"49100\\"
              mode: ingress
            - target: 80
              published: 8000-9000
              mode: ingress
            - target: 8001
              host_ip: 127.0.0.1
              published: \\"8001\\"
              mode: ingress
            - target: 5000
              host_ip: 127.0.0.1
              published: \\"5000\\"
              mode: ingress
            - target: 5001
              host_ip: 127.0.0.1
              published: \\"5001\\"
              mode: ingress
            - target: 5002
              host_ip: 127.0.0.1
              published: \\"5002\\"
              mode: ingress
            - target: 5003
              host_ip: 127.0.0.1
              published: \\"5003\\"
              mode: ingress
            - target: 5004
              host_ip: 127.0.0.1
              published: \\"5004\\"
              mode: ingress
            - target: 5005
              host_ip: 127.0.0.1
              published: \\"5005\\"
              mode: ingress
            - target: 5006
              host_ip: 127.0.0.1
              published: \\"5006\\"
              mode: ingress
            - target: 5007
              host_ip: 127.0.0.1
              published: \\"5007\\"
              mode: ingress
            - target: 5008
              host_ip: 127.0.0.1
              published: \\"5008\\"
              mode: ingress
            - target: 5009
              host_ip: 127.0.0.1
              published: \\"5009\\"
              mode: ingress
            - target: 5010
              host_ip: 127.0.0.1
              published: \\"5010\\"
              mode: ingress
            - target: 6060
              published: \\"6060\\"
              protocol: udp
              mode: ingress
            - notvalid
            - target: 4444
              protocol: udp
              mode: ingress
        network_mode: service:db
    db:
        image: postgresql
volumes:
    - data:
          external: true
          name: data"
`);
});
