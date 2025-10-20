class MicrophoneManager {
  private mediaStream: MediaStream | null = null;
  private selectedMicDevice: string = '';
  private lastDeviceId: string = '';
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  constructor() {
    // Carregar dispositivo de microfone salvo
    const savedMicDevice = localStorage.getItem('microphone_device');
    if (savedMicDevice) {
      this.selectedMicDevice = savedMicDevice;
      this.lastDeviceId = savedMicDevice;
    }
  }

  public setMicDevice(deviceId: string) {
    // Só configura se o dispositivo for diferente do atual
    if (deviceId !== this.lastDeviceId) {
      console.log('Configurando novo dispositivo de microfone:', deviceId);
      this.selectedMicDevice = deviceId;
      this.lastDeviceId = deviceId;
      this.configureMicrophone();
    }
  }

  private async configureMicrophone() {
    try {
      // Limpar recursos anteriores
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
      }
      if (this.audioContext) {
        await this.audioContext.close();
      }

      // Criar novo stream de áudio
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: this.selectedMicDevice }
      });

      // Configurar contexto de áudio
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      console.log('Dispositivo de microfone configurado com sucesso:', this.selectedMicDevice);
    } catch (error) {
      console.error('Erro ao configurar dispositivo de microfone:', error);
    }
  }

  public getMicLevel(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    return average / 128; // Normalizar para 0-1
  }

  public getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  public cleanup() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export default MicrophoneManager; 