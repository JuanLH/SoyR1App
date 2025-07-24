import React from 'react'
import Button from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info'
}) => {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmVariant: 'danger' as const,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        }
      case 'warning':
        return {
          icon: '⚠️',
          confirmVariant: 'primary' as const,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        }
      default:
        return {
          icon: 'ℹ️',
          confirmVariant: 'primary' as const,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center mr-3`}>
              <span className="text-xl">{styles.icon}</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
          
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="flex space-x-3 justify-end">
            <Button onClick={onCancel} variant="secondary">
              {cancelText}
            </Button>
            <Button onClick={onConfirm} variant={styles.confirmVariant}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog