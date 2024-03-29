/* @flow */

import { setDeepValue, handleExternalName } from './utils';
import { getVolumeNameFromVolumeSpec, isNamedVolume } from './volumeutils';
import { yamlParse } from './yamlparse';
import { yamlStringify } from './yamlstringify';

export { yamlCheck, yamlParse } from './yamlparse';
export { validateDockerComposeToCommonSpec, getDockerComposeSchemaWithoutFormats } from './validate';
export { getVolumeNameFromVolumeSpec, isNamedVolume } from './volumeutils';
export { yamlStringify } from './yamlstringify';

/** ***************************************
 * Migrate from Docker Compose 2.x to 3.x
 */

export const migrateFromV2xToV3x = (content: string, configuration?: Configuration = null) => {
    const data = yamlParse(content);
    if (!data) return content;
    if (typeof data === 'string') return content;
    if (!data.version || data.version.startsWith('3')) return content;

    const logs = [];
    const log = (message) => logs.push(message);

    Object.keys(data.services).forEach((name) => {
        const service = data.services[name];
        if (service.cpus) setDeepValue(service, 'deploy/resources/limits/cpus', service.cpus);
        if (service.mem_limit) setDeepValue(service, 'deploy/resources/limits/memory', service.mem_limit);
        if (service.pids_limit) setDeepValue(service, 'deploy/resources/limits/pids', service.pids_limit);
        if (service.mem_reservation) {
            setDeepValue(service, 'deploy/resources/reservations/memory', service.mem_reservation);
        }

        if (service.volume_driver) {
            log(
                `Service ${name} has volume_driver:${service.volume_driver}: Instead of setting the volume driver on the service, define a volume using the top-level volumes option (https://docs.docker.com/compose/compose-file/compose-file-v3/#volume-configuration-reference) and specify the driver there.`,
            );
            delete service.volume_driver;
        }

        if (service.volumes_from) {
            log(
                `Service ${name} has volumes_from:${service.volumes_from} To share a volume between services, define it using the top-level volumes option (https://docs.docker.com/compose/compose-file/compose-file-v3/#volume-configuration-reference) and reference it from each service that shares it using the service-level volumes option (https://docs.docker.com/compose/compose-file/compose-file-v3/#driver).`,
            );
            delete service.volumes_from;
        }

        const unkProperties = ['cpu_shares', 'cpu_quota', 'cpuset', 'memswap_limit'];
        unkProperties.forEach((k) => {
            if (Object.prototype.hasOwnProperty.call(service, k)) {
                log(
                    `Service ${name} has ${k}:${service.k} These have been replaced by the resources key under deploy (https://docs.docker.com/compose/compose-file/compose-file-v3/#resources). deploy configuration only takes effect when using docker stack deploy, and is ignored by docker-compose.`,
                );
            }
            delete service[k];
        });

        if (service.extends) {
            log(
                `Service ${name} has extends:${service.extends} This option has been removed for version: "3.x" Compose files. For more information on extends, see https://docs.docker.com/compose/multiple-compose-files/extends/.`,
            );
            delete service.extends;
        }
        if (service.group_add) {
            log(
                `Service ${name} has group_add:${service.group_add} This option has been removed for version: "3.x" Compose files.`,
            );
            delete service.group_add;
        }

        delete service.cpus;
        delete service.mem_limit;
        delete service.pids_limit;
        delete service.mem_reservation;
    });

    data.version = '3';
    handleExternalName(data, 'networks');
    handleExternalName(data, 'volumes');

    // TODO : link_local_ips in networks: This option has not been introduced in version: "3.x" Compose files.

    return (
        logs.map((m) => `# ${m.replace(/\n/g, '\n#')}`).join('\n') +
        (logs.length > 0 ? '\n' : '') +
        yamlStringify(data, configuration)
    );
};

/** ***************************************
 * Migrate from Docker Compose 3.x to 2.x
 */

