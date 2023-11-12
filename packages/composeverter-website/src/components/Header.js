import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    display: block;
    position: relative;
    background: #848850;
    color: #fff;
    border-bottom: 2px solid #5f561b;
`;

const Title = styled.div`
    display: inline-block;
    margin: 14px 50px;
    font-family: 'Ubuntu Mono', monospace;
    font-size: 40px;
`;

const Buttons = styled.div`
    position: absolute;
    bottom: 7px;
    right: 50px;
`;

const Link = styled.a`
    margin-left: 7px;
`;

export default () => (
    <Container>
        <Title>$ composeverter</Title>
        <Buttons>
            <Link href="https://github.com/outilslibre/composeverter">
                <img alt="npm" src="https://img.shields.io/npm/v/composeverter" />
            </Link>
            <Link href="https://github.com/sharevb">
                <img
                    src="https://img.shields.io/badge/ShareVB-100000?logo=github&logoColor=white"
                    alt="ShareVB on GitHub"
                    style={{ height: '20px' }}
                />
            </Link>
            <Link href="https://github.com/outilslibre/composeverter">
                <img
                    src="https://img.shields.io/github/stars/outilslibre/composeverter.svg?style=social&label=Star"
                    alt="github"
                />
            </Link>
        </Buttons>
    </Container>
);
