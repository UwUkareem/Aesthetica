import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

const videos = [
  "/VaporWaveVid/Vid0.m4v",
  "/VaporWaveVid/Vid1.m4v",
  "/VaporWaveVid/Vid2.m4v",
  "/VaporWaveVid/Vid3.m4v",
];

const Hero = () => {
  // Video indices
  const [bgIndex, setBgIndex] = useState(0);
  const [miniIndex, setMiniIndex] = useState(1);
  const [sepIndex, setSepIndex] = useState(-1);

  // Animation state
  const [animating, setAnimating] = useState(false);
  const [swapped, setSwapped] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Refs
  const bgRef = useRef(null);
  const miniRef = useRef(null);
  const sepRef = useRef(null);

  const bgVideoRef = useRef(null);
  const miniVideoRef = useRef(null);
  const sepVideoRef = useRef(null);

  const currentMiniRef = useRef(miniRef.current);
  const currentVideoRef = useRef(miniVideoRef.current);
  const hoverTimeout = useRef(null);

  const mousePos = useRef({ x: 0, y: 0 });

  // Initial GSAP setup
  useEffect(() => {
    gsap.set(bgRef.current, {
      width: "100%",
      height: "100%",
      borderRadius: 0,
      zIndex: 0,
      cursor: "default",
      position: "absolute",
    });
    gsap.set(miniRef.current, {
      width: "4rem",
      height: "4rem",
      borderRadius: "100%",
      zIndex: 1,
      opacity: 0.8,
      cursor: "pointer",
      position: "absolute",
      bottom: "2rem",
      right: "2rem",
    });
    gsap.set(sepRef.current, {
      width: 0,
      height: 0,
      borderRadius: "10%",
      zIndex: 2,
      cursor: "default",
      position: "absolute",
      bottom: "2rem",
      right: "2rem",
    });
    gsap.set([miniVideoRef.current, sepVideoRef.current, bgVideoRef.current], {
      scale: 1,
      transformOrigin: "center center",
    });

    currentMiniRef.current = miniRef.current;
    currentVideoRef.current = miniVideoRef.current;
  }, []);

  // Update mouse position globally
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Handle mini click animation & cycling
  const handleMiniClick = () => {
    if (animating) return;
    setAnimating(true);

    const roles = [
      { mini: miniRef.current, sep: sepRef.current, bg: bgRef.current },
      { mini: sepRef.current, sep: bgRef.current, bg: miniRef.current },
      { mini: bgRef.current, sep: miniRef.current, bg: sepRef.current },
    ];

    const { mini, sep, bg } = roles[swapped];

    // Update video indices
    if (swapped === 0) setSepIndex((prev) => (prev + 3) % videos.length);
    else if (swapped === 1) setBgIndex((prev) => (prev + 3) % videos.length);
    else setMiniIndex((prev) => (prev + 3) % videos.length);

    // Set zIndex
    gsap.set(bg, { zIndex: 0 });
    gsap.set(mini, { zIndex: 1 });
    gsap.set(sep, { zIndex: 2 });

    // Reset video scales
    gsap.to([miniVideoRef.current, sepVideoRef.current, bgVideoRef.current], {
      scale: 1,
      duration: 1,
    });

    // Animate mini -> full screen
    gsap.to(mini, {
      width: "100%",
      height: "100%",
      borderRadius: 0,
      cursor: "default",
      bottom: 0,
      right: 0,
      duration: 1,
      ease: "power1.inOut",
      onComplete: () => {
        // Animate sep -> mini size
        gsap.to(sep, {
          width: "14rem",
          height: "9rem",
          borderRadius: "10%",
          cursor: "pointer",
          bottom: "2rem",
          right: "2rem",
          duration: 1,
          ease: "power1.out",
          onComplete: () => {
            // Reset bg size
            gsap.set(bg, {
              width: 0,
              height: 0,
              borderRadius: 0,
              cursor: "default",
              bottom: "2rem",
              right: "2rem",
            });

            // Update current mini/video refs for hover
            const nextSwapped = (swapped + 1) % 3;

            currentMiniRef.current =
              nextSwapped === 0
                ? miniRef.current
                : nextSwapped === 1
                ? sepRef.current
                : bgRef.current;
            currentVideoRef.current =
              nextSwapped === 0
                ? miniVideoRef.current
                : nextSwapped === 1
                ? sepVideoRef.current
                : bgVideoRef.current;

            // Check if mouse is over the new mini
            const rect = currentMiniRef.current.getBoundingClientRect();
            const isInside =
              mousePos.current.x >= rect.left &&
              mousePos.current.x <= rect.right &&
              mousePos.current.y >= rect.top &&
              mousePos.current.y <= rect.bottom;

            gsap.to(currentVideoRef.current, {
              scale: isInside ? 1.3 : 1,
              duration: 0.6,
              ease: "power1.inOut",
            });

            setSwapped(nextSwapped);
            setAnimating(false);
          },
        });
      },
    });
  };

  // Handle hover animation
  useEffect(() => {
    const checkMouse = (e) => {
      if (animating) return;

      const currentMini = currentMiniRef.current;
      const currentVideo = currentVideoRef.current;
      if (!currentMini || !currentVideo) return;

      // Check if mouse is over new mini
      const rect = currentMiniRef.current.getBoundingClientRect();
      const isInside =
        mousePos.current.x >= rect.left &&
        mousePos.current.x <= rect.right &&
        mousePos.current.y >= rect.top &&
        mousePos.current.y <= rect.bottom;

      if (isInside) {
        if (!isHovered) setIsHovered(true);
        if (hoverTimeout.current) {
          clearTimeout(hoverTimeout.current);
          hoverTimeout.current = null;
        }

        gsap.to(currentMini, {
          width: "14rem",
          height: "9rem",
          borderRadius: "10%",
          opacity: 1,
          duration: 1,
          ease: "power4.inOut",
        });

        gsap.to(currentVideo, {
          scale: 1.3,
          duration: 0.6,
          ease: "power1.inOut",
        });
      } else if (isHovered && !hoverTimeout.current) {
        hoverTimeout.current = setTimeout(() => {
          setIsHovered(false);

          gsap.to(currentMini, {
            width: "4rem",
            height: "4rem",
            borderRadius: "100%",
            opacity: 0.8,
            duration: 1,
            ease: "power4.inOut",
          });

          hoverTimeout.current = null;
        }, 2000);

        gsap.to(currentVideo, {
          scale: 1,
          duration: 0.6,
          ease: "power1.inOut",
        });
      }
    };

    window.addEventListener("mousemove", checkMouse);
    return () => window.removeEventListener("mousemove", checkMouse);
  }, [animating, isHovered]);

  // Handle clicks
  const handleClick = (e) => {
    if (e.currentTarget === currentMiniRef.current) handleMiniClick();
  };

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-black">
      {/* Background wrapper */}
      <div
        ref={bgRef}
        onClick={handleClick}
        className="absolute overflow-hidden"
      >
        <video
          ref={bgVideoRef}
          preload="auto"
          src={videos[bgIndex]}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover will-change-transform"
        />
      </div>

      {/* Separate wrapper */}
      <div
        ref={sepRef}
        onClick={handleClick}
        className="absolute overflow-hidden"
      >
        <video
          ref={sepVideoRef}
          preload="auto"
          src={videos[sepIndex]}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover will-change-transform"
        />
      </div>

      {/* Mini wrapper */}
      <div
        ref={miniRef}
        onClick={handleClick}
        className="absolute overflow-hidden"
      >
        <video
          ref={miniVideoRef}
          preload="auto"
          src={videos[miniIndex]}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover will-change-transform"
        />
      </div>
    </div>
  );
};

export default Hero;
