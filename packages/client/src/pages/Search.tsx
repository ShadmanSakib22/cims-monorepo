import { useState } from 'react'
import { useSearch } from '@/hooks/useSearch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search as SearchIcon, Loader2 } from 'lucide-react'

export function Component() {
  const [query, setQuery] = useState('')
  const search = useSearch()

  const handleSearch = () => {
    if (query.trim()) search.mutate(query)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground">Search across patients, doctors, and records</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search using natural language..."
          className="max-w-xl"
        />
        <Button onClick={handleSearch} disabled={search.isPending || !query.trim()}>
          {search.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <SearchIcon className="mr-2 size-4" />
          )}
          Search
        </Button>
      </div>

      {search.data?.error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{search.data.error}</p>
          </CardContent>
        </Card>
      )}

      {search.data?.explanation && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{search.data.explanation}</p>

            {search.data.query && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{search.data.query.entity}</Badge>
                {search.data.query.filters && Object.keys(search.data.query.filters).length > 0 && (
                  <span>
                    Filters: {Object.entries(search.data.query.filters).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ')}
                  </span>
                )}
              </div>
            )}

            {search.data.results && search.data.results.length > 0 ? (
              <div className="space-y-2">
                {search.data.results.map((item: any, i: number) => (
                  <div key={item.id || i} className="rounded-md border p-3 text-sm">
                    {Object.entries(item).map(([key, val]) => {
                      if (key === 'user' && typeof val === 'object') {
                        return <p key={key}><span className="font-medium">{key}:</span> {(val as any).name}</p>
                      }
                      if (key === 'patient' && typeof val === 'object') {
                        return <p key={key}><span className="font-medium">patient:</span> {(val as any).user?.name}</p>
                      }
                      if (key === 'doctor' && typeof val === 'object') {
                        return <p key={key}><span className="font-medium">doctor:</span> {(val as any).user?.name}</p>
                      }
                      if (typeof val === 'object' || typeof val === 'boolean') return null
                      return <p key={key}><span className="font-medium">{key}:</span> {String(val)}</p>
                    })}
                  </div>
                ))}
              </div>
            ) : search.data.results && (
              <p className="text-sm text-muted-foreground">No matching records found.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
