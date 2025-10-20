import { useEffect, useRef } from 'react';
import RingToneManager from '../utils/RingToneManager';

// Hook personalizado para usar o RingToneManager
export const useRingTone = (isRinging: boolean, isIncomingCall: boolean) => {
  const managerRef = useRef<RingToneManager | null>(null);
  const lastDeviceRef = useRef<string>('');

  useEffect(() => {
    // Cria uma única instância do manager
    if (!managerRef.current) {
      managerRef.current = new RingToneManager();
    }

    // Atualiza o dispositivo de toque quando mudar no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'phone_ring_device' && e.newValue && e.newValue !== lastDeviceRef.current) {
        console.log('Dispositivo de toque alterado:', e.newValue);
        lastDeviceRef.current = e.newValue;
        managerRef.current?.setRingDevice(e.newValue);
      }
    };

    // Adiciona listener para mudanças no localStorage
    window.addEventListener('storage', handleStorageChange);

    // Verifica mudanças no localStorage localmente
    const checkLocalStorage = () => {
      const savedRingDevice = localStorage.getItem('phone_ring_device');
      if (savedRingDevice && savedRingDevice !== lastDeviceRef.current) {
        console.log('Verificando dispositivo de toque:', savedRingDevice);
        lastDeviceRef.current = savedRingDevice;
        managerRef.current?.setRingDevice(savedRingDevice);
      }
    };

    // Verifica inicialmente
    checkLocalStorage();

    // Configura um intervalo para verificar mudanças no localStorage (a cada 5 segundos)
    const interval = setInterval(checkLocalStorage, 5000);

    // Inicia ou para o tom de chamada recebida
    if (isIncomingCall) {
      const savedRingDevice = localStorage.getItem('phone_ring_device');
      if (savedRingDevice) {
        console.log('Iniciando toque de chamada recebida');
        managerRef.current.startCallTone();
      } else {
        console.warn('Nenhum dispositivo de toque selecionado');
      }
    } else {
      console.log('Parando toque de chamada recebida');
      managerRef.current.stopCallTone();
    }

    // Cleanup ao desmontar
    return () => {
      if (managerRef.current) {
        managerRef.current.stopCallTone();
      }
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isIncomingCall]);
};