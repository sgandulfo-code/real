const handleSave = async () => {
  setLoading(true);
  try {
    // 1. Preparamos el objeto para insertar
    const propertyToSave = { 
      ...suggestedData,        // Trae thumbnail, price, location, etc.
      title: editableTitle,    // Usa el título que editaste en el input
      group_id: groupId,       // Lo vincula al proyecto actual
      updated_at: new Date()   // Ahora que la columna existe, esto funcionará
    };

    // 2. Insertamos en Supabase
    const { data, error } = await supabase
      .from('properties')
      .insert([propertyToSave]);

    if (error) throw error;

    // 3. Limpieza y feedback
    alert("¡Propiedad guardada con éxito!");
    setSuggestedData(null); // Volver al buscador
    setUrl('');             // Limpiar el input de URL
    
    if (onPropertyAdded) onPropertyAdded(); // Refrescar la lista de propiedades automáticamente
    
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("Error al guardar en la base de datos: " + error.message);
  } finally {
    setLoading(false);
  }
};
