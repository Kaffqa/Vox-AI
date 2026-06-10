import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ backgroundColor: '#06070a' }}>
      {/* Gradient mesh */}
      <div className="absolute inset-0">
        {/* Cyan orb */}
        <motion.div
          className="absolute rounded-full opacity-20"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
            top: '-10%',
            right: '-5%',
          }}
        />

        {/* Violet orb */}
        <motion.div
          className="absolute rounded-full opacity-15"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            bottom: '-15%',
            left: '-5%',
          }}
        />

        {/* Small emerald accent */}
        <motion.div
          className="absolute rounded-full opacity-10"
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>



      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
