import 'bootstrap/dist/css/bootstrap.min.css'
import 'font-awesome/css/font-awesome.min.css'
import { createRoot } from 'react-dom/client';


Promise.all([
    import('react'),
    import('./main/main'),
])
.then(([React, Main]) => {
    const root = createRoot(document.getElementById('start') as HTMLElement);
    root.render(<Main.Main />);
})
