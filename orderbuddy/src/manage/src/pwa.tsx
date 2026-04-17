import { useEffect, useState } from 'react'
import { IonAlert, IonButton } from '@ionic/react'

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event)
      setShowAlert(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = () => {
    if (deferredPrompt) {
      ;(deferredPrompt as any).prompt()
      ;(deferredPrompt as any).userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt')
        } else {
          console.log('User dismissed the install prompt')
        }
        setDeferredPrompt(null)
      })
    }
  }

  return (
    <>
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Install App"
        message="Do you want to install this Manage app?"
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => setShowAlert(false),
          },
          {
            text: 'Install',
            handler: handleInstallClick,
          },
        ]}
      />

      {/* <IonButton onClick={() => setShowAlert(true)}>Show Install Prompt</IonButton> */}
    </>
  )
}

export default PWAInstallPrompt
