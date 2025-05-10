import { PlaceholderItem, ResultItem } from "./ResultItem";
import { useQuery } from "../lib/hooks/useQuery";
import { ImpressionProvider } from "../lib/hooks/ImpressionProvider";
import { InfiniteHitList } from "./InfiniteHitList";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useYourPopularItems } from "../hooks/searchHooks";
import { ItemsQuery } from "../lib/types";

export const Banner = () => {
  const svgRef = useRef<SVGSVGElement>(null);
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

  return (
    <div className="relative w-full aspect-video overflow-hidden bg-[#0a1744]">
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
        </defs>
        {/* Base dark blue background */}
        <rect width="100%" height="100%" fill="url(#subtle-glow)" />

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

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-start justify-center h-full px-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: textVisible ? 1 : 0, x: textVisible ? 0 : -100 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
            staggerChildren: 0.2,
            delayChildren: 0.3,
          }}
          className="max-w-2xl"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: textVisible ? 1 : 0, x: textVisible ? 0 : -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            STÖRSTA SKÄRMEN.
          </motion.h1>

          <motion.h2
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: textVisible ? 1 : 0, x: textVisible ? 0 : -50 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            TUNNASTE DESIGNEN.
          </motion.h2>

          <motion.h2
            className="text-4xl md:text-6xl font-bold text-white mb-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: textVisible ? 1 : 0, x: textVisible ? 0 : -50 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            NÅGONSIN.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: textVisible ? 1 : 0, x: textVisible ? 0 : -50 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors">
              Köp nu
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const NoResults = () => {
  const { data } = useYourPopularItems();

  return (
    <ImpressionProvider>
      <div
        id="results"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0 scroll-snap-y"
      >
        <div className="col-span-full text-center text-2xl font-bold mb-4">
          Popular products
        </div>
        {data?.map((item, idx) => (
          <ResultItem key={item.id} {...item} position={idx} />
        ))}
      </div>
    </ImpressionProvider>
  );
};

const useIsEmptyQuery = (query: ItemsQuery) => {
  const { string, range, filter, query: term } = query;
  const isEmpty =
    (string?.length ?? 0) === 0 &&
    (range?.length ?? 0) === 0 &&
    (term?.length ?? 0) === 0 &&
    (filter?.length ?? 0) === 0;

  return isEmpty;
};

export const SearchResultList = () => {
  const { isLoading, hits, query } = useQuery();
  const isEmpty = useIsEmptyQuery(query);
  if (isLoading && !isEmpty) {
    return (
      <div
        id="results"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0"
      >
        {new Array(query.pageSize)?.map((_, idx) => (
          <PlaceholderItem key={`p-${idx}`} />
        ))}
      </div>
    );
  }

  if (!hits.length && isEmpty) {
    return <NoResults />;
  }

  return (
    <ImpressionProvider>
      <div
        id="results"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0 scroll-snap-y"
      >
        <InfiniteHitList>
          {(item) => <ResultItem key={item.id} {...item} />}
        </InfiniteHitList>
      </div>
    </ImpressionProvider>
  );
};
