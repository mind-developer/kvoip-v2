import { useCallback, useEffect, useRef, useState } from 'react';
import MicrophoneManager from '../utils/MicrophoneManager';

type UseMicrophoneReturn = {
  micLevel: number;
  getMediaStream: () => MediaStream | null;
  setMicDevice: (deviceId: string) => void;
};

export const useMicrophone = (): UseMicrophoneReturn => {
  const managerRef = useRef<MicrophoneManager | null>(null);
  const lastDeviceRef = useRef<string>('');
  const [micLevel, setMicLevel] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const getMediaStream = useCallback<UseMicrophoneReturn['getMediaStream']>(() => {
    return managerRef.current?.getMediaStream() ?? null;
  }, []);

  const setMicDevice = useCallback<UseMicrophoneReturn['setMicDevice']>((deviceId) => {
    managerRef.current?.setMicDevice(deviceId);
  }, []);

  useEffect(() => {
    // Cria uma única instância do manager
    if (!managerRef.current) {
      managerRef.current = new MicrophoneManager();
    }

    // Atualiza o dispositivo de microfone quando mudar no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'microphone_device' && e.newValue && e.newValue !== lastDeviceRef.current) {
        console.log('Dispositivo de microfone alterado:', e.newValue);
        lastDeviceRef.current = e.newValue;
        managerRef.current?.setMicDevice(e.newValue);
      }
    };

    // Adiciona listener para mudanças no localStorage
    window.addEventListener('storage', handleStorageChange);

    // Verifica mudanças no localStorage localmente
    const checkLocalStorage = () => {
      const savedMicDevice = localStorage.getItem('microphone_device');
      if (savedMicDevice && savedMicDevice !== lastDeviceRef.current) {
        console.log('Verificando dispositivo de microfone:', savedMicDevice);
        lastDeviceRef.current = savedMicDevice;
        managerRef.current?.setMicDevice(savedMicDevice);
      }
    };

    // Verifica inicialmente
    checkLocalStorage();

    // Configura um intervalo para verificar mudanças no localStorage (a cada 5 segundos)
    const interval = setInterval(checkLocalStorage, 5000);

    // Função para atualizar o nível do microfone
    const updateMicLevel = () => {
      if (managerRef.current) {
        const level = managerRef.current.getMicLevel();
        setMicLevel(level);
      }
      animationFrameRef.current = requestAnimationFrame(updateMicLevel);
    };

    // Inicia a atualização do nível do microfone
    updateMicLevel();

    // Cleanup ao desmontar
    return () => {
      if (managerRef.current) {
        managerRef.current.cleanup();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return {
    micLevel,
    getMediaStream,
    setMicDevice
  };
}; 