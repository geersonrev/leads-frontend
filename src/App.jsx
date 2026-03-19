import React, { useState, useEffect, useRef } from 'react'
import './App.css'

// Internal component to handle cell flashing independently based on delta changes
const AnimatedCell = ({ value }) => {
  const prevValueRef = useRef(value);
  const [flashClass, setFlashClass] = useState('');

  useEffect(() => {
    // Only flash if the value has genuinely changed and is not undefined
    if (value !== prevValueRef.current && prevValueRef.current !== undefined) {
      if (value > prevValueRef.current) {
         setFlashClass('flash-green'); // Positive Increase
      } else if (value < prevValueRef.current) {
         setFlashClass('flash-red');   // Negative Drop / Decrease
      }
      
      const timer = setTimeout(() => {
        setFlashClass('');
      }, 1200);

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
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  // Dynamic API URL for Vercel (using fallback for local dev)
  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, "");

  // Fetch summary data
  const fetchData = () => {
    fetch(`${apiBaseUrl}/api/leads/summary`)
      .then((response) => response.json())
      .then((data) => {
        setDataGroups(data);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching data:', error));
  };

  // Fetch simulation status
  const fetchStatus = () => {
    fetch(`${apiBaseUrl}/api/simulation/status`)
      .then(res => res.json())
      .then(data => setIsRunning(data.isRunning))
      .catch(err => console.error(err));
  };

  // Toggle simulation state
  const toggleSimulation = () => {
    fetch(`${apiBaseUrl}/api/simulation/toggle`, { method: 'POST' })
      .then(res => res.json())
      .then(data => setIsRunning(data.isRunning))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
    fetchStatus();
    const interval = setInterval(() => {
      fetchData();
      fetchStatus();
    }, 5000); // 5s update
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-title-row">
          <h1>Simulador de Funil</h1>
          <div className="controls">
            <button 
              className={`toggle-btn ${isRunning ? 'btn-stop' : 'btn-start'}`}
              onClick={toggleSimulation}
            >
              {isRunning ? 'Pausar Simulação' : 'Iniciar Simulação'}
            </button>
            {isRunning && (
              <span className="live-indicator">
                <span className="pulse"></span> AO VIVO
              </span>
            )}
            {!isRunning && (
              <span className="paused-indicator">
                PAUSADO
              </span>
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
                      <td colSpan="6">
                        <strong>{group.leadsource}</strong>
                      </td>
                    </tr>
                    {group.items.map((item, itemIndex) => (
                      <tr key={`${groupIndex}-${itemIndex}`}>
                        <td className="indent">{item.name}</td>
                        <td className="text-right">
                          <AnimatedCell value={item.total} />
                        </td>
                        <td className="text-right">
                          <AnimatedCell value={item.ja_existiam} />
                        </td>
                        <td className="text-right">
                          <AnimatedCell value={item.varejo} />
                        </td>
                        <td className="text-right">
                          <AnimatedCell value={item.elegiveis_portfel ?? 0} />
                        </td>
                        <td className="text-right">
                          <AnimatedCell value={item.elegiveis_g ?? 0} />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                {dataGroups.length === 0 && (
                  <tr>
                    <td colSpan="6">Nenhum dado encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
