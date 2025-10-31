class ActiveCallRingManager {
  private audio: HTMLAudioElement;
  private interval: ReturnType<typeof setTimeout> | null = null;
  private isPlaying = false;
  private selectedCallDevice: string = '';

  constructor() {
    this.audio = new Audio('https://kvoip.com.br/ring.mp3');
    this.audio.load();
    
    // Carregar dispositivo de chamada salvo
    const savedCallDevice = localStorage.getItem('calling_device');
    if (savedCallDevice) {
      this.selectedCallDevice = savedCallDevice;
      this.configureAudioDevice();
    }
  }

  public setCallDevice(deviceId: string) {
    this.selectedCallDevice = deviceId;
    this.configureAudioDevice();
  }

  private async configureAudioDevice() {
    if (this.selectedCallDevice && 'setSinkId' in this.audio) {
      try {
        await (this.audio as any).setSinkId(this.selectedCallDevice);
        //console.log('Dispositivo de chamada configurado:', this.selectedCallDevice);
      } catch (error) {
        console.error('Erro ao configurar dispositivo de chamada:', error);
      }
    }
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    const playSequence = () => {
      this.audio.currentTime = 0;
      this.audio.play().catch(console.error);
      
      setTimeout(() => {
        this.audio.pause();
      }, 2000);
    };

    // Primeira execução imediata
    playSequence();

    // Configura o intervalo para repetir o padrão a cada 3 segundos (2s tocando + 1s pausa)
    this.interval = setInterval(playSequence, 3000);
  }

  stop() {
    if (!this.isPlaying) return;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
  }
}

export default ActiveCallRingManager; 