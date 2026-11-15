import { createRoot } from 'react-dom/client';
import { Lab } from './pages/Lab';
import { EstadoProvider } from './hooks/useEstado';
import './estilo.css';
import { RadioProvider } from './hooks/useRadio';
createRoot(document.getElementById('raiz')!).render(<EstadoProvider><RadioProvider><Lab /></RadioProvider></EstadoProvider>);
