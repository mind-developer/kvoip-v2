/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { ProgressBar } from 'twenty-ui/feedback';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Select } from '@/ui/input/components/Select';
import { Modal, type ModalVariants } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useLingui } from '@lingui/react/macro';
import { IconMicrophone, IconPhoneIncoming } from '@tabler/icons-react';
import {
  H1Title, H1TitleFontColor, IconCheck, IconHeadphones,
  IconPlayerPlay,
  IconSettings,
  IconX
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useMicrophone } from '../../hooks/useMicrophone';

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
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  
  svg {
    transform: translateY(-8px);
  }
`;

const StyledDeviceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledDeviceGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDeviceRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDeviceLabel = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledMicLevelContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
`;

const StyledWarningContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.background.transparent.danger};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.danger};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledWarningText = styled.span`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  justify-content: flex-end;
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
  
  // Estados para os valores originais (salvos)
  const [originalRingDevice, setOriginalRingDevice] = useState<string>('');
  const [originalCallDevice, setOriginalCallDevice] = useState<string>('');
  const [originalMicDevice, setOriginalMicDevice] = useState<string>('');
  
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
      
      // Definir valores atuais e originais
      setSelectedRingDevice(newRingDevice);
      setSelectedCallDevice(newCallDevice);
      setSelectedMicDevice(newMicDevice);
      
      // Salvar os valores originais (que estão salvos no localStorage)
      setOriginalRingDevice(newRingDevice);
      setOriginalCallDevice(newCallDevice);
      setOriginalMicDevice(newMicDevice);
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
      console.log('Iniciando teste do dispositivo:', deviceId);
      
      // Verificar se o contexto de áudio está suspenso
      const audioContext = new AudioContext();
      if (audioContext.state === 'suspended') {
        console.log('Contexto de áudio suspenso, tentando retomar...');
        await audioContext.resume();
      }
      
      console.log('Estado do contexto de áudio:', audioContext.state);

      // Criar um elemento de áudio
      const audio = new Audio();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const mediaStreamDestination = audioContext.createMediaStreamDestination();

      // Configurar o som
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Volume mais baixo

      // Conectar os nós
      oscillator.connect(gainNode);
      gainNode.connect(mediaStreamDestination);

      // Configurar o stream de áudio
      audio.srcObject = mediaStreamDestination.stream;
      audio.volume = 0.5; // Volume do elemento de áudio

      // Tentar configurar o dispositivo de saída
      try {
        if ('setSinkId' in audio) {
          console.log('Configurando dispositivo de saída via audio.setSinkId');
          await (audio as any).setSinkId(deviceId);
        } else if ('setSinkId' in audioContext.destination) {
          console.log('Configurando dispositivo de saída via audioContext.destination.setSinkId');
          await (audioContext.destination as any).setSinkId(deviceId);
        } else {
          console.warn('setSinkId não está disponível neste navegador');
        }
      } catch (error) {
        console.warn('Não foi possível configurar o dispositivo de saída:', error);
      }

      // Iniciar o som
      oscillator.start();
      console.log('Oscilador iniciado');
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        console.log('Reprodução iniciada com sucesso');
      }

      // Parar após 2 segundos
      setTimeout(() => {
        console.log('Parando teste de áudio');
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
          
          // Atualizar os valores originais para os novos valores salvos
          setOriginalRingDevice(selectedRingDevice);
          setOriginalCallDevice(selectedCallDevice);
          setOriginalMicDevice(selectedMicDevice);
          
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
  
  // Verificar se os dispositivos foram carregados
  const devicesLoaded = audioDevices.length > 0;
  
  // Verificar se há mudanças não salvas
  const hasUnsavedChanges = 
    selectedRingDevice !== originalRingDevice ||
    selectedCallDevice !== originalCallDevice ||
    selectedMicDevice !== originalMicDevice;

  const handleCancelClick = () => {
    // Reverter os valores para os originais (salvos)
    setSelectedRingDevice(originalRingDevice);
    setSelectedCallDevice(originalCallDevice);
    setSelectedMicDevice(originalMicDevice);
    
    // Restaurar o microfone para o valor original
    if (originalMicDevice) {
      setMicDevice(originalMicDevice);
    }
    
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
      size="medium"
      shouldCloseModalOnClickOutsideOrEscape={false}
    >
      <StyledContainer>
        <StyledHeader>
          <StyledTitle>
            <IconSettings size={24} />
            <H1Title 
              title={t`Softphone Audio Settings`} 
              fontColor={H1TitleFontColor.Primary} 
            />
          </StyledTitle>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCancelClick();
            }}
            variant="tertiary"
            Icon={IconX}
            size="medium"
          />
        </StyledHeader>

        <StyledDeviceSection>
          {!devicesLoaded ? (
            <StyledWarningContainer>
              <StyledWarningText>
                <IconSettings size={16} />
                {t`Loading audio devices...`}
              </StyledWarningText>
            </StyledWarningContainer>
          ) : (
            <>
              {/* Dispositivo de Toque */}
              <StyledDeviceGroup>
                <StyledDeviceLabel>
                  <IconPhoneIncoming size={16} />
                  <InputLabel>{t`Touch Device`}</InputLabel>
                </StyledDeviceLabel>
                <StyledDeviceRow>
                  <Select
                    dropdownId="ring-device-select"
                    value={selectedRingDevice}
                    onChange={(value) => {
                      console.log('Dispositivo de toque selecionado:', value);
                      setSelectedRingDevice(value);
                    }}
                    options={outputDevices.map(device => ({
                      label: device.label,
                      value: device.deviceId,
                    }))}
                    fullWidth
                    dropdownWidthAuto
                    disabled={!devicesLoaded || outputDevices.length === 0}
                  />
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      testDevice(selectedRingDevice);
                    }}
                    variant="secondary"
                    Icon={IconPlayerPlay}
                    title={t`Test`}
                    disabled={!devicesLoaded || !selectedRingDevice}
                  />
                </StyledDeviceRow>
              </StyledDeviceGroup>

              {/* Dispositivo de Chamada */}
              <StyledDeviceGroup>
                <StyledDeviceLabel>
                  <IconHeadphones size={16} />
                  <InputLabel>{t`Call Device`}</InputLabel>
                </StyledDeviceLabel>
                <StyledDeviceRow>
                  <Select
                    dropdownId="call-device-select"
                    value={selectedCallDevice}
                    onChange={(value) => {
                      console.log('Dispositivo de chamada selecionado:', value);
                      setSelectedCallDevice(value);
                    }}
                    options={outputDevices.map(device => ({
                      label: device.label,
                      value: device.deviceId,
                    }))}
                    fullWidth
                    dropdownWidthAuto
                    disabled={!devicesLoaded || outputDevices.length === 0}
                  />
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      testDevice(selectedCallDevice);
                    }}
                    variant="secondary"
                    Icon={IconPlayerPlay}
                    title={t`Test`}
                    disabled={!devicesLoaded || !selectedCallDevice}
                  />
                </StyledDeviceRow>
              </StyledDeviceGroup>

              {/* Dispositivo de Microfone */}
              <StyledDeviceGroup>
                <StyledDeviceLabel>
                  <IconMicrophone size={16} />
                  <InputLabel>{t`Microphone Device`}</InputLabel>
                </StyledDeviceLabel>
                <StyledDeviceRow>
                  <Select
                    dropdownId="mic-device-select"
                    value={selectedMicDevice}
                    onChange={(value) => {
                      console.log('Dispositivo de microfone selecionado:', value);
                      setSelectedMicDevice(value);
                      setMicDevice(value);
                    }}
                    options={inputDevices.map(device => ({
                      label: device.label,
                      value: device.deviceId,
                    }))}
                    fullWidth
                    dropdownWidthAuto
                    disabled={!devicesLoaded || inputDevices.length === 0}
                  />
                </StyledDeviceRow>
            
                {selectedMicDevice && (
                  <StyledMicLevelContainer>
                    <InputLabel>{t`Microphone Level`}</InputLabel>
                    <ProgressBar value={micLevel * 100} />
                  </StyledMicLevelContainer>
                )}

                <StyledWarningContainer>
                  <StyledWarningText>
                    <IconSettings size={16} />
                    {t`You must select the microphone before starting the call`}
                  </StyledWarningText>
                </StyledWarningContainer>
              </StyledDeviceGroup>
            </>
          )}
        </StyledDeviceSection>

        <StyledButtonContainer>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCancelClick();
            }}
            variant="secondary"
            title={t`Cancel`}
          />
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSaveClick();
            }}
            Icon={IconCheck}
            variant="primary"
            accent="blue"
            title={hasUnsavedChanges ? t`Save Settings` : t`No changes`}
            disabled={!hasUnsavedChanges}
          />
        </StyledButtonContainer>
      </StyledContainer>
    </StyledAudioDevicesModal>
  );
};

export default AudioDevicesModal; 