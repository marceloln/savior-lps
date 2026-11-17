import { createRoot } from 'react-dom/client';
import { Lab } from './pages/Lab';
import { EstadoProvider } from './hooks/useEstado';
import './estilo.css';
import { RadioProvider } from './hooks/useRadio';
import { AgendaGoogleProvider } from './hooks/useAgendaGoogle';
createRoot(document.getElementById('raiz')!).render(<EstadoProvider><AgendaGoogleProvider><RadioProvider><Lab /></RadioProvider></AgendaGoogleProvider></EstadoProvider>);
