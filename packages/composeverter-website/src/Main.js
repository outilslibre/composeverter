import React, { Component } from 'react';
import Composeverter from 'composeverter';

import 'normalize.css';
import 'html5-boilerplate/dist/css/main.css';
import './App.css';
// import Select from 'react-select';
import Header from './components/Header';
import Entry from './components/Entry';
import Output from './components/Output';
import Footer from './components/Footer';

const defaultCommand = `
nginx:
    ports:
        - '80:80'
    volumes:
        - '/var/run/docker.sock:/tmp/docker.sock:ro'
    image: nginx`;

const doConversion = (conversion, input, config) => {
    if (conversion === 'latest') {
        return Composeverter.migrateToCommonSpec(input, config);
    }
    if (conversion === 'v1ToV2x') {
        return Composeverter.migrateFromV1ToV2x(input, config);
    }
    if (conversion === 'v1ToV3x') {
        return Composeverter.migrateFromV2xToV3x(Composeverter.migrateFromV1ToV2x(input), config);
    }
    if (conversion === 'v2xToV3x') {
        return Composeverter.migrateFromV2xToV3x(input, config);
    }
    if (conversion === 'v3xToV2x') {
        return Composeverter.migrateFromV3xToV2x(input, config);
    }
    throw new Error(`Unknown conversion '${conversion}'`);
};

export default class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: defaultCommand,
            output: doConversion('latest', defaultCommand),
            conversion: 'latest',
            expandVolumes: false,
            expandPorts: false,
        };
        this.onInputChange = this.onInputChange.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.onExpandVolumesChange = this.onExpandVolumesChange.bind(this);
        this.onExpandPortsChange = this.onExpandPortsChange.bind(this);
    }

    onInputChange(value) {
        this.setState(() => ({
            input: value,
        }));
        this.updateConversion();
    }

    onSelectChange(value) {
        this.setState(() => ({
            conversion: value.value,
        }));
        this.updateConversion();
    }

    onExpandVolumesChange(e) {
        this.setState({
            expandVolumes: e.target.checked,
        });
        this.updateConversion();
    }

    onExpandPortsChange(e) {
        this.setState({
            expandPorts: e.target.checked,
        });
        this.updateConversion();
    }

    updateConversion() {
        this.setState((state) => {
            try {
                return {
                    output: doConversion(state.conversion, state.input, {
                        expandPorts: state.expandPorts,
                        expandVolumes: state.expandVolumes,
                    }),
                    error: '',
                };
            } catch (e) {
                return {
                    error: e.toString(),
                };
            }
        });
    }

    render() {
        return (
            <div>
                <Header />
                <Entry
                    input={this.state.input}
                    conversion={this.state.conversion}
                    expandVolumes={this.state.expandVolumes}
                    expandPorts={this.state.expandPorts}
                    onInputChange={this.onInputChange}
                    onSelectChange={this.onSelectChange}
                    onExpandPortsChange={this.onExpandPortsChange}
                    onExpandVolumesChange={this.onExpandVolumesChange}
                />
                <div style={{ marginTop: '1em' }}>
                    <Output output={this.state.output} error={this.state.error} />
                </div>
                <Footer />
            </div>
        );
    }
}
