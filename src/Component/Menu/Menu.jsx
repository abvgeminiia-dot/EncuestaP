import React, { useState } from 'react';
import './Menu.css'; // Usaremos un nuevo archivo CSS con estilos similares

const MenuPrincipal = () => {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Objeto para manejar los textos del modal dinámicamente
  const modalInfo = {
    ResultadosAdmin: {
      title: "Acceso a Resultados",
      description: "Ingrese la contraseña para acceder al Panel de Resultados."
    },
    AdminPanel: {
      title: "Panel de Administración",
      description: "Ingrese la contraseña de administrador para gestionar los datos."
    }
  };

  // Función para manejar opciones que necesitan contraseña
  const handleAccesoRestringido = (opcion) => {
    setOpcionSeleccionada(opcion);
    setMostrarModal(true);
    setPassword('');
    setError('');
  };

  // Función para redirigir directamente (para opciones sin contraseña)
  const handleAccesoDirecto = (ruta) => {
    // En una app real con React Router, usarías: navigate(ruta);
    window.location.href = ruta;
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Verificar contraseña según la opción seleccionada
    if (opcionSeleccionada === 'AdminPanel' && password === 'admin2025') {
      // Redirigir al panel de resultados
      window.location.href = '/dmin1';
    } else {
      setError('Contraseña incorrecta. Inténtelo de nuevo.');
    }
  };

  const handleCloseModal = () => {
    setMostrarModal(false);
    setOpcionSeleccionada('');
    setError('');
  };

  return (
    <div className="main-container">
      <header className="header-container">
        
        <h1 className="main-title">Plataforma de Liderazgo y Compromiso</h1>
        <p className="subtitle">Seleccione una opción para comenzar</p>
      </header>

      <section className="section section-menu">
        <div className="menu-buttons">
          
          {/* Botón para realizar el cuestionario */}
          <button 
            className="menu-button menu-button-a"
            onClick={() => handleAccesoDirecto('/cuestionario')}
          >
            <div className="menu-icon">📝</div>
            <div className="menu-content">
              <h3>Realizar Cuestionario</h3>
              <p>Evalúe el liderazgo y el compromiso en su equipo.</p>
            </div>
          </button>
          
          {/* Botón para administrar datos (NUEVO) */}
          <button 
            className="menu-button menu-button-b"
            onClick={() => handleAccesoRestringido('AdminPanel')}
          >
            <div className="menu-icon">⚙️</div>
            <div className="menu-content">
              <h3>Administrar Datos</h3>
              <p>Acceda al panel para gestionar todos los registros.</p>
            </div>
          </button>

        </div>
      </section>

      {/* Modal para ingresar contraseña */}
      {mostrarModal && (
        <div className="password-modal-backdrop">
          <div className="password-modal">
            <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            <h2 className="modal-title">{modalInfo[opcionSeleccionada]?.title || 'Acceso Restringido'}</h2>
            <p>{modalInfo[opcionSeleccionada]?.description || 'Por favor, ingrese la contraseña.'}</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="input-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="text-input"
                  autoFocus
                />
              </div>
              <div className="button-container">
                <button type="submit" className="submit-button">
                  Acceder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPrincipal;
