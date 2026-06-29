import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="label">{label}</label>
      )}
      <input id={id} className={`input ${error ? 'border-danger' : ''} ${className}`} {...props} />
      {hint && !error && <p className="text-text-tertiary text-xs mt-1">{hint}</p>}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  children: React.ReactNode
}

export function Select({ label, error, hint, id, children, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="label">{label}</label>
      )}
      <select id={id} className={`input ${error ? 'border-danger' : ''} ${className}`} {...props}>
        {children}
      </select>
      {hint && !error && <p className="text-text-tertiary text-xs mt-1">{hint}</p>}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, id, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="label">{label}</label>
      )}
      <textarea id={id} className={`input resize-none ${error ? 'border-danger' : ''} ${className}`} {...props} />
      {hint && !error && <p className="text-text-tertiary text-xs mt-1">{hint}</p>}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  )
}
