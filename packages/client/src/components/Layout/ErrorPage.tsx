import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function ErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  let title = 'Something went wrong'
  let message = 'An unexpected error occurred.'
  let statusCode: number | null = null

  if (isRouteErrorResponse(error)) {
    statusCode = error.status
    title = `${error.status} ${error.statusText}`
    message = error.data?.message || message
  } else if (error instanceof Error) {
    message = error.message
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="max-w-md text-center text-muted-foreground">{message}</p>
      {statusCode && (
        <p className="text-sm text-muted-foreground">Status code: {statusCode}</p>
      )}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
        <Button onClick={() => navigate('/dashboard')}>
          <RefreshCw className="mr-2 h-4 w-4" /> Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
