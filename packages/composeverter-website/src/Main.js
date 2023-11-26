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

const doConversion = (conversion, input) => {
    if (conversion === 'latest') {
        return Composeverter.migrateToCommonSpec(input);
    } if (conversion === 'v1ToV2x') {
        return Composeverter.migrateFromV1ToV2x(input);
    } if (conversion === 'v1ToV3x') {
        return Composeverter.migrateFromV2xToV3x(Composeverter.migrateFromV1ToV2x(input));
    } if (conversion === 'v2xToV3x') {
        return Composeverter.migrateFromV2xToV3x(input);
    } if (conversion === 'v3xToV2x') {
        return Composeverter.migrateFromV3xToV2x(input);
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
        };
        this.onInputChange = this.onInputChange.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
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

    updateConversion() {
        this.setState((state) => {
            try {
                return {
                    output: doConversion(state.conversion, state.input),
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
                    onInputChange={this.onInputChange}
                    onSelectChange={this.onSelectChange}
                />
                <div style={{ marginTop: '1em' }}>
                    <Output output={this.state.output} error={this.state.error} />
                </div>
                <Footer />
            </div>
        );
    }
}
