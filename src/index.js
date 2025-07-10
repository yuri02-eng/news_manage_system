import React, {Component} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './util/http'
import {Provider} from 'react-redux'
import {store,persistor} from './redux/store'
import {PersistGate} from "redux-persist/integration/react";

const root = ReactDOM.createRoot(document.getElementById('root'));
// console.log('Store instance:', store); // 确保不是 null/undefined
// console.log('Store state:', store.getState()); // 验证状态结构
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error) {
        return {hasError: true};
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught an error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>;
        }
        return this.props.children;
    }
}

root.render(
    <ErrorBoundary>
        <PersistGate loading={null} persistor={persistor}>
            <Provider store={store}>
                <App/>
            </Provider>
        </PersistGate>
    </ErrorBoundary>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
