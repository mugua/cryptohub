import { Component, PropsWithChildren } from 'react';
import './app.scss';

class App extends Component<PropsWithChildren> {
  componentDidMount() {
    console.log('CryptoHub App launched');
  }

  componentDidShow() {
    console.log('CryptoHub App shown');
  }

  componentDidHide() {
    console.log('CryptoHub App hidden');
  }

  render() {
    return this.props.children;
  }
}

export default App;
