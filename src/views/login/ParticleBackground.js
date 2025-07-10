import React, { useRef, useEffect, useState } from 'react';
import styles from './ParticleBackground.module.css';

const ParticleBackground = ({
  particleCount = 50,
  particleSize = 2,
  connectionDistance = 100,
  particleColor = "rgba(255, 255, 255, 0.5)",
  connectionColor = "rgba(255, 255, 255, 0.1)",
  velocity = 0.5
}) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // 粒子类
  class Particle {
    constructor(x, y, radius, color, velocity) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.velocity = velocity;
      this.dx = (Math.random() - 0.5) * velocity;
      this.dy = (Math.random() - 0.5) * velocity;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    update(ctx) {
      if (this.x + this.radius > dimensions.width || this.x - this.radius < 0) {
        this.dx = -this.dx;
      }

      if (this.y + this.radius > dimensions.height || this.y - this.radius < 0) {
        this.dy = -this.dy;
      }

      this.x += this.dx;
      this.y += this.dy;

      this.draw(ctx);
    }
  }

  // 初始化粒子
  const init = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * dimensions.width;
      const y = Math.random() * dimensions.height;
      const particle = new Particle(
        x,
        y,
        Math.random() * particleSize + 1,
        particleColor,
        velocity
      );
      particlesRef.current.push(particle);
    }

    return ctx;
  };

  // 连接粒子
  const connectParticles = (ctx) => {
    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        const distance = Math.sqrt(
          Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
        );

        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.strokeStyle = connectionColor;
          ctx.lineWidth = 0.2;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  };

  // 动画循环
  const animate = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    particlesRef.current.forEach(particle => {
      particle.update(ctx);
    });

    connectParticles(ctx);

    animationFrameId.current = requestAnimationFrame(animate);
  };

  const animationFrameId = useRef();

  // 响应式调整
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 初始化粒子效果
  useEffect(() => {
    const ctx = init();
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [dimensions, particleCount, particleSize, connectionDistance, particleColor, connectionColor, velocity]);

  // 悬停效果
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;

    const particles = particlesRef.current;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    particles.forEach(particle => {
      const distance = Math.sqrt(
        Math.pow(mouseX - particle.x, 2) +
        Math.pow(mouseY - particle.y, 2)
      );

      if (distance < 100) {
        // 鼠标附近的粒子产生排斥效果
        const angle = Math.atan2(
          particle.y - mouseY,
          particle.x - mouseX
        );
        const force = (100 - distance) * 0.1;

        particle.dx = Math.cos(angle) * force;
        particle.dy = Math.sin(angle) * force;
      }
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className={styles.particleCanvas}
      onMouseMove={handleMouseMove}
      width={dimensions.width}
      height={dimensions.height}
    />
  );
};

export default ParticleBackground;