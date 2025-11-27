import React from 'react';

interface SnowflakeProps {
  left: number;
  delay: number;
  duration: number;
  size: number;
}

const Snowflake: React.FC<SnowflakeProps> = ({ left, delay, duration, size }) => {
  return (
    <div
      className="absolute pointer-events-none text-white opacity-80"
      style={{
        left: `${left}%`,
        top: '-10px',
        fontSize: `${size}px`,
        animation: `snow ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
        userSelect: 'none',
      }}
    >
      ❄
    </div>
  );
};

const Snowflakes: React.FC = () => {
  const snowflakes = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 10 + Math.random() * 10,
    size: 10 + Math.random() * 15,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {snowflakes.map((snowflake) => (
        <Snowflake
          key={snowflake.id}
          left={snowflake.left}
          delay={snowflake.delay}
          duration={snowflake.duration}
          size={snowflake.size}
        />
      ))}
    </div>
  );
};

export default Snowflakes;

