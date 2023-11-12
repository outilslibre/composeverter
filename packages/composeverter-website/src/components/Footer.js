import React from 'react';
import styled from 'styled-components';

import Section from './Section';

const Container = styled.ul`
    line-height: 36px;
    list-style-type: none;
    font-family: 'Raleway', sans-serif;
    font-size: 12px;
    padding: 0;
    margin: 0;
`;

const Item = styled.li`
    float: left;

    &:not(:first-child):before {
        content: '-';
        margin-left: 9px;
        margin-right: 9px;
    }
`;

export default () => (
    <Section border>
        <Container>
            <Item>
                composeverter - built with{' '}
                <a rel="noopener noreferrer" href="https://www.npmjs.com/package/composeverter" target="_blank">
                    v{process.env.REACT_APP_COMPOSEVERTER_VERSION}
                </a>
            </Item>
            <Item>
                <a rel="noopener noreferrer" href="https://github.com/sharevb" target="_blank">
                    ShareVB on GitHub
                </a>
            </Item>
            <Item>
                Want to help improve composeverter? Open an{' '}
                <a rel="noopener noreferrer" href="https://github.com/outilslibre/composeverter/issues" target="_blank">
                    issue on Github
                </a>
                !
            </Item>
        </Container>
    </Section>
);
