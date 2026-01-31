export const useProductos = () => {
  const supabase = useSupabaseClient()
  const productos = ref([])

  // Cargar productos iniciales
  const fetchProductos = async () => {
    const { data } = await supabase.from('productos').select('*')
    productos.value = data || []
  }

  // Escuchar cambios en tiempo real
  const subscribeToChanges = () => {
    supabase
      .channel('cambios-productos')
      .on('postgres_changes', { event: '*', table: 'productos' }, (payload) => {
        console.log('Cambio detectado:', payload)
        fetchProductos() // Recargar la lista cuando algo cambie
      })
      .subscribe()
  }

  return {
    productos,
    fetchProductos,
    subscribeToChanges
  }
}