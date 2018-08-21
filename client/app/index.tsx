import 'bootstrap/dist/css/bootstrap.css'
import 'font-awesome/css/font-awesome.css'

Promise.all([
    import('react'),
    import('react-dom'),
    import('react-redux'),
    import('../data/store'),
    import('./main/main')
])
.then(([React, ReactDOM, ReactRedux, store, Main]) => {
    ReactDOM.render(<ReactRedux.Provider store={store.default}><Main.Main /></ReactRedux.Provider>,
        document.getElementById('start'))
})
