import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [dataGroups, setDataGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch('http://localhost:3000/api/leads/summary')
      .then((response) => response.json())
      .then((data) => {
        setDataGroups(data);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching data:', error));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 2500); // 2.5s update
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>
          Simulador de Funil
          <span className="live-indicator">
            <span className="pulse"></span> AO VIVO
          </span>
        </h1>
        <p>Visão agregada de leads por Leadsource e PMP</p>
      </header>

      <main className="dashboard-content">
        {loading ? (
          <p>Carregando dados...</p>
        ) : (
          <div className="table-container">
            <table className="leads-table summary-table">
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
                        <td className="text-right">{item.total}</td>
                        <td className="text-right">{item.ja_existiam}</td>
                        <td className="text-right">{item.varejo}</td>
                        <td className="text-right">{item.elegiveis_portfel ?? ''}</td>
                        <td className="text-right">{item.elegiveis_g ?? ''}</td>
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
