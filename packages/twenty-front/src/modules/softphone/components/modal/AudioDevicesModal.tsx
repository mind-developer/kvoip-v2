/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { ProgressBar } from 'twenty-ui/feedback';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Modal, type ModalVariants } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useLingui } from '@lingui/react/macro';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { useMicrophone } from '../../hooks/useMicrophone';
import AudioDeviceSelect from '../ui/AudioDeviceSelect';

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
}

interface AudioDevicesModalProps {
  modalId: string;
  onClose?: () => void;
  modalVariant?: ModalVariants;
}

const StyledAudioDevicesModal = styled(Modal)`
  border-radius: ${({ theme }) => theme.spacing(1)};
  width: calc(500px - ${({ theme }) => theme.spacing(32)});
  height: auto;
`;

const StyledCenteredButton = styled(Button)`
  box-sizing: border-box;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledSection = styled(Section)`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledDeviceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledDeviceRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledMicLevelContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledWarningText = styled.span`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.xs};
  display: block;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const AudioDevicesModal: React.FC<AudioDevicesModalProps> = ({ 
  modalId, 
  onClose, 
  modalVariant = 'primary' 
}) => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { closeModal } = useModal();
  const { t } = useLingui();
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

      // Atualizar as seleções
      const newRingDevice = validateDevice(savedDevices.ringDevice, audioDevices);
      const newCallDevice = validateDevice(savedDevices.callDevice, audioDevices);
      const newMicDevice = validateDevice(savedDevices.micDevice, audioDevices);
      
      console.log('Novas seleções:', { newRingDevice, newCallDevice, newMicDevice });
      
      setSelectedRingDevice(newRingDevice);
      setSelectedCallDevice(newCallDevice);
      setSelectedMicDevice(newMicDevice);
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error);
    }
  };

  // Carregar dispositivos disponíveis quando o modal é montado
  useEffect(() => {
    console.log('Iniciando carregamento de dispositivos...');
    loadDevices().catch(error => {
      console.error('Erro ao carregar dispositivos:', error);
    });
  }, []);

  // Adicionar listener para mudanças nos dispositivos
  useEffect(() => {
    console.log('Configurando listener de mudanças de dispositivos...');
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
  }, []);

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
      enqueueErrorSnackBar({
        message: 'Erro ao testar dispositivo de áudio',
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
        enqueueErrorSnackBar({
          message: 'Por favor, selecione todos os dispositivos de áudio',
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
          enqueueSuccessSnackBar({
            message: 'Dispositivos de áudio salvos com sucesso!',
          });
          // Fechar o modal imediatamente
          closeModal(modalId);
        } else {
          throw new Error('Falha na verificação do salvamento');
        }
      } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao salvar dispositivos:', error);
      enqueueErrorSnackBar({
        message: 'Erro ao salvar dispositivos de áudio',
      });
    }
  };

  const outputDevices = audioDevices.filter(device => device.kind === 'audiooutput');
  const inputDevices = audioDevices.filter(device => device.kind === 'audioinput');

  const handleCancelClick = () => {
    closeModal(modalId);
    onClose?.();
  };

  const handleSaveClick = () => {
    handleSave();
  };

  return (
    <StyledAudioDevicesModal
      modalId={modalId}
      onClose={() => {
        onClose?.();
      }}
      isClosable={true}
      padding="large"
      modalVariant={modalVariant}
    >
      <StyledCenteredTitle>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <H1Title title="Configurações de Áudio" fontColor={H1TitleFontColor.Primary} />
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCancelClick();
            }}
            variant="tertiary"
            title="✕"
          />
        </div>
      </StyledCenteredTitle>
      
      <StyledSection
        alignment={SectionAlignment.Center}
        fontColor={SectionFontColor.Primary}
      >
        <StyledDeviceContainer
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <StyledDeviceRow
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <AudioDeviceSelect
              value={selectedRingDevice}
              onChange={(value) => {
                console.log('Dispositivo de toque selecionado:', value);
                setSelectedRingDevice(value);
              }}
              options={outputDevices}
              label="Dispositivo de Toque"
            />
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                testDevice(selectedRingDevice);
              }}
              variant="secondary"
              title="🔊 Testar"
            />
          </StyledDeviceRow>

          <StyledDeviceRow
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <AudioDeviceSelect
              value={selectedCallDevice}
              onChange={(value) => {
                console.log('Dispositivo de chamada selecionado:', value);
                setSelectedCallDevice(value);
              }}
              options={outputDevices}
              label="Dispositivo de Chamada"
            />
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                testDevice(selectedCallDevice);
              }}
              variant="secondary"
              title="🔊 Testar"
            />
          </StyledDeviceRow>

          <div
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
          >
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
            <StyledWarningText>
              ⚠️ Necessário Selecionar o Microfone Antes de Iniciar a Chamada
            </StyledWarningText>
          </div>

          {selectedMicDevice && (
            <StyledMicLevelContainer
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <InputLabel>Nível do Microfone:</InputLabel>
              <ProgressBar value={micLevel * 100} />
            </StyledMicLevelContainer>
          )}
        </StyledDeviceContainer>
      </StyledSection>

      <StyledCenteredButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCancelClick();
        }}
        variant="secondary"
        title={t`Cancel`}
        fullWidth
      />

      <StyledCenteredButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSaveClick();
        }}
        variant="primary"
        title="💾 Salvar"
        fullWidth
      />
    </StyledAudioDevicesModal>
  );
};

export default AudioDevicesModal; 