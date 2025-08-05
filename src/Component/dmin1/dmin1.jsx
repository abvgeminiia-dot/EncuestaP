import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx'; // Importa la librería para Excel
import './dmin1.css'; // Asegúrate de que el nombre del CSS coincida

// --- INICIALIZACIÓN DE SUPABASE ---
// Asegúrate de que tus variables de entorno estén disponibles
const supabase = createClient(
  import.meta.env.VITE_APP_SUPABASE_URL,
  import.meta.env.VITE_APP_SUPABASE_ANON_KEY
);

const Admin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para la edición en línea
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Función para obtener los datos de Supabase
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const { data: tableData, error: fetchError } = await supabase
      .from('Cuestionario') // <-- Nombre de tu tabla
      .select('*')
      .order('created_at', { ascending: false }); // Muestra los más recientes primero

    if (fetchError) {
      setError(fetchError.message);
      console.error("Error fetching data:", fetchError);
    } else {
      setData(tableData);
    }
    setLoading(false);
  };

  // useEffect para cargar los datos cuando el componente se monta
  useEffect(() => {
    fetchData();
  }, []);

  // --- MANEJADORES DE ACCIONES ---

  // Manejador para eliminar una fila
  const handleDelete = async (rowId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro? Esta acción es irreversible.')) {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('Cuestionario')
        .delete()
        .eq('id', rowId);

      if (deleteError) {
        setError(deleteError.message);
        alert(`Error al eliminar: ${deleteError.message}`);
      } else {
        // Refresca los datos para mostrar la tabla actualizada
        fetchData();
      }
      setLoading(false);
    }
  };

  // Activa el modo de edición para una fila
  const handleEdit = (row) => {
    setEditingRowId(row.id);
    setEditFormData(row);
  };

  // Cancela el modo de edición
  const handleCancelEdit = () => {
    setEditingRowId(null);
  };
  
  // Actualiza el estado del formulario de edición mientras se escribe
  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  // Guarda los cambios de la fila editada
  const handleSaveEdit = async (rowId) => {
    setLoading(true);
    const { id, created_at, ...updateData } = editFormData; // Excluye 'id' y 'created_at' de la actualización

    const { error: updateError } = await supabase
      .from('Cuestionario')
      .update(updateData)
      .eq('id', rowId);

    if (updateError) {
      setError(updateError.message);
      alert(`Error al guardar: ${updateError.message}`);
    } else {
      setEditingRowId(null);
      fetchData(); // Refresca los datos
    }
    setLoading(false);
  };

  // Función para descargar la tabla en formato Excel
  const handleDownloadExcel = () => {
    if (data.length === 0) {
      alert("No hay datos para descargar.");
      return;
    }
    // Crea una hoja de cálculo a partir de los datos
    const worksheet = XLSX.utils.json_to_sheet(data);
    // Crea un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new();
    // Añade la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");
    // Descarga el archivo
    XLSX.writeFile(workbook, "Resultados_Cuestionario.xlsx");
  };

  if (loading && data.length === 0) {
    return <div className="admin-container"><h1>Cargando datos...</h1></div>;
  }

  if (error) {
    return <div className="admin-container"><h1>Error: {error}</h1></div>;
  }
  
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="admin-container">
      <h1>Panel de Administración</h1>
      <p>Gestiona los resultados del cuestionario.</p>
      
      <div className="admin-actions">
        <button onClick={fetchData} disabled={loading}>
          {loading ? 'Cargando...' : 'Refrescar Datos'}
        </button>
        <button onClick={handleDownloadExcel} className="excel-btn">
          Descargar como Excel
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {headers.map(header => <th key={header}>{header}</th>)}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id}>
                {headers.map(header => (
                  <td key={`${row.id}-${header}`} data-label={header}>
                    {editingRowId === row.id ? (
                      <input
                        type="text"
                        name={header}
                        value={editFormData[header] || ''}
                        onChange={handleEditFormChange}
                        disabled={header === 'id' || header === 'created_at'}
                      />
                    ) : (
                      String(row[header])
                    )}
                  </td>
                ))}
                <td className="actions-cell">
                  {editingRowId === row.id ? (
                    <>
                      <button className="save-btn" onClick={() => handleSaveEdit(row.id)}>Guardar</button>
                      <button className="cancel-btn" onClick={handleCancelEdit}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button className="edit-btn" onClick={() => handleEdit(row)}>Editar</button>
                      <button className="delete-btn" onClick={() => handleDelete(row.id)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;