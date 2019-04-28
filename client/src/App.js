import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import configureStore from './redux/configureStore';

import { Home } from './components/Home';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.persistor = configureStore().persistor;
    this.store = configureStore().store;
  }
  render() {
    return (
      <Provider store={this.store}>
        <PersistGate loading={null} persistor={this.persistor}>
          <div class="App">
            <BrowserRouter>
              <React.Fragment>
                <Route exact path="/" component={Home} />
              </React.Fragment>
            </BrowserRouter>
          </div>
        </PersistGate>
      </Provider>
    );
  }
}

export default App;
