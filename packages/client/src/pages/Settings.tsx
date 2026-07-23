import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Globe } from 'lucide-react'

export function Component() {
  const { t } = useTranslation()
  const language = useUiStore((s) => s.language)
  const setLanguage = useUiStore((s) => s.setLanguage)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.settings')}</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="size-5" /> {t('common.language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Interface Language</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            >
              {language === 'en' ? 'বাংলা' : 'English'}
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Current: {language === 'en' ? 'English' : 'Bengali'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