export const migrateFromV3xToV2x = (content: string, configuration?: Configuration = null) => {
    const data = yamlParse(content);
    if (!data) return content;
    if (typeof data === 'string') return content;
    if (!data.version || data.version.startsWith('2') || !data.services) return content;

    Object.keys(data.services).forEach((name) => {
        const service = data.services[name];
        if (service.deploy && service.deploy.resources) {
            const { resources } = service.deploy;
            if (resources.limits) {
                if (resources.limits.cpus) service.cpus = resources.limits.cpus;
                if (resources.limits.memory) service.mem_limit = resources.limits.memory;
                if (resources.limits.pids) service.pids_limit = resources.limits.pids;
            }
            if (resources.reservations && resources.reservations.memory) {
                service.mem_reservation = resources.reservations.memory;
            }
        }
        if (
            service.deploy &&
            service.deploy.restart_policy &&
            service.deploy.restart_policy.condition &&
            !service.restart
        ) {
            service.restart = service.deploy.restart_policy.condition;
        }
        delete service.deploy;
    });

    data.version = '2.4';

    handleExternalName(data, 'networks');
    handleExternalName(data, 'volumes');

    return yamlStringify(data, configuration);
};

/** ***************************************
 * Migrate from Docker Compose V1 to 2.x
 * taken from https://github.com/dnephin/compose/blob/master/contrib/migration/migrate-compose-file-v1-to-v2.py
 */

function warnForLinks(name: string, service: any, log: (msg: string) => void) {
    const { links } = service;
    if (links) {
        const exampleService = links[0].split(':')[0];
        log(
            `Service ${name} has links, which no longer create environment variables such as ${exampleService.toUpperCase()}_PORT. If you are using those in your application code, you should instead connect directly to the hostname, e.g. '${exampleService}'.`,
        );
    }
}

function warnForExternalLinks(name: string, service: any, log: (msg: string) => void) {
    const externalLinks = service.external_links;
    if (externalLinks) {
        log(
            `Service ${name} has external_links: ${externalLinks}, which now work slightly differently. In particular, two containers must be connected to at least one network in common to communicate, even if explicitly linked together.\n\nEither connect the external container to your app's default network, or connect both the external container and your service's containers to a pre-existing network. See https://docs.docker.com/compose/networking/ for more on how to do this.`,
        );
    }
}

function rewriteNet(service: any, serviceNames: string[]) {
    if (service.net) {
        let networkMode = service.net;

        // "container:<service name>" is now "service:<service name>"
        if (networkMode.startsWith('container:')) {
            const name = networkMode.split(':')[1];
            if (serviceNames.includes(name)) {
                networkMode = `service:${name}`;
            }
        }

        service.network_mode = networkMode;
        delete service.net;
    }
}

function rewriteBuild(service: any) {
    if (service.dockerfile) {
        service.build = {
            context: service.build,
            dockerfile: service.dockerfile,
        };
        delete service.dockerfile;
    }
}

function rewriteLogging(service: any) {
    if (service.log_driver) {
        service.logging = { driver: service.log_driver };
        if (service.log_opt) {
            service.logging.options = service.log_opt;
            delete service.log_opt;
        }
        delete service.log_driver;
    }
}

function rewriteVolumesFrom(service: any, serviceNames: string[]) {
    if (service.volumes_from) {
        for (let idx = 0; idx < service.volumes_from.length; idx += 1) {
            const volumeFrom = service.volumes_from[idx];
            if (!serviceNames.includes(volumeFrom.split(':')[0])) {
                service.volumes_from[idx] = `container:${volumeFrom}`;
            }
        }
    }
}

function getNamedVolumes(services: any) {
    const volumeSpecs = [];
    Object.values(services).forEach((service) => (service.volumes || []).forEach((volume) => volumeSpecs.push(volume)));

    const names = new Set(
        volumeSpecs.map((spec) => {
            const source = getVolumeNameFromVolumeSpec(spec);
            return isNamedVolume(source) ? source : undefined;
        }),
    );

    return Array.from(names)
        .filter((name) => name)
        .map((name) => ({ [name]: { external: true, name } }));
}

