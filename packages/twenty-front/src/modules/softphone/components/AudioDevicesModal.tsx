import React, { useEffect, useState } from 'react';
import { Button } from 'twenty-ui/input';
import { ProgressBar } from 'twenty-ui/feedback';


import { InputLabel } from '@/ui/input/components/InputLabel';
import AudioDeviceSelect from './ui/AudioDeviceSelect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useMicrophone } from '../hooks/useMicrophone';
import styled from '@emotion/styled';

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
}

interface AudioDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AudioDevicesModal: React.FC<AudioDevicesModalProps> = ({ isOpen, onClose }) => {
  const { enqueueSnackBar } = useSnackBar();
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedRingDevice, setSelectedRingDevice] = useState<string>('');
  const [selectedCallDevice, setSelectedCallDevice] = useState<string>('');
  const [selectedMicDevice, setSelectedMicDevice] = useState<string>('');
  const { micLevel, setMicDevice } = useMicrophone();

  const loadDevices = async () => {
    try {
      console.log('Iniciando carregamento de dispositivos...');
      
      // Primeiro, solicitar permissão para acessar o microfone
      console.log('Solicitando permissão de áudio...');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Permissão de áudio concedida');
      
      // Depois, enumerar os dispositivos
      console.log('Enumerando dispositivos...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('Todos os dispositivos encontrados:', devices);
      
      const audioDevices = devices.filter(device => device.kind === 'audiooutput' || device.kind === 'audioinput');
      console.log('Dispositivos de áudio filtrados:', audioDevices);
      
      // Atualizar os dispositivos disponíveis
      setAudioDevices(audioDevices);
      console.log('Estado audioDevices atualizado:', audioDevices);

      // Tentar carregar do estado global do softphone primeiro
      const softphoneStateStr = localStorage.getItem('softphone_audio_devices');
      let savedDevices = {
        ringDevice: '',
        callDevice: '',
        micDevice: ''
      };

      if (softphoneStateStr) {
        try {
          savedDevices = JSON.parse(softphoneStateStr);
          console.log('Estado do softphone carregado:', savedDevices);
        } catch (error) {
          console.error('Erro ao carregar estado do softphone:', error);
        }
      }

      // Se não houver estado do softphone, tentar carregar dos itens individuais
      if (!savedDevices.ringDevice) {
        savedDevices.ringDevice = localStorage.getItem('disp_toque') || '';
        savedDevices.callDevice = localStorage.getItem('disp_chamada') || '';
        savedDevices.micDevice = localStorage.getItem('disp_microfone') || '';
        console.log('Dispositivos carregados do localStorage:', savedDevices);
      }

      // Verificar se os dispositivos salvos ainda estão disponíveis
      const validateDevice = (deviceId: string, devices: AudioDevice[]) => {
        if (!deviceId) return '';
        const isValid = devices.some(device => device.deviceId === deviceId);
        console.log(`Validação do dispositivo ${deviceId}:`, isValid);
        return isValid ? deviceId : '';
      };

      // Atualizar as seleções apenas se o modal estiver aberto
      if (isOpen) {
        const newRingDevice = validateDevice(savedDevices.ringDevice, audioDevices);
        const newCallDevice = validateDevice(savedDevices.callDevice, audioDevices);
        const newMicDevice = validateDevice(savedDevices.micDevice, audioDevices);
        
        console.log('Novas seleções:', { newRingDevice, newCallDevice, newMicDevice });
        
        setSelectedRingDevice(newRingDevice);
        setSelectedCallDevice(newCallDevice);
        setSelectedMicDevice(newMicDevice);
      }
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error);
    }
  };

  // Carregar dispositivos disponíveis quando o modal é aberto
  useEffect(() => {
    console.log('Modal aberto:', isOpen);
    if (isOpen) {
      console.log('Iniciando carregamento de dispositivos...');
      loadDevices().catch(error => {
        console.error('Erro ao carregar dispositivos:', error);
      });
    }
  }, [isOpen]);

  // Adicionar listener para mudanças nos dispositivos
  useEffect(() => {
    console.log('Configurando listener de mudanças de dispositivos...');
    if (isOpen) {
      const handleDeviceChange = () => {
        console.log('Mudança de dispositivos detectada');
        loadDevices().catch(error => {
          console.error('Erro ao carregar dispositivos após mudança:', error);
        });
      };

      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
      return () => {
        console.log('Removendo listener de mudanças de dispositivos');
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      };
    }
  }, [isOpen]);

  const testDevice = async (deviceId: string) => {
    try {
      // Criar um elemento de áudio
      const audio = new Audio();

      // Criar um contexto de áudio
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const mediaStreamDestination = audioContext.createMediaStreamDestination();

      // Configurar o som
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

      // Conectar os nós
      oscillator.connect(gainNode);
      gainNode.connect(mediaStreamDestination);

      // Configurar o stream de áudio
      audio.srcObject = mediaStreamDestination.stream;

      // Tentar configurar o dispositivo de saída
      try {
        if ('setSinkId' in audio) {
          await (audio as any).setSinkId(deviceId);
        } else if ('setSinkId' in audioContext.destination) {
          await (audioContext.destination as any).setSinkId(deviceId);
        } else {
          console.warn('setSinkId não está disponível neste navegador');
        }
      } catch (error) {
        console.warn('Não foi possível configurar o dispositivo de saída:', error);
      }

      // Iniciar o som
      oscillator.start();
      await audio.play();
      console.log('Reprodução iniciada com sucesso');

      // Parar após 2 segundos
      setTimeout(() => {
        oscillator.stop();
        audio.pause();
        audio.srcObject = null;
        audioContext.close();
      }, 2000);
    } catch (error) {
      console.error('Erro ao testar dispositivo:', error);
      enqueueSnackBar('Erro ao testar dispositivo de áudio', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const handleSave = async () => {
    try {
      console.log('Iniciando salvamento dos dispositivos...');
      console.log('Dispositivos selecionados:', {
        ringDevice: selectedRingDevice,
        callDevice: selectedCallDevice,
        micDevice: selectedMicDevice
      });
      
      // Verificar se os dispositivos selecionados são válidos
      if (!selectedRingDevice || !selectedCallDevice || !selectedMicDevice) {
        console.warn('Alguns dispositivos não foram selecionados');
        enqueueSnackBar('Por favor, selecione todos os dispositivos de áudio', {
          variant: SnackBarVariant.Warning,
        });
        return;
      }

      // Criar objeto com os dispositivos selecionados
      const devicesToSave = {
        ringDevice: selectedRingDevice,
        callDevice: selectedCallDevice,
        micDevice: selectedMicDevice
      };

      // Salvar no localStorage
      try {
        // Salvar individualmente
        localStorage.setItem('disp_toque', selectedRingDevice);
        localStorage.setItem('disp_chamada', selectedCallDevice);
        localStorage.setItem('disp_microfone', selectedMicDevice);
        
        // Salvar no estado global
        localStorage.setItem('softphone_audio_devices', JSON.stringify(devicesToSave));

        // Verificar se os dados foram salvos corretamente
        const savedRingDevice = localStorage.getItem('disp_toque');
        const savedCallDevice = localStorage.getItem('disp_chamada');
        const savedMicDevice = localStorage.getItem('disp_microfone');
        const savedSoftphoneState = localStorage.getItem('softphone_audio_devices');
        
        console.log('Verificação do salvamento:', {
          savedRingDevice,
          savedCallDevice,
          savedMicDevice,
          savedSoftphoneState
        });

        // Verificar se todos os valores foram salvos corretamente
        if (savedRingDevice === selectedRingDevice && 
            savedCallDevice === selectedCallDevice && 
            savedMicDevice === selectedMicDevice) {
          console.log('Dispositivos salvos com sucesso!');
          enqueueSnackBar('Dispositivos de áudio salvos com sucesso!', {
            variant: SnackBarVariant.Success,
          });
          // Fechar o modal imediatamente
          onClose();
        } else {
          throw new Error('Falha na verificação do salvamento');
        }
      } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao salvar dispositivos:', error);
      enqueueSnackBar('Erro ao salvar dispositivos de áudio', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const outputDevices = audioDevices.filter(device => device.kind === 'audiooutput');
  const inputDevices = audioDevices.filter(device => device.kind === 'audioinput');

  return (
    <div className="grid gap-4 py-4">
      <div className="flex justify-end mb-2" style={{ position: 'absolute', top: '0', right: '0', padding: '8px' }}>
        <button 
          onClick={() => {
            console.log('Botão de fechar clicado');
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            background: 'transparent',
            color: '#999',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '20px',
            margin: '0',
            lineHeight: '1',
            zIndex: 1000
          }}
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-2">
        <AudioDeviceSelect
          value={selectedRingDevice}
          onChange={(value) => {
            console.log('Dispositivo de toque selecionado:', value);
            setSelectedRingDevice(value);
          }}
          options={outputDevices}
          label="Dispositivo de Toque"
        />
        <button onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          testDevice(selectedRingDevice);
        }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px',
                background: '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
              }}>
          🔊 Testar
        </button>
      </div>

      <div className="flex items-center gap-2">
        <AudioDeviceSelect
          value={selectedCallDevice}
          onChange={(value) => {
            console.log('Dispositivo de chamada selecionado:', value);
            setSelectedCallDevice(value);
          }}
          options={outputDevices}
          label="Dispositivo de Chamada"
        />
        <button onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          testDevice(selectedCallDevice);
        }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px',
                background: '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
              }}>
          🔊 Testar
        </button>
      </div>

      <div className="flex items-center gap-2">
        <AudioDeviceSelect
          value={selectedMicDevice}
          onChange={(value) => {
            console.log('Dispositivo de microfone selecionado:', value);
            setSelectedMicDevice(value);
            setMicDevice(value);
          }}
          options={inputDevices}
          label="Dispositivo de Microfone"
        />
        <span style={{ color: 'red', display: 'block', marginTop: '4px', fontSize: '10px' }}>
          ⚠️ Necessário Selecionar o Microfone Antes de Iniciar a Chamada
        </span>
      </div>

      {selectedMicDevice && (
        <div className="mt-2">
          <InputLabel>Nível do Microfone:</InputLabel>
          <ProgressBar value={micLevel * 100} />
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSave();
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px',
            background: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          💾 Salvar
        </button>
      </div>
    </div>
  );
};

export default AudioDevicesModal; 