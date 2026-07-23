import { useState } from 'react'
import { useSearch } from '@/hooks/useSearch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search as SearchIcon } from 'lucide-react'

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
        <Button onClick={handleSearch} disabled={search.isPending}>
          <SearchIcon className="mr-2 size-4" /> Search
        </Button>
      </div>

      {search.data && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{search.data.result}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
