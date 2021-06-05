import 'react-app-polyfill/ie11';
import * as React from 'react';
import { render } from 'react-dom';

const App = () => {
  return (
    <div>
      <h1>Hello world.</h1>
    </div>
  );
};

render(<App />, document.getElementById('root'));
