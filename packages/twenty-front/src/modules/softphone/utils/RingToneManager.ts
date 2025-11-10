class RingToneManager {
  private callAudio: HTMLAudioElement;
  private interval: ReturnType<typeof setTimeout> | null = null;
  private isPlaying = false;
  private selectedRingDevice: string = '';
  private lastDeviceId: string = '';

  constructor() {
    this.callAudio = new Audio('https://kvoip.com.br/toquedechamada.mp3');
    this.callAudio.load();

    // Carregar dispositivo de toque salvo
    const savedRingDevice = localStorage.getItem('phone_ring_device');
    if (savedRingDevice) {
      this.selectedRingDevice = savedRingDevice;
      this.lastDeviceId = savedRingDevice;
      this.configureAudioDevice();
    }
  }

  public setRingDevice(deviceId: string) {
    // Só configura se o dispositivo for diferente do atual
    if (deviceId !== this.lastDeviceId) {
      console.log('Configurando novo dispositivo de toque:', deviceId);
      this.selectedRingDevice = deviceId;
      this.lastDeviceId = deviceId;
      this.configureAudioDevice();
    }
  }

  private async configureAudioDevice() {
    if (this.selectedRingDevice && 'setSinkId' in this.callAudio) {
      try {
        await (this.callAudio as any).setSinkId(this.selectedRingDevice);
        console.log(
          'Dispositivo de toque configurado com sucesso:',
          this.selectedRingDevice,
        );
      } catch (error) {
        console.error('Erro ao configurar dispositivo de toque:', error);
      }
    }
  }

  startCallTone() {
    if (this.isPlaying) {
      console.log('Toque já está tocando');
      return;
    }

    console.log(
      'Iniciando toque de chamada no dispositivo:',
      this.selectedRingDevice,
    );
    if (!this.selectedRingDevice) {
      console.warn('Nenhum dispositivo de toque selecionado');
      return;
    }

    this.isPlaying = true;
    this.callAudio.currentTime = 0;
    this.callAudio.play().catch((error) => {
      console.error('Erro ao tocar o toque de chamada:', error);
      this.isPlaying = false;
    });
  }

  stopCallTone() {
    if (!this.isPlaying) {
      console.log('Toque já está parado');
      return;
    }

    console.log('Parando toque de chamada');
    this.callAudio.pause();
    this.callAudio.currentTime = 0;
    this.isPlaying = false;
  }
}

export default RingToneManager;
