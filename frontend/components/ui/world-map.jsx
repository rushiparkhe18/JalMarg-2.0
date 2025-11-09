"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function WorldMap({
  dots = [],
  lineColor = "#3b82f6",
}) {
  const canvasRef = useRef(null);
  const [hoveredPort, setHoveredPort] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw dotted world map
    const drawDottedMap = () => {
      const dotRadius = 1;
      const dotSpacing = 8;
      
      ctx.fillStyle = "rgba(156, 163, 175, 0.3)"; // gray dots

      // Create world map shape using dots
      for (let x = 0; x < width; x += dotSpacing) {
        for (let y = 0; y < height; y += dotSpacing) {
          // Convert to lat/lng
          const lng = (x / width) * 360 - 180;
          const lat = 90 - (y / height) * 180;

          // Simple land mass approximation (continents)
          const isLand = isLandMass(lat, lng);
          
          if (isLand) {
            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    // Simplified land mass detection - WORLDWIDE COVERAGE
    const isLandMass = (lat, lng) => {
      // North America
      if (lat >= 15 && lat <= 70 && lng >= -170 && lng <= -50) return true;
      // South America
      if (lat >= -55 && lat <= 12 && lng >= -82 && lng <= -35) return true;
      // Europe
      if (lat >= 36 && lat <= 71 && lng >= -10 && lng <= 40) return true;
      // Africa
      if (lat >= -35 && lat <= 37 && lng >= -18 && lng <= 52) return true;
      // Asia (expanded)
      if (lat >= -10 && lat <= 75 && lng >= 40 && lng <= 180) return true;
      // Australia & Oceania
      if (lat >= -50 && lat <= -10 && lng >= 110 && lng <= 180) return true;
      // Greenland
      if (lat >= 60 && lat <= 84 && lng >= -73 && lng <= -12) return true;
      // Antarctica (partial)
      if (lat >= -90 && lat <= -60) return true;
      
      return false;
    };

    // Draw grid lines with labels
    const drawGrid = () => {
      ctx.strokeStyle = "rgba(156, 163, 175, 0.15)";
      ctx.lineWidth = 0.5;
      ctx.fillStyle = "rgba(156, 163, 175, 0.5)";
      ctx.font = "10px sans-serif";

      // Longitude lines (vertical)
      for (let lng = -180; lng <= 180; lng += 30) {
        const x = ((lng + 180) / 360) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        
        // Labels at bottom
        if (lng !== 0) {
          ctx.fillText(`${lng}°`, x - 12, height - 5);
        }
      }

      // Latitude lines (horizontal)
      for (let lat = -90; lat <= 90; lat += 30) {
        const y = ((90 - lat) / 180) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        
        // Labels on left
        if (lat !== 0) {
          ctx.fillText(`${lat}°`, 5, y + 3);
        }
      }

      // Equator (highlighted)
      ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
      ctx.lineWidth = 1.5;
      const equatorY = ((90 - 0) / 180) * height;
      ctx.beginPath();
      ctx.moveTo(0, equatorY);
      ctx.lineTo(width, equatorY);
      ctx.stroke();
      
      // Equator label
      ctx.fillStyle = "rgba(6, 182, 212, 0.8)";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("Equator (0°)", width / 2 - 40, equatorY - 5);

      // Prime Meridian (highlighted)
      ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
      const primeX = ((0 + 180) / 360) * width;
      ctx.beginPath();
      ctx.moveTo(primeX, 0);
      ctx.lineTo(primeX, height);
      ctx.stroke();
      
      // Prime Meridian label
      ctx.save();
      ctx.translate(primeX + 5, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Prime Meridian (0°)", 0, 0);
      ctx.restore();
    };

    drawGrid();
    drawDottedMap();
  }, []);

  const projectionX = (lng) => {
    return ((lng + 180) / 360) * 1200;
  };

  const projectionY = (lat) => {
    return ((90 - lat) / 180) * 600;
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const createCurvedPath = (start, end) => {
    const x1 = projectionX(start.lng);
    const y1 = projectionY(start.lat);
    const x2 = projectionX(end.lng);
    const y2 = projectionY(end.lat);

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    // Calculate control point for curve
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const controlOffset = distance * 0.25;
    
    const controlX = midX;
    const controlY = midY - controlOffset;

    return `M ${x1},${y1} Q ${controlX},${controlY} ${x2},${y2}`;
  };

  return (
    <div 
      className="w-full h-full relative bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40"
      onMouseMove={handleMouseMove}
    >
      {/* Canvas for dotted map and grid */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* SVG for animated paths */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.1" />
            <stop offset="50%" stopColor={lineColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Connection paths */}
        {dots.map((dot, i) => (
          <motion.path
            key={`path-${i}`}
            d={createCurvedPath(dot.start, dot.end)}
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            initial={{
              pathLength: 0,
              opacity: 0,
            }}
            animate={{
              pathLength: 1,
              opacity: 1,
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Animated dots along paths */}
        {dots.map((dot, i) => {
          const path = createCurvedPath(dot.start, dot.end);
          return (
            <motion.circle
              key={`moving-dot-${i}`}
              r="3"
              fill={lineColor}
              initial={{ offsetDistance: "0%", opacity: 0 }}
              animate={{
                offsetDistance: "100%",
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 3,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                offsetPath: `path('${path}')`,
              }}
            >
              <animateMotion dur="3s" repeatCount="indefinite" begin={`${i * 0.3}s`}>
                <mpath href={`#path-${i}`} />
              </animateMotion>
            </motion.circle>
          );
        })}

        {/* Start dots with hover */}
        {dots.map((dot, i) => (
          <motion.g 
            key={`start-${i}`}
            onMouseEnter={() => setHoveredPort({ name: dot.start.name, type: 'start', index: i })}
            onMouseLeave={() => setHoveredPort(null)}
            style={{ cursor: 'pointer' }}
          >
            <motion.circle
              cx={projectionX(dot.start.lng)}
              cy={projectionY(dot.start.lat)}
              r={hoveredPort?.index === i && hoveredPort?.type === 'start' ? "10" : "6"}
              fill={lineColor}
              fillOpacity="0.2"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
              }}
            />
            <motion.circle
              cx={projectionX(dot.start.lng)}
              cy={projectionY(dot.start.lat)}
              r={hoveredPort?.index === i && hoveredPort?.type === 'start' ? "5" : "3"}
              fill={lineColor}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: hoveredPort?.index === i && hoveredPort?.type === 'start' ? 1.2 : 1, 
                opacity: 1 
              }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
              }}
            />
          </motion.g>
        ))}

        {/* End dots with hover */}
        {dots.map((dot, i) => (
          <motion.g 
            key={`end-${i}`}
            onMouseEnter={() => setHoveredPort({ name: dot.end.name, type: 'end', index: i })}
            onMouseLeave={() => setHoveredPort(null)}
            style={{ cursor: 'pointer' }}
          >
            <motion.circle
              cx={projectionX(dot.end.lng)}
              cy={projectionY(dot.end.lat)}
              r={hoveredPort?.index === i && hoveredPort?.type === 'end' ? "10" : "6"}
              fill={lineColor}
              fillOpacity="0.2"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{
                duration: 2,
                delay: i * 0.1 + 0.3,
                repeat: Infinity,
              }}
            />
            <motion.circle
              cx={projectionX(dot.end.lng)}
              cy={projectionY(dot.end.lat)}
              r={hoveredPort?.index === i && hoveredPort?.type === 'end' ? "5" : "3"}
              fill={lineColor}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: hoveredPort?.index === i && hoveredPort?.type === 'end' ? 1.2 : 1, 
                opacity: 1 
              }}
              transition={{
                duration: 0.5,
                delay: i * 0.1 + 0.3,
              }}
            />
          </motion.g>
        ))}
      </svg>

      {/* Hover Tooltip */}
      {hoveredPort && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute pointer-events-none z-50"
          style={{
            left: `${mousePos.x + 10}px`,
            top: `${mousePos.y - 10}px`,
          }}
        >
          <div className="bg-gray-900/95 backdrop-blur-md border border-cyan-500/30 rounded-lg px-4 py-2 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <p className="text-cyan-400 font-semibold text-sm whitespace-nowrap">
                {hoveredPort.name}
              </p>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              {hoveredPort.type === 'start' ? 'Origin Port' : 'Destination Port'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
