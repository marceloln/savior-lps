import { createRoot } from 'react-dom/client';
import { Lab } from './pages/Lab';
import { EstadoProvider } from './hooks/useEstado';
import './estilo.css';
createRoot(document.getElementById('raiz')!).render(<EstadoProvider><Lab /></EstadoProvider>);
