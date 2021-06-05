import 'react-app-polyfill/ie11';
import * as ReactDOM from 'react-dom';

const App = () => {
  return (
    <div>
      <h1>Hello world.</h1>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
