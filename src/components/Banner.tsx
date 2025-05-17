import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Item } from "../lib/types";
import { useAddToCart } from "../hooks/cartHooks";
import { toEcomTrackingEvent } from "./toImpression";
import { makeImageUrl } from "../utils";

export const Banner = ({ item: data }: { item: Item }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const contentSvgRef = useRef<SVGSVGElement>(null);
  const { trigger, isMutating } = useAddToCart();
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Animation for the curved shape
    const animate = () => {
      const path = svg.querySelector("#curved-shape") as SVGPathElement;
      if (!path) return;

      let progress = 0;
      let direction = 1;

      const animation = () => {
        // Subtle movement of the curved shape
        progress += 0.0005 * direction;

        if (progress > 1) {
          progress = 1;
          direction = -1;
        } else if (progress < 0) {
          progress = 0;
          direction = 1;
        }
        // Animate the curve by changing the control point
        const baseControlX = 900;
        const baseControlY = 400;
        const animationRange = 90;

        // Calculate the animated control point position
        const animatedControlX =
          baseControlX + animationRange * Math.sin(progress * Math.PI * 2);
        const animatedControlY =
          baseControlY + animationRange * Math.cos(progress * Math.PI * 2);

        // Update the path with the animated control point
        path.setAttribute(
          "d",
          `M400,0 Q${animatedControlX},${animatedControlY} 300,1000 L1000,1000 L1000,0 Z`
        );
        path.setAttribute("opacity", `${0.5 + progress / 2}`);
        requestAnimationFrame(animation);
      };

      requestAnimationFrame(animation);
    };

    animate();
    // Trigger text animation after a short delay
    const timer = setTimeout(() => {
      setTextVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Parse bullet points
  const bulletPoints = data?.bp ? data.bp.split("\n") : [];

  // Calculate vertical spacing for centered bullet points
  const topMargin = 400; // Space for title
  const bottomMargin = 340; // Space at bottom
  const availableHeight = 1000 - topMargin - bottomMargin;
  const totalBulletPoints = bulletPoints.length;
  const bulletSpacing =
    totalBulletPoints > 1
      ? availableHeight / (totalBulletPoints - 1)
      : availableHeight;

  return (
    <div className="relative w-full aspect-video bg-[#0a1744]">
      {/* Background SVG with gradients and animations */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="curve-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#304183" />
            <stop offset="100%" stopColor="#1a3090" />
          </linearGradient>
          <radialGradient
            id="subtle-glow"
            cx="50%"
            cy="50%"
            r="70%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#1a3090" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2a3764" stopOpacity="0" />
          </radialGradient>

          {/* Fancy text gradients */}
          <linearGradient
            id="title-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0e0ff" />
          </linearGradient>

          {/* Button gradient */}
          <linearGradient
            id="button-gradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#69a333" />
            <stop offset="100%" stopColor="#399303" />
          </linearGradient>

          {/* Enhanced shadow */}
          <filter
            id="enhanced-shadow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="-2"
              dy="-2"
              stdDeviation="3"
              floodColor="#000"
              floodOpacity="0.8"
            />
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="12"
              floodColor="#4a6bff"
              floodOpacity="0.4"
            />
          </filter>

          {/* Glow effect for button */}
          <filter id="button-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base dark blue background */}
        <rect width="100%" height="100%" fill="url(#subtle-glow)" />

        {/* Decorative elements - subtle circles */}
        <circle cx="200" cy="850" r="300" fill="#1a237e" fillOpacity="0.1" />
        <circle cx="800" cy="150" r="200" fill="#1a237e" fillOpacity="0.1" />

        {/* Curved diagonal shape with slightly lighter blue */}
        <path
          style={{ boxShadow: "inset -10px -10px 30px rgba(0, 0, 0, 0.9)" }}
          id="curved-shape"
          d="M500,0 Q600,500 500,1000 L1000,1000 L1000,0 Z"
          fill="url(#curve-gradient)"
        />

        {/* Subtle gradient overlay */}
        <rect width="100%" height="100%" fill="url(#subtle-glow)" />
      </svg>

      {/* Content SVG with text elements - This SVG scales with container */}
      <svg
        ref={contentSvgRef}
        className="absolute inset-0 w-full h-full z-10"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMinYMin meet"
      >
        {/* Title text - fancier with gradient fill */}
        <motion.text
          x="80"
          y="180"
          fontSize="85"
          fontFamily="headline, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"
          fontWeight="bold"
          fill="url(#title-gradient)"
          filter="url(#enhanced-shadow)"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: textVisible ? 1 : 0, x: textVisible ? 0 : -50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {data?.title}
        </motion.text>

        {/* Bullet points - vertically centered */}
        {bulletPoints.map((line, index) => (
          <motion.g key={index}>
            {/* Decorative bullet point */}
            <motion.circle
              cx="84"
              cy={topMargin + index * bulletSpacing}
              r="8"
              fill="#4a6bff"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: textVisible ? 0.8 : 0,
                scale: textVisible ? 1 : 0,
              }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }}
            />

            {/* Text with enhanced styling */}
            <motion.text
              x="120"
              y={topMargin + index * bulletSpacing}
              fontSize="67"
              fontFamily="headline, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"
              fontWeight="600"
              fill="white"
              filter="url(#enhanced-shadow)"
              dominantBaseline="middle"
              initial={{ opacity: 0, x: -50 }}
              animate={{
                opacity: textVisible ? 1 : 0,
                x: textVisible ? 0 : -50,
              }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
            >
              {line}
            </motion.text>
          </motion.g>
        ))}

        {/* Fancy button at the bottom */}
        <motion.g
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: textVisible ? 1 : 0, y: textVisible ? 0 : 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{ cursor: isMutating ? "wait" : "pointer" }}
          onClick={() => {
            if (!isMutating) {
              trigger(
                { sku: data.sku, quantity: 1 },
                toEcomTrackingEvent(data, 10)
              );
            }
          }}
        >
          {/* Button background */}
          <rect
            x="80"
            y="840"
            width="200"
            height="80"
            rx="40"
            ry="40"
            fill="url(#button-gradient)"
            className={`transition-opacity duration-300 ${
              isMutating ? "opacity-80" : "hover:opacity-90"
            }`}
          />

          {/* Button highlight */}
          <rect
            x="85"
            y="850"
            width="190"
            height="30"
            rx="25"
            ry="25"
            fill="white"
            opacity="0.1"
          />

          {/* Button text - shown when not mutating */}
          <motion.text
            x="180"
            y="884"
            fontSize="43"
            fontFamily="headline, sans-serif"
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
            dominantBaseline="middle"
            filter="url(#enhanced-shadow)"
            initial={{ opacity: 1 }}
            animate={{ opacity: isMutating ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            Köp nu
          </motion.text>

          {/* Spinner - shown when mutating */}
          <motion.g
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: isMutating ? 1 : 0,
              scale: isMutating ? 1 : 0.5,
              rotate: isMutating ? 360 : 0,
            }}
            transition={{
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
              rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
            }}
          >
            {/* Spinner circle */}
            <circle
              cx="180"
              cy="900"
              r="20"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray="60 30"
              strokeLinecap="round"
            />
          </motion.g>
        </motion.g>
      </svg>

      {/* Product image container */}
      <motion.div
        className="absolute bottom-0 right-[5%] top-5 flex w-[33%] flex-col items-center justify-center z-20"
        initial={{ opacity: 0, x: 80 }}
        animate={{
          opacity: textVisible ? 1 : 0,
          x: textVisible ? 0 : 80,
        }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <img
          src={`https://next-media.elkjop.com/primaryimage/${data.sku}`}
          width={640}
          height={640}
          className="object-contain transition-transform hover:scale-110 rotate-0 hover:-rotate-3 duration-500 max-h-[80%]"
        />
        {data.badgeUrl && (
          <img
            src={makeImageUrl(data.badgeUrl)}
            className="object-contain absolute top-[10%] right-0 transition-transform hover:scale-110 rotate-0 hover:-rotate-3 duration-500 max-h-[25%]"
          />
        )}
      </motion.div>
    </div>
  );
};
