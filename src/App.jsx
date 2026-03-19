import React, { useState, useEffect, useRef } from 'react'
import './App.css'

const AnimatedCell = ({ value }) => {
  const prevValueRef = useRef(value);
  const [flashClass, setFlashClass] = useState('');

  useEffect(() => {
    if (value !== prevValueRef.current && prevValueRef.current !== undefined) {
      if (value > prevValueRef.current) setFlashClass('flash-green');
      else if (value < prevValueRef.current) setFlashClass('flash-red');
      
      const timer = setTimeout(() => setFlashClass(''), 1200);
      prevValueRef.current = value;
      return () => clearTimeout(timer);
    } else {
      prevValueRef.current = value;
    }
  }, [value]);

  return <span className={`animated-cell ${flashClass}`}>{value}</span>;
};

function App() {
  const [dataGroups, setDataGroups] = useState([]);
  const [latestLeads, setLatestLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, "");

  const fetchData = () => {
    fetch(`${apiBaseUrl}/api/leads/summary`)
      .then((response) => response.json())
      .then((data) => {
        setDataGroups(data);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching summary:', error));
  };

  const fetchLatest = () => {
    fetch(`${apiBaseUrl}/api/leads/latest`)
      .then((response) => response.json())
      .then((data) => setLatestLeads(data))
      .catch((error) => console.error('Error fetching latest:', error));
  };

  const fetchStatus = () => {
    fetch(`${apiBaseUrl}/api/simulation/status`)
      .then(res => res.json())
      .then(data => setIsRunning(data.isRunning))
      .catch(err => console.error('Error status:', err));
  };

  const toggleSimulation = () => {
    fetch(`${apiBaseUrl}/api/simulation/toggle`, { method: 'POST' })
      .then(res => res.json())
      .then(data => setIsRunning(data.isRunning))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
    fetchLatest();
    fetchStatus();
    const interval = setInterval(() => {
      fetchData();
      fetchLatest();
      fetchStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter only whales (leads that have MM in the string)
  const whaleLeads = latestLeads.filter(lead => lead.patrimonio.includes('MM'));

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-title-row">
          <h1>Simulador de Funil</h1>
          <div className="controls">
            <button className={`toggle-btn ${isRunning ? 'btn-stop' : 'btn-start'}`} onClick={toggleSimulation}>
              {isRunning ? 'Pausar Simulação' : 'Iniciar Simulação'}
            </button>
            {isRunning ? (
              <span className="live-indicator"><span className="pulse"></span> AO VIVO</span>
            ) : (
              <span className="paused-indicator">PAUSADO</span>
            )}
          </div>
        </div>
        <p>Visão agregada de leads por Leadsource e PMP</p>
      </header>

      <main className="dashboard-content">
        {loading ? (
          <p>Carregando dados...</p>
        ) : (
          <div className="table-container">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Leadsource</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Já existiam</th>
                  <th className="text-right">Varejo</th>
                  <th className="text-right">Elegíveis Portfel</th>
                  <th className="text-right">Elegíveis G</th>
                </tr>
              </thead>
              <tbody>
                {dataGroups.map((group, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    <tr className="group-header">
                      <td colSpan="6"><strong>{group.leadsource}</strong></td>
                    </tr>
                    {group.items.map((item, itemIndex) => (
                      <tr key={`${groupIndex}-${itemIndex}`}>
                        <td className="indent">{item.name}</td>
                        <td className="text-right"><AnimatedCell value={item.total} /></td>
                        <td className="text-right"><AnimatedCell value={item.ja_existiam} /></td>
                        <td className="text-right"><AnimatedCell value={item.varejo} /></td>
                        <td className="text-right"><AnimatedCell value={item.elegiveis_portfel ?? 0} /></td>
                        <td className="text-right"><AnimatedCell value={item.elegiveis_g ?? 0} /></td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                {dataGroups.length === 0 && (
                  <tr><td colSpan="6">Nenhum dado encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* CNN Ticker Bar Fixed at the bottom */}
      {whaleLeads.length > 0 && (
        <div className="news-ticker-wrapper">
          <div className="news-ticker-label">BREAKING NEWS</div>
          <div className="news-ticker-content">
            {whaleLeads.map((lead, idx) => (
              <span key={`${lead.nome}-${idx}`} className="ticker-item">
                🚨 Urgente: Lead <strong>{lead.nome}</strong> acaba de despontar com patrimônio declarado acima de <span>{lead.patrimonio}</span> pelo canal {lead.leadsource} / {lead.pmp}
              </span>
            ))}
            {/* Duplicated for smooth endless scrolling effect in case there's only 1 whale */}
            {whaleLeads.map((lead, idx) => (
              <span key={`dup-${lead.nome}-${idx}`} className="ticker-item">
                🚨 Urgente: Lead <strong>{lead.nome}</strong> acaba de despontar com patrimônio declarado acima de <span>{lead.patrimonio}</span> pelo canal {lead.leadsource} / {lead.pmp}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
export default App
