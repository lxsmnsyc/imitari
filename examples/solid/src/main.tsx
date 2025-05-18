import { render } from 'solid-js/web';
import { Example } from './example';
import './index.css';

const app = document.getElementById('root');
if (app) {
  render(() => <Example />, document.getElementById('root'));
}
