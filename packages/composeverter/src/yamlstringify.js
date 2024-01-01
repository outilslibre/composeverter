/* @flow */

import { getVolumeLongSyntaxFromVolumeSpec } from './volumeutils';
import { getPortLongSyntaxFromPortSpec } from './portutils';

const yaml = require('yaml');

yaml.scalarOptions.null.nullStr = '';

export const yamlStringify = (data: any, configuration?: Configuration) => {
    applyExpansions(data, configuration);
    return yaml.stringify(data, { indent: (configuration || {}).indent || 4, simpleKeys: true }).trim();
};

interface Configuration {
    expandVolumes?: boolean;
    expandPorts?: boolean;
    indent?: number;
}

const applyExpansions = (data: any, configuration?: Configuration) => {
    if (configuration && configuration.expandVolumes) {
        Object.values(data.services).forEach((service) => {
            if (service.volumes) {
                for (let volumeIndex = 0; volumeIndex < service.volumes.length; volumeIndex += 1) {
                    if (typeof service.volumes[volumeIndex] === 'string') {
                        service.volumes[volumeIndex] = getVolumeLongSyntaxFromVolumeSpec(service.volumes[volumeIndex]);
                    }
                }
            }
        });
    }

    if (configuration && configuration.expandPorts) {
        Object.values(data.services).forEach((service) => {
            if (service.ports) {
                let ports = [];
                for (let portIndex = 0; portIndex < service.ports.length; portIndex += 1) {
                    if (typeof service.ports[portIndex] === 'string') {
                        ports = [...ports, ...getPortLongSyntaxFromPortSpec(service.ports[portIndex])];
                    } else ports = [...ports, service.ports[portIndex]];
                }
                service.ports = ports;
            }
        });
    }

    return data;
};
