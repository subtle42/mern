import 'bootstrap/dist/css/bootstrap.min.css'
import 'font-awesome/css/font-awesome.min.css'

Promise.all([
    import('react'),
    import('react-dom'),
    import('react-redux'),
    import('../data/store'),
    import('./main/main'),
    import('reactstrap')
])
.then(([React, ReactDOM, ReactRedux, store, Main, reactstrap]) => {
    ReactDOM.render(<ReactRedux.Provider store={store.default}><Main.Main /></ReactRedux.Provider>,
        document.getElementById('start'))
})
