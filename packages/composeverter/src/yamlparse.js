/* @flow */

const yaml = require('yaml');

class YamlSyntaxError extends Error {
    constructor(message, lines, details) {
        super(message);
        this.lines = lines;
        this.details = details;
        this.name = 'YamlSyntaxError';
    }
}

export const yamlCheck = (content: string) => {
    const doc = yaml.parseDocument(content, { prettyErrors: true });

    const lines = [];
    const messages = [];

    doc.errors.forEach((e, i) => {
        const errorMsg = e.message.split(':\n')[0];
        messages.push({ line: e.linePos[0].line, message: errorMsg, pos: e.linePos });
        Array.from(
            { length: e.linePos ? e.linePos[1].line - e.linePos[0].line : 1 },
            (_, l) => e.linePos[0].line + l,
        ).forEach((line) => lines.push(line));
    });

    if (messages.length > 0) {
        throw new YamlSyntaxError(messages.map((m) => m.message).join('\n'), lines, messages);
    }
};

export const yamlParse = (content: string) => {
    yamlCheck(content);
    return yaml.parse(content, { intAsBigInt: true });
};
