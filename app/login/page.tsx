import LoginForm from "./LoginForm"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-950">
            Krono Inventario
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Ingresa con tu cuenta para continuar.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  )
}