function createVolumesSection(data: any, log: (msg: string) => void) {
    const namedVolumes = getNamedVolumes(data.services);
    if (namedVolumes.length > 0) {
        const namedVolumesNames = namedVolumes.map((v) => JSON.stringify(v)).join(',');
        log(
            `Named volumes (${namedVolumesNames}) must be explicitly declared. Creating a 'volumes' section with declarations.\n\nFor backwards-compatibility, they've been declared as external. If you don't mind the volume names being prefixed with the project name, you can remove the 'external' option from each one.`,
        );
        data.volumes = namedVolumes;
    }
}

export const migrateFromV1ToV2x = (content: string, configuration?: Configuration = null) => {
    const data = yamlParse(content);

    if (!data) return content;
    if (typeof data === 'string') return content;
    if (Object.prototype.hasOwnProperty.call(data, 'services')) return content;

    const serviceNames = Object.keys(data);

    const logs = [];
    const log = (message) => logs.push(message);

    Object.keys(data).forEach((name) => {
        warnForLinks(name, data[name], log);
        warnForExternalLinks(name, data[name], log);
        rewriteNet(data[name], serviceNames);
        rewriteBuild(data[name]);
        rewriteLogging(data[name]);
        rewriteVolumesFrom(data[name], serviceNames);
    });

    const services = {};
    Object.keys(data).forEach((name) => {
        services[name] = data[name];
        delete data[name];
    });

    data.version = '2.4';
    data.services = services;
    createVolumesSection(data, log);

    handleExternalName(data, 'networks');
    handleExternalName(data, 'volumes');

    return (
        logs.map((m) => `# ${m.replace(/\n/g, '\n#')}`).join('\n') +
        (logs.length > 0 ? '\n' : '') +
        yamlStringify(data, configuration)
    );
};

/** ***************************************
 * Migrate from Docker Compose to V2 CommonSpec
 */

export const migrateToCommonSpec = (content: string, configuration?: Configuration = null) => {
    const result = migrateFromV1ToV2x(content, configuration);

    const data = yamlParse(result);
    if (!data) return content;
    if (typeof data === 'string') return content;

    const logs = result.match(/^\s*#[^\r\n]*/gm) || [];
    // const log = message => logs.push(message);

    Object.keys(data.services || []).forEach((name) => {
        const service = data.services[name];
        if (service.cpus) setDeepValue(service, 'deploy/resources/limits/cpus', service.cpus);
        if (service.mem_limit) setDeepValue(service, 'deploy/resources/limits/memory', service.mem_limit);
        if (service.pids_limit) setDeepValue(service, 'deploy/resources/limits/pids', service.pids_limit);
        if (service.mem_reservation) {
            setDeepValue(service, 'deploy/resources/reservations/memory', service.mem_reservation);
        }

        delete service.cpus;
        delete service.mem_limit;
        delete service.pids_limit;
        delete service.mem_reservation;
    });

    const output = { name: '<your project name>', ...data };

    delete output.version;

    handleExternalName(output, 'networks');
    handleExternalName(output, 'volumes');

    return (
        logs.map((m) => `# ${m.replace(/^\s*#\s+/g, '')}`).join('\n') +
        (logs.length > 0 ? '\n' : '') +
        yamlStringify(output, configuration)
    );
};

/* module.exports = {
    migrateToCommonSpec,
    migrateFromV1ToV2x,
    migrateFromV3xToV2x,
    migrateFromV2xToV3x,
    yamlCheck,
    getVolumeNameFromVolumeSpec,
    isNamedVolume,
    validateDockerComposeToCommonSpec,
    getDockerComposeSchemaWithoutFormats,
}; */
