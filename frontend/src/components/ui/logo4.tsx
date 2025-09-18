"use client";

import { useRef, useEffect } from "react";

// Define the structure for a single particle
interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

export function Logo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to match its container
    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setCanvasSize();

    // Get brand colors from CSS variables
    const getColors = () => {
      const style = getComputedStyle(document.documentElement);
      return [
        style.getPropertyValue("--color-ocean-blue").trim(),
        style.getPropertyValue("--color-valley-green").trim(),
        style.getPropertyValue("--color-sunny-yellow").trim(),
        style.getPropertyValue("--color-volcanic-gray").trim(),
      ];
    };
    const colors = getColors();
    let particles: Particle[] = [];

    // Function to create the initial set of particles
    const initParticles = () => {
      particles = [];
      const numberOfParticles = 100;
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    // Function to draw a single particle
    const drawParticle = (particle: Particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    };

    // The main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap particles around screen edges
        if (p.x > canvas.width + p.size) p.x = -p.size;
        else if (p.x < -p.size) p.x = canvas.width + p.size;
        if (p.y > canvas.height + p.size) p.y = -p.size;
        else if (p.y < -p.size) p.y = canvas.height + p.size;

        drawParticle(p);
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    // Handle window resizing
    window.addEventListener("resize", () => {
      setCanvasSize();
      initParticles(); // Re-initialize particles for new size
    });

    // Cleanup function to cancel the animation when the component unmounts
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);

  return (
    <div className="bg-volcanic-gray-dark relative flex h-48 w-full items-center justify-center rounded-lg">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" />
      <h1 className="relative z-10 font-serif text-6xl font-bold text-white drop-shadow-lg">
        Nosilha
      </h1>
    </div>
  );
}
