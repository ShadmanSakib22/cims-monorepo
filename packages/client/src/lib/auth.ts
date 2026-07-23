const inputClass =
  'border-b-2 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent px-0 py-1.5 h-auto text-sm shadow-none focus-visible:ring-0 focus-visible:border-primary dark:border-gray-600 dark:text-foreground dark:focus-visible:border-primary'

const labelClass =
  'text-xs font-medium text-foreground mb-0.5'

const buttonClass =
  'w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 h-9 text-sm font-medium'

const elements = {
  // header: 'hidden',
  // headerTitle: 'hidden',
  // headerSubtitle: 'hidden',
  socialButtons: 'gap-2',
  socialButtonsBlockButton:
    'border border-border dark:border-gray-600 rounded-lg h-9 text-sm font-medium text-foreground hover:bg-muted dark:hover:bg-gray-800',
  dividerLine: 'border-gray-200 dark:border-gray-700',
  dividerText: 'text-muted-foreground text-xs',
  formFieldRow: 'mb-3',
  formFieldLabel: labelClass,
  formFieldInput: inputClass,
  formFieldHintText: 'text-xs text-muted-foreground',
  formFieldError: 'text-xs text-destructive',
  formButtonPrimary: buttonClass,
  footer: 'mt-4',
  footerAction: 'text-sm text-muted-foreground',
  footerActionLink: 'text-primary font-medium hover:underline',
  identityPreview: 'border border-border dark:border-gray-600 rounded-lg p-3',
  identityPreviewText: 'text-sm text-foreground',
  identityPreviewEditButton: 'text-primary text-sm font-medium hover:underline',
  phoneInputBox: 'border-b-2 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent',
  phoneInput: inputClass,
  countrySelector:
    'border-b-2 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent text-foreground',
}

const variables = {
  colorPrimary: '#0d9488',
  colorTextOnPrimaryBackground: '#ffffff',
}

export const signInAppearance = { elements, variables }
export const signUpAppearance = { elements, variables }
