export * from './database'

// UI Component Props
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export interface FormState {
  isLoading: boolean
  error?: string
  success?: boolean
}
