import React from 'react';
import styled from 'styled-components/macro';
import Select from 'react-select';

import Section from './Section';
import LinedTextInput from './LinedTextInput';
import Code from './Code';
import CarbonAds from './CarbonAds';
import Checkbox from './Checkbox';

const Blurb = styled.div`
    line-height: 32px;
    margin-top: -10px;
    margin-bottom: 10px;
`;

export default function Entry(props) {
    const options = [
        { value: 'v1ToV2x', label: 'V1 to V2 2.x' },
        { value: 'v1ToV3x', label: 'V1 to V2 3.x' },
        { value: 'v2xToV3x', label: 'V2 - 2.x to 3.x' },
        { value: 'v3xToV2x', label: 'V2 - 3.x to 2.x' },
        { value: 'latest', label: 'CommonSpec' },
    ];
    return (
        <Section topPadding>
            <div
                css={`
                    display: flex;
                `}
            >
                <div
                    css={`
                        flex-grow: 1;
                    `}
                >
                    <Blurb>
                        <p>
                            <a
                                href="https://docs.docker.com/compose/compose-file/compose-versioning/#upgrading"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                Convert automatically
                            </a>{' '}
                            your Docker compose file from V1 to V2 (2.x, 3.x, Common Specification)
                        </p>
                        <p>
                            Looking for turning <Code>docker run</Code> command(s) to Docker compose file: ? Try{' '}
                            <a href="https://composerize.com" rel="noopener noreferrer" target="_blank">
                                Composerize
                            </a>
                        </p>
                        <p>
                            Looking for turning Docker compose file <Code>docker run</Code> command(s): ? Try{' '}
                            <a href="https://decomposerize.com" rel="noopener noreferrer" target="_blank">
                                Decomposerize
                            </a>
                        </p>
                        <p>
                            Paste your{' '}
                            <a
                                href="https://docs.docker.com/engine/reference/run/"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                docker-compose.yml
                            </a>{' '}
                            into the box below!
                        </p>
                    </Blurb>
                    <LinedTextInput
                        erroredLines={props.erroredLines}
                        value={props.input}
                        numOfLines={5}
                        onValueChange={props.onInputChange}
                    />
                    <pre style={{ color: 'red' }}>{props.error}</pre>
                    <span>Docker Compose version:</span>
                    <Select
                        onChange={props.onSelectChange}
                        options={options}
                        value={options.filter(({ value }) => value === props.conversion)}
                    />
                    <div
                        css={`
                            display: flex;
                        `}
                    >
                        <Checkbox
                            label="Expand Volumes"
                            value={props.expandVolumes}
                            onChange={props.onExpandVolumesChange}
                            style={{ margin: '5pt' }}
                        />
                        <Checkbox
                            label="Expand Ports"
                            value={props.expandPorts}
                            onChange={props.onExpandPortsChange}
                            style={{ margin: '5pt' }}
                        />
                    </div>
                </div>
                <div
                    css={`
                        padding-left: 22px;
                        padding-bottom: 18px;
                        margin-top: -8px;
                    `}
                >
                    <CarbonAds />
                </div>
            </div>
        </Section>
    );
}
