import { useEffect, useRef } from 'react';
import CallAudioManager from '../utils/CallAudioManager';

export const useCallAudio = (audioElement: HTMLAudioElement | null) => {
  const managerRef = useRef<CallAudioManager | null>(null);

  useEffect(() => {
    // Cria uma única instância do manager
    if (!managerRef.current) {
      managerRef.current = new CallAudioManager();
    }

    // Atualiza o dispositivo de chamada quando mudar no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'calling_device' && e.newValue) {
        managerRef.current?.setCallDevice(e.newValue);
      }
    };

    // Adiciona listener para mudanças no localStorage
    window.addEventListener('storage', handleStorageChange);

    // Verifica mudanças no localStorage localmente
    const checkLocalStorage = () => {
      const savedCallDevice = localStorage.getItem('calling_device');
      if (savedCallDevice && managerRef.current) {
        managerRef.current.setCallDevice(savedCallDevice);
      }
    };

    // Verifica inicialmente
    checkLocalStorage();

    // Configura um intervalo para verificar mudanças no localStorage
    const interval = setInterval(checkLocalStorage, 1000);

    // Configura o elemento de áudio quando disponível
    if (audioElement && managerRef.current) {
      managerRef.current.setAudioElement(audioElement);
    }

    // Cleanup ao desmontar
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [audioElement]);
}; 