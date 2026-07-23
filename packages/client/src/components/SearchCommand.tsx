import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function SearchCommand() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-64 justify-between text-muted-foreground"
      onClick={() => navigate('/search')}
    >
      <div className="flex items-center gap-2">
        <Search className="size-4" />
        <span>{t('common.search')}</span>
      </div>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}
