/* @kvoip-woulz proprietary */
import { useEffect, useRef, useState } from 'react';

export const useAudioDevices = () => {
  const [selectedRingDevice, setSelectedRingDevice] = useState<string>('');
  const [selectedCallDevice, setSelectedCallDevice] = useState<string>('');
  const [selectedMicDevice, setSelectedMicDevice] = useState<string>('');
  
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);
  const callAudioRef = useRef<HTMLAudioElement | null>(null);
  const holdAudioRef = useRef<HTMLAudioElement>(
    new Audio('https://kvoip.com.br/musicadeespera.mp3'),
  );

  // Carregar dispositivos salvos
  useEffect(() => {
    const loadAudioDevices = () => {
      const savedRingDevice = localStorage.getItem('disp_toque');
      const savedCallDevice = localStorage.getItem('disp_chamada');
      const savedMicDevice = localStorage.getItem('disp_microfone');
      
      if (savedRingDevice) setSelectedRingDevice(savedRingDevice);
      if (savedCallDevice) setSelectedCallDevice(savedCallDevice);
      if (savedMicDevice) setSelectedMicDevice(savedMicDevice);
    };

    loadAudioDevices();
  }, []);

  // Carregar o áudio de espera
  useEffect(() => {
    if (holdAudioRef.current) {
      holdAudioRef.current.load();
    }
  }, []);

  return {
    selectedRingDevice,
    setSelectedRingDevice,
    selectedCallDevice,
    setSelectedCallDevice,
    selectedMicDevice,
    setSelectedMicDevice,
    ringAudioRef,
    callAudioRef,
    holdAudioRef,
  };
};
