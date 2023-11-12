import React, { Component } from 'react';
import styled from 'styled-components';

import CBox from './CBox';

const StyledInput = styled.textarea`
    ${CBox}
    height:15em;
`;

export default class TextInput extends Component {
    handleChange(e) {
        this.props.onInputChange(e.target.value);
    }

    render() {
        const { value } = this.props;

        return (
            <StyledInput
                value={value}
                onChange={e => {
                    this.handleChange(e);
                }}
            />
        );
    }
}
