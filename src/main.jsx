import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, RotateCcw, Users, Globe2, Sparkles, ChevronLeft, ChevronRight, Github } from 'lucide-react';
import './styles.css';

const API_URL = 'https://rickandmortyapi.com/api/character';

function App() {
  const [characters, setCharacters] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [species, setSpecies] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function fetchCharacters() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (search.trim()) params.set('name', search.trim());
        if (status) params.set('status', status);
        if (species) params.set('species', species);
        const response = await fetch(`${API_URL}/?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) {
          if (response.status === 404) {
            setCharacters([]);
            setPages(1);
            setError('Nenhum personagem encontrado. Tente outro nome ou filtro.');
            return;
          }
          throw new Error('Não foi possível buscar os personagens agora. Verifique sua conexão e tente novamente.');
        }
        const data = await response.json();
        setCharacters(data.results || []);
        setPages(data.info?.pages || 1);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setCharacters([]);
          setError(err.message || 'Ocorreu um erro inesperado. Tente novamente.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    fetchCharacters();
    return () => controller.abort();
  }, [search, status, species, page]);

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="API Hunters início">
          <span className="brand-mark"><Globe2 size={22} /></span>
          <span>API<span className="brand-accent">HUNTERS</span></span>
        </a>
        <span className="api-pill"><span className="live-dot" /> API pública conectada</span>
      </header>

      <main id="top">
        <section className="hero">
          <div className="eyebrow"><Sparkles size={15} /> MISSÃO DE EXPLORAÇÃO #001</div>
          <h1>O multiverso está<br /><span>na palma da sua mão.</span></h1>
          <p className="hero-copy">Explore personagens de Rick and Morty em tempo real. Pesquise, filtre e descubra os habitantes mais estranhos do universo.</p>
          <div className="hero-stats">
            <div><Users size={17} /><strong>Personagens</strong><span>Catálogo interativo</span></div>
            <div><Globe2 size={17} /><strong>Dados ao vivo</strong><span>Rick and Morty API</span></div>
          </div>
          <div className="portal portal-one" /><div className="portal portal-two" />
        </section>

        <section className="explorer" aria-label="Explorador de personagens">
          <div className="section-heading">
            <div><span className="section-kicker">BANCO DE DADOS</span><h2>Explore os personagens</h2></div>
            <span className="result-label">{loading ? 'Buscando dados…' : `${characters.length} resultados nesta página`}</span>
          </div>

          <div className="filters">
            <label className="search-box"><Search size={19} /><input value={search} onChange={e => updateFilter(setSearch, e.target.value)} placeholder="Buscar personagem pelo nome..." aria-label="Buscar personagem pelo nome" /><kbd>API</kbd></label>
            <label className="select-wrap"><span>Status</span><select value={status} onChange={e => updateFilter(setStatus, e.target.value)}><option value="">Todos</option><option value="alive">Vivo</option><option value="dead">Morto</option><option value="unknown">Desconhecido</option></select></label>
            <label className="select-wrap"><span>Espécie</span><select value={species} onChange={e => updateFilter(setSpecies, e.target.value)}><option value="">Todas</option><option value="human">Humano</option><option value="alien">Alienígena</option><option value="humanoid">Humanoide</option><option value="robot">Robô</option><option value="animal">Animal</option></select></label>
            <button className="reset-button" onClick={() => { setSearch(''); setStatus(''); setSpecies(''); setPage(1); }} title="Limpar filtros" aria-label="Limpar filtros"><RotateCcw size={17} /></button>
          </div>

          {loading ? (
            <div className="state-panel"><div className="spinner" /><h3>Carregando o multiverso...</h3><p>Buscando dados na API pública.</p></div>
          ) : error ? (
            <div className="state-panel error-panel"><div className="state-icon">!</div><h3>{error.includes('Nenhum') ? 'Nada por aqui!' : 'Ops, algo deu errado'}</h3><p>{error}</p><button className="primary-button" onClick={() => { setPage(1); setSearch(s => s); }}>Tentar novamente <RotateCcw size={15} /></button></div>
          ) : (
            <>
              <div className="character-grid">
                {characters.map(character => (
                  <article className="character-card" key={character.id}>
                    <div className="card-image-wrap"><img src={character.image} alt={character.name} loading="lazy" /><span className={`status-tag ${character.status.toLowerCase()}`}><i />{character.status === 'Alive' ? 'Vivo' : character.status === 'Dead' ? 'Morto' : 'Desconhecido'}</span><span className="character-id">#{String(character.id).padStart(3, '0')}</span></div>
                    <div className="card-content"><h3 title={character.name}>{character.name}</h3><p className="species">{character.species}{character.type ? ` · ${character.type}` : ''}</p><div className="card-divider" /><div className="detail-row"><span>ÚLTIMA LOCALIZAÇÃO</span><strong title={character.location?.name}>{character.location?.name || 'Desconhecida'}</strong></div><div className="detail-row"><span>ORIGEM</span><strong title={character.origin?.name}>{character.origin?.name || 'Desconhecida'}</strong></div></div>
                  </article>
                ))}
              </div>
              <div className="pagination"><span>Página <strong>{page}</strong> de <strong>{pages}</strong></span><div className="page-actions"><button disabled={page <= 1} onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 480, behavior: 'smooth' }); }}><ChevronLeft size={17} /> Anterior</button><button disabled={page >= pages} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 480, behavior: 'smooth' }); }}>Próxima <ChevronRight size={17} /></button></div></div>
            </>
          )}
        </section>
      </main>
      <footer><div className="footer-brand"><span className="brand-mark small"><Globe2 size={16} /></span> API<span className="brand-accent">HUNTERS</span></div><p>Projeto educacional React · Dados fornecidos pela Rick and Morty API</p><a href="https://rickandmortyapi.com/" target="_blank" rel="noreferrer">Documentação da API <Github size={14} /></a></footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
