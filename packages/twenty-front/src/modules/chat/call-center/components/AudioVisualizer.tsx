import { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';

type AudioVisualizerProps = {
  stream: MediaStream | null;
  isRecording: boolean;
  width?: number;
  height?: number;
  barWidth?: number;
  barSpacing?: number;
  maxBarHeight?: number;
  color?: string;
  barCount?: number;
  smoothingFactor?: number;
  scrollSpeed?: number;
};

const Canvas = styled.canvas<{ width: number; height: number }>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
`;

export const AudioVisualizer = ({
  stream,
  isRecording,
  width = 200,
  height = 40,
  barWidth = 2,
  barSpacing = 1,
  maxBarHeight = 30,
  color = '#ffffff',
  barCount = 50,
  smoothingFactor = 0.3,
  scrollSpeed = 1,
}: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const dataArrayRef = useRef<Float32Array>();
  const sourceRef = useRef<MediaStreamAudioSourceNode>();
  const previousAmplitudesRef = useRef<number[]>([]);
  const waveformHistoryRef = useRef<number[][]>([]);
  const frameCounterRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (!canvas || !analyser || !dataArray || !isRecording) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    // Obter dados de áudio
    analyser.getFloatTimeDomainData(dataArray);

    // Calcular RMS (Root Mean Square) para cada segmento
    const segmentSize = Math.floor(dataArray.length / barCount);
    const currentAmplitudes: number[] = [];

    for (let i = 0; i < barCount; i++) {
      let sum = 0;
      const start = i * segmentSize;
      const end = Math.min(start + segmentSize, dataArray.length);

      for (let j = start; j < end; j++) {
        sum += dataArray[j] ** 2;
      }

      const rms = Math.sqrt(sum / (end - start));
      currentAmplitudes.push(rms);
    }

    // Suavizar as amplitudes com interpolação
    const smoothedAmplitudes = currentAmplitudes.map((current, index) => {
      const previous = previousAmplitudesRef.current[index] || 0;
      return previous + (current - previous) * smoothingFactor;
    });

    // Atualizar amplitudes anteriores para próxima frame
    previousAmplitudesRef.current = smoothedAmplitudes;

    // Adicionar nova coluna ao histórico baseado na velocidade do scroll
    frameCounterRef.current++;
    if (frameCounterRef.current >= scrollSpeed) {
      waveformHistoryRef.current.push([...smoothedAmplitudes]);
      frameCounterRef.current = 0;
    }

    // Se não há histórico suficiente, preencher com dados atuais
    while (waveformHistoryRef.current.length < barCount) {
      waveformHistoryRef.current.push([...smoothedAmplitudes]);
    }

    // Manter apenas o histórico baseado no barCount
    if (waveformHistoryRef.current.length > barCount) {
      waveformHistoryRef.current.shift();
    }

    // Calcular largura ajustada das barras para caber no barCount
    const totalSpacing = (barCount - 1) * barSpacing;
    const availableWidth = width - totalSpacing;
    const adjustedBarWidth = Math.max(1, availableWidth / barCount);

    // Desenhar histórico da waveform (scroll da direita para esquerda)
    ctx.fillStyle = color;
    waveformHistoryRef.current.forEach((amplitudes, historyIndex) => {
      const x = historyIndex * (adjustedBarWidth + barSpacing);

      // Usar a amplitude média de todas as barras para criar uma coluna única
      const averageAmplitude =
        amplitudes.reduce((sum, amp) => sum + amp, 0) / amplitudes.length;
      const barHeight =
        Math.min(averageAmplitude * maxBarHeight * 10 + 5, maxBarHeight) / 2;
      const y = (height - barHeight) / 2;

      ctx.fillRect(x, y, adjustedBarWidth, barHeight);
    });

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(draw);
    }
  }, [
    width,
    height,
    barWidth,
    barSpacing,
    maxBarHeight,
    color,
    isRecording,
    barCount,
    smoothingFactor,
    scrollSpeed,
  ]);

  useEffect(() => {
    if (!stream || !isRecording) {
      // Limpar recursos quando não está gravando
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      return;
    }

    // Configurar AudioContext e Analyser
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(analyser.frequencyBinCount);

    source.connect(analyser);

    // Armazenar referências
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;
    sourceRef.current = source;

    // Iniciar animação
    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (source) {
        source.disconnect();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [stream, isRecording, draw]);

  return (
    <Canvas
      ref={canvasRef}
      width={width - 75}
      height={height}
      style={{
        opacity: 0.5,
      }}
    />
  );
};
