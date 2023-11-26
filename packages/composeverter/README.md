# composeverter - Docker Compose Format Converter

![npm](https://img.shields.io/npm/v/composeverter)
![npm](https://img.shields.io/npm/dt/composeverter)
[![GitHub license](https://img.shields.io/github/license/outilslibre/composeverter)](https://github.com/outilslibre/composeverter/blob/master/LICENSE)

This NPM package provides a simple and convenient way to convert Docker Compose files from one version to another. Docker Compose files allow you to define and run multi-container Docker applications, but the format has evolved over time. With this package, you can easily migrate your Compose files between different versions.
It also provides some functions to check YAML and test if a given Docker volume mapping is a named one.

## Installation

You can install this package via NPM:

```bash
npm install composeverter
```

## Usage - Conversion

This package provides four main conversion functions, which you can use to convert Docker Compose files from one format to another. Each function takes the Docker Compose file content as input and returns the content in the target format. 

### Configuration 

Each of the following functions can take an additional configuration object, with the following properties:

### 1. `expandVolumes` (optional)

- **Type:** `boolean`
- **Default:** `false`

Set this parameter to `true` if you want to enable expansion of short volume syntax to long volume syntax.

### 2. `expandPorts` (optional)

- **Type:** `boolean`
- **Default:** `false`

Set this parameter to `true` if you want to enable expansion of short ports mapping syntax to long ports mapping syntax.


### `migrateFromV1ToV2x(composeContent: string, configuration: Configuration = null): string`

Converts a Docker Compose file from V1 to version 2.x.

```javascript
const converter = require('composeverter');

const v1ComposeContent = `
web:
  image: nginx:latest
`;
const v2ComposeContent = converter.migrateFromV1ToV2x(v1ComposeContent);
console.log(v2ComposeContent);
```

### `migrateFromV2xToV3x(composeContent: string, configuration: Configuration = null): string`

Converts a Docker Compose file from version 2.x to version 3.x.

```javascript
const converter = require('composeverter');

const v2ComposeContent = `
version: '2'
services:
  web:
    image: nginx:latest
`;
const v3ComposeContent = converter.migrateFromV2xToV3x(v2ComposeContent);
console.log(v3ComposeContent);
```

### `migrateFromV3xToV2x(composeContent: string, configuration: Configuration = null): string`

Converts a Docker Compose file from version 3.x to version 2.x.

```javascript
const converter = require('composeverter');

const v3ComposeContent = `
version: '3'
services:
  web:
    image: nginx:latest
`;
const v2ComposeContent = converter.migrateFromV3xToV2x(v3ComposeContent);
console.log(v2ComposeContent);
```

### `migrateToCommonSpec(composeContent: string, configuration: Configuration = null): string`

Automatically migrates a Docker Compose file to the latest version available : Common Specification.

```javascript
const converter = require('composeverter');

const composeContent = `
web:
  image: nginx:latest
`;
const latestComposeContent = converter.migrateToCommonSpec(composeContent);
console.log(latestComposeContent);
```

With configuration:

```javascript
const converter = require('composeverter');

const composeContent = `
web:
  image: nginx:latest
`;
const latestComposeContent = converter.migrateToCommonSpec(composeContent, {expandPorts: true, expandVolumes: true});
console.log(latestComposeContent);
```


## Usage - others functions

### `getVolumeNameFromVolumeSpec(volumeSpec: string): string`

Get the volume name from a Docker Compose volume mapping.

**Parameters:**
- `volumeSpec`: A string representing the Docker Compose volume mapping (e.g., "/data2:/app/data2:ro").

**Returns:**
The extracted volume name as a string.

### `isNamedVolume(source: string): boolean`

Tell if the given source is a named Docker volume.

**Parameters:**
- `source`: A string representing the source of the Docker volume (e.g., "data").

**Returns:**
A boolean indicating whether the source is a named Docker volume.

### `yamlCheck(yaml: string): any`

Check YAML validity and return the parsed object if YAML is valid.

**Parameters:**
- `yaml`: A string representing the YAML content to be checked.

**Returns:**
The parsed object if the YAML is valid.


## License

This package is distributed under the MIT License. See the [LICENSE](https://github.com/outilslibre/composeverter/LICENSE.md) file for details.

## Contributing
 - Clone a fork of the repo and install the project dependencies by running npm install
 - Make your changes, and build the project by running npm run estlin && npm run build
 - Test your changes with npm run test

## Issues

If you encounter any problems or have suggestions, please open an issue on our [GitHub repository](https://github.com/outilslibre/composeverter).

## Credits

This package was created and is maintained by [ShareVB](https://github.com/sharevb).

