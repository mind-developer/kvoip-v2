/* @kvoip-woulz proprietary */
import React, { useCallback, useEffect } from 'react';
import { TELEPHONY_AUDIO_CONFIG } from '../../constants';
import { useAudioDevices } from '../../hooks/useAudioDevices';
import { CallState } from '../../types/callState';
import { CallStatus } from '../../types/callStatusEnum';

interface AudioManagerProps {
  callState: CallState;
  remoteAudioRef: React.RefObject<HTMLAudioElement>;
}

export const AudioManager: React.FC<AudioManagerProps> = ({
  callState,
  remoteAudioRef
}) => {
  const audioDevices = useAudioDevices();

  // Função para configurar o dispositivo de áudio
  const setAudioDevice = useCallback(async (audioElement: HTMLAudioElement, deviceId: string) => {
    if ('setSinkId' in audioElement) {
      try {
        await (audioElement as any).setSinkId(deviceId);
        console.log('Dispositivo de áudio configurado com sucesso:', deviceId);
      } catch (error) {
        console.error('Erro ao configurar dispositivo de áudio:', error);
      }
    }
  }, []);

  // Função para tocar o som de chamada
  const playRingtone = useCallback(async () => {
    try {
      // Parar qualquer toque anterior
      if (audioDevices.ringAudioRef.current) {
        audioDevices.ringAudioRef.current.pause();
        audioDevices.ringAudioRef.current.currentTime = 0;
      }

      // Criar novo elemento de áudio
      const audio = new Audio(TELEPHONY_AUDIO_CONFIG.RINGTONE_URL);
      audioDevices.ringAudioRef.current = audio;

      // Configurar o dispositivo de toque
      if (audioDevices.selectedRingDevice) {
        await setAudioDevice(audio, audioDevices.selectedRingDevice);
      }

      // Reproduzir o toque
      await audio.play();
      console.log('Toque iniciado com sucesso');
    } catch (error) {
      console.error('Erro ao tocar o som de chamada:', error);
    }
  }, [audioDevices, setAudioDevice]);

  // Função para parar o toque
  const stopRingtone = useCallback(() => {
    console.log('AudioManager: stopRingtone chamado');
    if (audioDevices.ringAudioRef.current) {
      console.log('AudioManager: parando ringtone...');
      audioDevices.ringAudioRef.current.pause();
      audioDevices.ringAudioRef.current.currentTime = 0;
      audioDevices.ringAudioRef.current = null;
      console.log('AudioManager: ringtone parado');
    } else {
      console.log('AudioManager: nenhum ringtone para parar');
    }
  }, [audioDevices]);

  // Função para configurar o áudio da chamada
  const setupCallAudio = useCallback(async () => {
    try {
      // Parar o toque
      stopRingtone();

      // Configurar o dispositivo de chamada
      if (remoteAudioRef.current && audioDevices.selectedCallDevice) {
        await setAudioDevice(remoteAudioRef.current, audioDevices.selectedCallDevice);
      }
    } catch (error) {
      console.error('Erro ao configurar áudio da chamada:', error);
    }
  }, [audioDevices, remoteAudioRef, setAudioDevice, stopRingtone]);

  // Atualizar o estado da chamada
  useEffect(() => {
    console.log('AudioManager: callStatus mudou para:', callState.callStatus);
    if (callState.callStatus === CallStatus.INCOMING_CALL) {
      console.log('AudioManager: iniciando ringtone');
      playRingtone();
    } else if (callState.callStatus === CallStatus.CONNECTED) {
      console.log('AudioManager: configurando áudio da chamada');
      setupCallAudio();
    } else if (callState.callStatus === CallStatus.NONE) {
      console.log('AudioManager: parando ringtone (status NONE)');
      stopRingtone();
    }
  }, [callState.callStatus, playRingtone, setupCallAudio, stopRingtone]);

  return (
    <>
      <audio ref={remoteAudioRef} autoPlay />
      <audio ref={audioDevices.ringAudioRef} />
      <audio ref={audioDevices.holdAudioRef} />
    </>
  );
};
