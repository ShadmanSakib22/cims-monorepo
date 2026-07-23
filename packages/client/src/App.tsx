import { ClerkProvider } from '@/providers/ClerkProvider'
import { I18nProvider } from '@/providers/I18nProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { RouterProvider } from 'react-router'
import { router } from '@/router'
import { Toaster } from 'sonner'

export default function App() {
  return (
    <ClerkProvider>
      <QueryProvider>
        <I18nProvider>
          <RouterProvider router={router} />
          <Toaster richColors />
        </I18nProvider>
      </QueryProvider>
    </ClerkProvider>
  )
}
