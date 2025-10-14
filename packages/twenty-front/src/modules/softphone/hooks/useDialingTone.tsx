import { useEffect, useRef } from 'react';
import DialingToneManager from '../utils/DialingToneManager';

export const useDialingTone = (isRinging: boolean, isActiveCall: boolean) => {
  const managerRef = useRef<DialingToneManager | null>(null);

  useEffect(() => {
    // Cria uma única instância do manager
    if (!managerRef.current) {
      managerRef.current = new DialingToneManager();
    }

    // Atualiza o dispositivo de chamada quando mudar no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'disp_chamada' && e.newValue) {
        managerRef.current?.setCallDevice(e.newValue);
      }
    };

    // Adiciona listener para mudanças no localStorage
    window.addEventListener('storage', handleStorageChange);

    // Verifica mudanças no localStorage localmente
    const checkLocalStorage = () => {
      const savedCallDevice = localStorage.getItem('disp_chamada');
      if (savedCallDevice && managerRef.current) {
        managerRef.current.setCallDevice(savedCallDevice);
      }
    };

    // Verifica inicialmente
    checkLocalStorage();

    // Configura um intervalo para verificar mudanças no localStorage
    const interval = setInterval(checkLocalStorage, 1000);

    // Inicia ou para o tom de acordo com o estado
    if (isRinging && !isActiveCall) {
      managerRef.current.start();
    } else {
      managerRef.current.stop();
    }

    // Cleanup ao desmontar
    return () => {
      if (managerRef.current) {
        managerRef.current.stop();
      }
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isRinging, isActiveCall]);
}; 