import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { preguntas, opciones } from './preguntas';
import './Cuestionario.css';

const CuestionarioCompleto = () => {
  // --- INICIALIZACIÓN DE SUPABASE ---
  const supabase = createClient(
    import.meta.env.VITE_APP_SUPABASE_URL,
    import.meta.env.VITE_APP_SUPABASE_ANON_KEY
  );

  // Define aquí los IDs de las preguntas "claves".
  const preguntasNegativasIds = new Set(['ii2']);

  // --- Estados del componente ---
  const [vista, setVista] = useState('inicio');
  const [respuestas, setRespuestas] = useState({});
  const [estadoEnvio, setEstadoEnvio] = useState('idle');
  const [datosUsuario, setDatosUsuario] = useState({
    Sexo: '',
    Edad: '',
    Años_Trabajando: '',
    Cargo: ''
  });
  const [errorDatos, setErrorDatos] = useState('');

  const handleDatosChange = (e) => {
    const { name, value } = e.target;
    setDatosUsuario(prevDatos => ({
      ...prevDatos,
      [name]: value
    }));
  };

  const handleIniciar = () => {
    if (!datosUsuario.Sexo || !datosUsuario.Edad || !datosUsuario.Años_Trabajando || !datosUsuario.Cargo.trim()) {
      setErrorDatos('Por favor, complete todos los campos para continuar.');
      return;
    }
    setErrorDatos('');
    setRespuestas({});
    setEstadoEnvio('idle');
    setVista('cuestionario');
  };

  const handleSeleccionRespuesta = (preguntaId, opcion) => {
    setRespuestas({ ...respuestas, [preguntaId]: opcion });
  };

  const calcularYEnviarResultados = async () => {
    if (Object.keys(respuestas).length !== preguntas.length) {
      alert('Por favor, responda todas las preguntas para poder finalizar.');
      return;
    }

    setVista('resultados');
    setEstadoEnvio('enviando');

    // --- Lógica de Cálculo ---

    const puntajes = { 'Siempre': 4, 'A menudo': 3, 'Raramente': 2, 'Nunca': 1 };
    const resultadosPorDimension = {};
    const idsEnContraDetectados = [];

    preguntas.forEach(pregunta => {
      // Cálculo de puntajes por dimensión
      if (!resultadosPorDimension[pregunta.dimension]) {
        resultadosPorDimension[pregunta.dimension] = { puntajeTotal: 0, cantidad: 0 };
      }
      resultadosPorDimension[pregunta.dimension].puntajeTotal += puntajes[respuestas[pregunta.id]];
      resultadosPorDimension[pregunta.dimension].cantidad += 1;

      // Verificación de preguntas en contra
      const respuestaUsuario = respuestas[pregunta.id];

      // --> MODIFICADO: La condición ahora es que la respuesta NO sea 'Siempre'.
      if (preguntasNegativasIds.has(pregunta.id) && respuestaUsuario !== 'Siempre') {
        idsEnContraDetectados.push(pregunta.id);
      }
    });


    // --- Preparación del Objeto para Supabase ---
    
    let puntajeGeneralTotal = 0;
    let cantidadDimensiones = 0;

    const objetoParaSupabase = {
      ...datosUsuario,
      Preguntas_Claves_En_Contra: idsEnContraDetectados.join(', '),
    };

    Object.keys(resultadosPorDimension).forEach(dimension => {
      const { puntajeTotal, cantidad } = resultadosPorDimension[dimension];
      const promedio = parseFloat((puntajeTotal / cantidad).toFixed(2));
      const claveSupabase = dimension.replace(/ /g, '_');
      objetoParaSupabase[claveSupabase] = promedio;
      puntajeGeneralTotal += promedio;
      cantidadDimensiones++;
    });

    objetoParaSupabase['Puntaje'] = parseFloat((puntajeGeneralTotal / cantidadDimensiones).toFixed(2));

    try {
      const { error } = await supabase
        .from('Cuestionario')
        .insert([objetoParaSupabase]);

      if (error) throw error;

      setEstadoEnvio('exitoso');
    } catch (error) {
      console.error('Error al enviar los datos a Supabase:', error);
      setEstadoEnvio('error');
    }
  };

  // --- Renderizado de las vistas (sin cambios) ---

  const renderInicio = () => (
    <div className="card-inicio">
      <div className="icon-container">📈</div>
      <h1>Diagnóstico Completo de Liderazgo y Compromiso</h1>
      <p>
        Antes de comenzar, por favor complete los siguientes datos. Sus respuestas son anónimas y cruciales para nuestro crecimiento.
      </p>
      <div className="form-datos-usuario">
        <div className="form-grupo">
          <label htmlFor="Sexo">Sexo</label>
          <select name="Sexo" id="Sexo" value={datosUsuario.Sexo} onChange={handleDatosChange}>
            <option value="">Seleccione...</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </div>
        <div className="form-grupo">
          <label htmlFor="Edad">Edad (años)</label>
          <input type="number" name="Edad" id="Edad" value={datosUsuario.Edad} onChange={handleDatosChange} placeholder="Ej: 35"/>
        </div>
        <div className="form-grupo">
          <label htmlFor="Años_Trabajando">Años en la empresa</label>
          <input type="number" name="Años_Trabajando" id="Años_Trabajando" value={datosUsuario.Años_Trabajando} onChange={handleDatosChange} placeholder="Ej: 5"/>
        </div>
        <div className="form-grupo">
          <label htmlFor="Cargo">Cargo Actual</label>
          <input type="text" name="Cargo" id="Cargo" value={datosUsuario.Cargo} onChange={handleDatosChange} placeholder="Ej: Analista de Proyectos"/>
        </div>
      </div>
      {errorDatos && <p className="error-mensaje">{errorDatos}</p>}
      <button onClick={handleIniciar} className="btn-principal">
        Iniciar Diagnóstico
      </button>
    </div>
  );

  const renderCuestionario = () => (
    <>
      <h1 className="titulo-cuestionario">Evaluación Integral</h1>
      {preguntas.map((pregunta, index) => (
        <div key={pregunta.id} className="card-pregunta">
          <p className="texto-pregunta">{`${index + 1}. ${pregunta.texto}`}</p>
          
          <div className="opciones-container">
            {opciones.map(opcion => (
              <label key={opcion} className={`opcion-label ${respuestas[pregunta.id] === opcion ? 'seleccionada' : ''}`}>
                <input
                  type="radio"
                  name={pregunta.id}
                  value={opcion}
                  checked={respuestas[pregunta.id] === opcion}
                  onChange={() => handleSeleccionRespuesta(pregunta.id, opcion)}
                  className="opcion-input"
                />
                {opcion}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button onClick={calcularYEnviarResultados} className="btn-principal btn-finalizar">
        Finalizar y Enviar Resultados
      </button>
    </>
  );

  const renderResultados = () => {
    let contenido;
    switch (estadoEnvio) {
      case 'enviando':
        contenido = (
          <>
            <div className="icon-container">⏳</div>
            <h1>Enviando resultados...</h1>
            <p>Por favor, espere un momento.</p>
          </>
        );
        break;
      case 'exitoso':
        contenido = (
          <>
            <div className="icon-container">✅</div>
            <h1>¡Resultados enviados!</h1>
            <p>Muchas gracias por completar la evaluación. Sus respuestas han sido registradas correctamente.</p>
          </>
        );
        break;
      case 'error':
        contenido = (
          <>
            <div className="icon-container">❌</div>
            <h1>Error en el envío</h1>
            <p>Lo sentimos, ha ocurrido un error al intentar registrar sus respuestas. Por favor, inténtelo de nuevo más tarde.</p>
          </>
        );
        break;
      default:
        contenido = <p>Cargando...</p>;
    }
    return (
      <div className="card-resultados-wrapper">
        {contenido}
      </div>
    );
  };

  return (
    <div className="main-container">
      {vista === 'inicio' && renderInicio()}
      {vista === 'cuestionario' && renderCuestionario()}
      {vista === 'resultados' && renderResultados()}
    </div>
  );
};

export default CuestionarioCompleto;