import React, { useEffect } from 'react';

const LandingPage: React.FC = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 }}>
      <iframe
        src="/home/index.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Núcleo CRM - Plataforma"
      />
    </div>
  );
};

export default LandingPage;
