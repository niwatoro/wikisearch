import React from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import ReactDOM from 'react-dom/client';

import './index.css';
import Wiktionary from "./wiktionary";
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider>
    <Wiktionary />
  </ChakraProvider>
);

// If you want to start measuring performancncue in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// hit npm install -g npm-check-updates and ncu -u