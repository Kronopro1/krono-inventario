import NuevoProductoForm from "./NuevoProductoForm"

export default function NuevoProductoPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-4xl font-bold">Crear Producto</h1>

      <p className="mt-2 text-slate-600">
        Registra nuevos SKUs en el sistema.
      </p>

      <NuevoProductoForm />
    </main>
  )
}