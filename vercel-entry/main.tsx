import { createRoot } from 'react-dom/client';
import Home from '../app/page';
import '../app/globals.css';
import './fonts.css';

const root = document.getElementById('root');
if (!root) throw new Error('AiWAS application root is missing.');
createRoot(root).render(<Home />);
