/* eslint-env jest */

import { migrateToCommonSpec } from '../src';

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
  image: postgresql
	`,
            { expandVolumes: true, expandPorts: true },
        );
    }).toThrow();
});

test('warnings', () => {
    expect(() => migrateToCommonSpec('%FOO\n---bar\n')).toThrow();
});
