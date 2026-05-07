import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

export const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random();
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas!.width) this.x = 0;
        if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        ctx!.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    class Comet {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas!.width;
        this.y = -10;
        this.length = Math.random() * 80 + 20;
        this.speed = Math.random() * 10 + 5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x -= this.speed;
        this.y += this.speed;

        if (this.x < -this.length || this.y > canvas!.height + this.length) {
          this.reset();
        }
      }

      draw() {
        ctx!.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(this.x, this.y);
        ctx!.lineTo(this.x + this.length, this.y - this.length);
        ctx!.stroke();
      }
    }

    let comets: Comet[] = [];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      comets = [];
      for (let i = 0; i < 150; i++) {
        particles.push(new Particle());
      }
      for (let i = 0; i < 3; i++) {
        comets.push(new Comet());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#0D0D2B');
      grad.addColorStop(0.5, '#1A1040');
      grad.addColorStop(1, '#2D1B69');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle atmospheric glow in center
      const centerGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.8
      );
      centerGrad.addColorStop(0, 'rgba(45, 27, 105, 0.2)');
      centerGrad.addColorStop(1, 'rgba(13, 13, 43, 0)');
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      comets.forEach(c => {
        c.update();
        c.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="space-background"
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none"
    />
  );
};
