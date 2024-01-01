/* @flow */

export const portSpecRegex =
    /^((?<ip_part>\[?(?<ip>[a-fA-F\d.:]+)\]?:)?(?<host>[\d]*(-[\d]+)?):)?(?<container>[\d]+(-[\d]+)?)(?<proto_part>\/(?<proto>(udp|tcp|sctp)))?$/;

export const getPortLongSyntaxFromPortSpec = (ports: string) => {
    const portMatch = ports.match(portSpecRegex);
    if (portMatch === null) {
        return [ports];
    }

    const target = portMatch.groups.container;
    if (target && target.includes('-')) {
        const targetRange = target.split('-');
        const targetStart = parseInt(targetRange[0], 10);
        const targetStop = parseInt(targetRange[1], 10);
        const { host } = portMatch.groups;
        const hostRange = (host || target).split('-');
        const hostStart = parseInt(hostRange[0], 10);

        let rangePorts = [];
        Array.from({ length: targetStop - targetStart + 1 }, (_, i) => i).forEach((i) => {
            rangePorts = [
                ...rangePorts,
                ...getPortLongSyntaxFromPortSpec(
                    `${portMatch.groups.ip_part || ''}${hostStart + i}:${targetStart + i}${
                        portMatch.groups.proto_part || ''
                    }`,
                ),
            ];
        });
        return rangePorts;
    }

    const longSyntax = { target: parseInt(target, 10) };

    if (portMatch.groups.ip) {
        longSyntax.host_ip = portMatch.groups.ip;
    }

    if (portMatch.groups.host) {
        longSyntax.published = portMatch.groups.host;
    }

    if (portMatch.groups.proto) {
        longSyntax.protocol = portMatch.groups.proto;
    }

    longSyntax.mode = 'ingress';

    return [longSyntax];
};
