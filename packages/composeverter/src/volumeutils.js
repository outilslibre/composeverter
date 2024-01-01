/* @flow */

export const volumeSpecRegex =
    /^(?<volume>([A-Za-z]:\/|[A-Za-z]:\\)?.*?):(?<container_path>([A-Za-z]:\/|[A-Za-z]:[\\])?.*?)(?::(?<flags>(rw|ro|z|Z)(,(rw|ro|z|Z))*))?$/;

export const getVolumeNameFromVolumeSpec = (volume: string) => {
    const volumeMatch = volume.match(volumeSpecRegex);
    if (volumeMatch === null) {
        return '';
    }

    return volumeMatch.groups.volume;
};

export const isNamedVolume = (source: string) =>
    source &&
    !source.includes('/') &&
    !source.includes('\\') &&
    !source.includes('~') &&
    !source.includes('.') &&
    !source.includes('$');

export const getVolumeLongSyntaxFromVolumeSpec = (volume: string) => {
    const volumeMatch = volume.match(volumeSpecRegex);
    if (volumeMatch === null) {
        return volume;
    }

    const longSyntax = {
        type: isNamedVolume(volumeMatch.groups.volume) ? 'volume' : 'bind',
        source: volumeMatch.groups.volume,
        target: volumeMatch.groups.container_path,
    };

    const flags = (volumeMatch.groups.flags || '').replace(/\s+/, '').split(',');
    if (flags.includes('ro')) {
        longSyntax.volume = { nocopy: true };
    }

    if (flags.includes('z')) {
        longSyntax.bind = { selinux: 'z' };
    } else if (flags.includes('Z')) {
        longSyntax.bind = { selinux: 'Z' };
    }

    return longSyntax;
};
