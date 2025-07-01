import 'bootstrap/dist/css/bootstrap.min.css'
import 'font-awesome/css/font-awesome.min.css'

Promise.all([
    import('react'),
    import('react-dom'),
    import('./main/main'),
    import('reactstrap')
])
.then(([React, ReactDOM, Main, reactstrap]) => {
    ReactDOM.render(<Main.Main />,
        document.getElementById('start'))
})
