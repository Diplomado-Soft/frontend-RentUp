import axiosInstance from '../contexts/axiosInstance';

const submitApartment = async (formData) => {
    if (
        !formData.get('barrio') ||
        !formData.get('direccion') ||
        !formData.get('latitud') ||
        !formData.get('longitud') ||
        !formData.get('addInfo') ||
        !formData.get('price')
    ) {
        throw new Error('Por favor rellene los campos requeridos (incluyendo el precio)');
    }

    const price = parseFloat(formData.get('price'));
    if (isNaN(price) || price <= 0) {
        throw new Error('El precio debe ser un número válido mayor a 0');
    }

    try {
        const response = await axiosInstance.post(
            `/apartments/addApartment`, 
            formData
        );

        if (response.status === 201 || response.status === 200) {
            return response.data;
        }
        throw new Error('Error inesperado del servidor');
    } catch (error) {
        console.error('Error añadiendo apartamento:', error);
        if (error.response?.status === 401) {
            throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
        }
        if (error.response?.status === 400) {
            console.error('🔍 DEBUG 400 - response data:', error.response.data);
            throw new Error(error.response.data?.error || 'Datos inválidos. Verifica que el precio sea válido.');
        }
        throw new Error('Hubo un problema al añadir el apartamento');
    }
};

export { submitApartment };