class CallAudioManager {
  private audioElement: HTMLAudioElement | null = null;
  private selectedCallDevice: string = '';

  constructor() {
    // Carregar dispositivo de chamada salvo
    const savedCallDevice = localStorage.getItem('disp_chamada');
    if (savedCallDevice) {
      this.selectedCallDevice = savedCallDevice;
    }
  }

  public setCallDevice(deviceId: string) {
    this.selectedCallDevice = deviceId;
    if (this.audioElement) {
      this.configureAudioDevice();
    }
  }

  private async configureAudioDevice() {
    if (this.selectedCallDevice && this.audioElement && 'setSinkId' in this.audioElement) {
      try {
        await (this.audioElement as any).setSinkId(this.selectedCallDevice);
        //console.log('Dispositivo de chamada configurado:', this.selectedCallDevice);
      } catch (error) {
        console.error('Erro ao configurar dispositivo de chamada:', error);
      }
    }
  }

  public setAudioElement(element: HTMLAudioElement) {
    this.audioElement = element;
    this.configureAudioDevice();
  }
}

export default CallAudioManager; 