import { useEffect, useRef, useState } from 'react';

class AmplitudeUnit {
  x;
  y;
  ctx;
  constructor(
    x: number,
    y: number,
    height: number,
    ctx: CanvasRenderingContext2D,
  ) {
    this.x = x;
    this.y = y;
    this.ctx = ctx;
  }
}

const AudioCanvas = ({ audioBlob }: { audioBlob: Blob }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getAmplitudes = async (amount: number) => {
    const audioCtx = new AudioContext();
    const source = audioCtx.createBufferSource();

    const bufferLength = 2048;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = bufferLength;
    const dataArray = new Float32Array(bufferLength);

    source.connect(analyser);

    analyser.getFloatTimeDomainData(dataArray);
    const dataSquared = dataArray.map((data) => data ** 2);
    let total = 0;
    dataSquared.forEach((data) => (total += data));
    const rms = parseFloat(Math.sqrt(total / dataSquared.length).toFixed(5));
    setAmplitudeValues((prev) => [...prev.slice(-150), rms]);
  };

  const [amplitudeValues, setAmplitudeValues] = useState<number[]>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { clientWidth } = parent;

      canvas.width = clientWidth;
      canvas.height = 30; // You can make this dynamic too

      draw(context, canvas.width, canvas.height);
    };

    const draw = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
    ) => {
      ctx.beginPath();
      ctx.moveTo(10, 10);
      ctx.strokeStyle = 'black';
      ctx.stroke();
    };

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  if (amplitudeValues?.length)
    return (
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '400px',
          display: 'block',
          background: '#eee',
        }}
      />
    );
};

export default AudioCanvas;
