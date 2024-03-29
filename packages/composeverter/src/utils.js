/* @flow */

export const setDeepValue = (obj: any, path: string, value: any) => {
    let schema = obj; // a moving reference to internal objects within obj
    const pList = path.split('/');
    const len = pList.length;
    for (let i = 0; i < len - 1; i += 1) {
        const elem = pList[i];
        if (!schema[elem]) schema[elem] = {};
        schema = schema[elem];
    }

    schema[pList[len - 1]] = value;
};

export function handleExternalName(compose: any, part: 'networks' | 'volumes') {
    Object.keys(compose[part] || []).forEach((name) => {
        const partObj = compose[part][name];
        if (partObj && partObj.external && partObj.external.name) {
            partObj.name = partObj.external.name;
            partObj.external = true;
        }
    });
}
