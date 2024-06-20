"use client";
import { useEffect, useRef } from "react";

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const columns = Math.floor(width / 20) + 1;
    const drops = Array(columns).fill(1);
    const colors = ["#8C47BB", "#4CA6E3"];

    const draw = () => {
      context.fillStyle = "rgba(0, 0, 0, 0.05)";
      context.fillRect(0, 0, width, height);

      context.font = "15pt monospace";

      drops.forEach((y, index) => {
        const text = String.fromCharCode(Math.random() * 128);
        const x = index * 20;

        // Randomly choose one of the two colors
        context.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        context.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[index] = 0;
        } else {
          drops[index] = y + 20;
        }
      });
    };

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
};

export default MatrixRain;
