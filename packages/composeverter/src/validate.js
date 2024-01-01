/* @flow */

import { volumeSpecRegex } from './volumeutils';
import { portSpecRegex } from './portutils';
import { yamlParse } from './yamlparse';
import { dockerComposeCommonSpecSchema } from './composeschema';

const yaml = require('yaml');
const Ajv = require('ajv');
const AjvErrors = require('ajv-errors');

const formats = {
    // taken from https://github.com/dnephin/compose/blob/master/compose/config/validation.py#L45
    expose: /^\d+(-\d+)?(\/[a-zA-Z]+)?$/,
    ports: portSpecRegex,
    volumes: volumeSpecRegex,
    duration: /^(\d+(us|ms|s|m|h))+$/,
    byte: /^\d+(b|kb?|mb?|gb?)$/,
    // taken from https://github.com/dnephin/compose/blob/master/compose/config/validation.py#L47
    subnet_ip_address:
        /^((\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\/(\d|[1-2]\d|3[0-2])$|^((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}(:[0-9a-fA-F]{1,4}){1,1})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|(([0-9a-fA-F]{1,4}:){1,1}(:[0-9a-fA-F]{1,4}){1,6})|(:((:[0-9a-fA-F]{1,4}){1,7}|:))|(fe80:(:[0-9a-fA-F]{1,4}){0,4}%[0-9a-zA-Z]{1,})|(::(ffff(:0{1,4}){0,1}:){0,1}((\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5]))|(([0-9a-fA-F]{1,4}:){1,4}:((\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])))\/(\d|[1-9]\d|1[0-1]\d|12[0-8])$/,
};

export const validateDockerComposeToCommonSpec = (content: string) => {
    const compose = yamlParse(content);
    const ajv = new Ajv({ allErrors: true, strict: false });
    AjvErrors(ajv);
    Object.keys(formats).forEach((format) => ajv.addFormat(format, formats[format]));
    const validate = ajv.compile(dockerComposeCommonSpecSchema);
    const valid = validate(compose);
    if (valid) return [];

    const getHelpTopLevelHref = (name) => {
        const baseHref = 'https://docs.docker.com/compose/compose-file/';
        if (name === 'services') return `${baseHref}05-services/`;
        if (name === 'networks') return `${baseHref}06-networks/`;
        if (name === 'volumes') return `${baseHref}07-volumes/`;
        if (name === 'configs') return `${baseHref}08-configs/`;
        if (name === 'secrets') return `${baseHref}09-secrets/`;

        return baseHref;
    };

    const composeDoc = yaml.parseDocument(content, { prettyErrors: true });
    return validate.errors.map((err) => {
        let { instancePath } = err;
        if (err.keyword === 'additionalProperties') instancePath += `/${err.params.additionalProperty}`;
        const parsedPath = instancePath.split('/').slice(1);
        let node = composeDoc.getIn(parsedPath, true);
        if (node === null) node = composeDoc.getIn(parsedPath.slice(0, -1), true);
        const pos = node ? node.range[0] + 1 : 0;
        const line = (content.substring(0, pos).match(/\n/g) || []).length + 1;
        let message;
        if (err.keyword === 'additionalProperties')
            message = `Line ${line}(${instancePath}): '${err.params.additionalProperty}' is unknown for '${instancePath}'`;
        else if (err.keyword === 'format')
            message = `Line ${line}(${instancePath}): must have a valid syntax for '${err.params.format}'`;
        else if (err.keyword === 'oneOf')
            message = `Line ${line}(${instancePath}): must be either a Short Syntax (string(s)) or a Long Syntax (object(s))`;
        else message = `Line ${line}(${instancePath}): ${err.message} (${err.keyword}: ${JSON.stringify(err.params)})`;
        const helpLink = getHelpTopLevelHref(parsedPath[0]) + (parsedPath[2] ? `#${parsedPath[2]}` : '');
        return { line, message, helpLink };
    });
};

const replaceFormats = (obj) => {
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i += 1) {
            replaceFormats(obj[i]);
        }
    } else if (typeof obj === 'object') {
        if (obj.type && obj.format) {
            obj.pattern = formats[obj.format].toString();
            delete obj.format;
        }
        Object.keys(obj).forEach((key) => {
            replaceFormats(obj[key]);
        });
    }

    return obj;
};

export const getDockerComposeSchemaWithoutFormats = () => {
    return replaceFormats(dockerComposeCommonSpecSchema);
};
