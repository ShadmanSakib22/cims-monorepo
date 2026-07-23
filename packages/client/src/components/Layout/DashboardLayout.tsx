import { Outlet } from 'react-router'
import { useUiStore } from '@/stores/ui'
import AppSidebar from './AppSidebar'
import AppTopbar from './AppTopbar'

export default function DashboardLayout() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && <AppSidebar />}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
