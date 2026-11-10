import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {Button} from '@astryxdesign/core/Button';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import './tokens.css';

function App() {
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState('');
  const samples = ['Design tokens', 'Navigation', 'Forms', 'Responsive layout'];
  const filtered = samples.filter(item => item.toLowerCase().includes(query.toLowerCase()));
  return <Theme theme={neutralTheme}><main className="pilot-shell">
    <header className="pilot-header"><div><span className="eyebrow">DAVYLAB / DESIGNOS</span><h1>Astryx compatibility lab</h1><p>Isolated component and brand-token experiment · not production</p></div><span className="pilot-tag">P0 · Pilot</span></header>
    <section className="pilot-panel" aria-label="Component interaction"><h2>Component interaction</h2><p>Use the Astryx button to verify React state and click interaction.</p><Button label={`Clicked ${count} times`} variant="primary" onClick={() => setCount(value => value + 1)} /></section>
    <section className="pilot-panel" aria-label="Responsive and keyboard interaction"><h2>Responsive layout</h2><label htmlFor="filter">Filter examples</label><input id="filter" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search patterns" /><ul>{filtered.map(item => <li key={item}>{item}</li>)}</ul><p role="status">{filtered.length} results</p></section>
    <footer>By DAVYLAB · Experimental build</footer>
  </main></Theme>;
}
createRoot(document.getElementById('root')).render(<App/>);
