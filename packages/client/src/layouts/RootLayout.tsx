import { Outlet } from "react-router"

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b px-6">
        <span className="text-lg font-semibold">SmartClinic</span>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
