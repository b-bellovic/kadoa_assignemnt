import React, { useRef, useState, useEffect } from 'react';

interface SmoothScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const SmoothScrollContainer: React.FC<SmoothScrollContainerProps> = ({
  children,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  // Handle scroll event to determine if gradients should be shown
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    // Show left gradient only if scrolled right
    setShowLeftGradient(container.scrollLeft > 20);

    // Show right gradient only if not at right edge
    const isAtRightEdge = container.scrollWidth - container.scrollLeft <= container.clientWidth + 20;
    setShowRightGradient(!isAtRightEdge);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();

      // Check again after a short delay in case of content changes
      const timer = setTimeout(handleScroll, 100);

      // Also check on window resize
      window.addEventListener('resize', handleScroll);

      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
        clearTimeout(timer);
      };
    }
  }, []);

  // Use a throttled scroll handler for better performance
  const scrollContainer = (deltaX: number) => {
    if (containerRef.current) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollLeft += deltaX;
        }
      });
    }
  };

  // Handle mouse wheel for horizontal scrolling - browser-friendly approach
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle wheel events when the container has overflow content
      if (container.scrollWidth > container.clientWidth) {
        // If the user is holding shift, the browser already handles horizontal scrolling
        if (!e.shiftKey) {
          // Check if there's significant vertical scroll but minimal horizontal scroll available
          const verticallyScrollable = container.scrollHeight > container.clientHeight + 10;

          // If content needs vertical scrolling, let the browser handle it naturally
          // Otherwise, convert the vertical wheel movement to horizontal scrolling
          if (!verticallyScrollable) {
            scrollContainer(e.deltaY);
          }
        }
      }
    };

    // Use { passive: true } to tell the browser we won't call preventDefault
    container.addEventListener('wheel', handleWheel, { passive: true });

    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Handle keyboard arrow keys for horizontal scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // Only handle arrow keys when the container is hovered/focused
      if (document.activeElement === container || container.contains(document.activeElement as Node)) {
        if (e.key === 'ArrowLeft') {
          scrollContainer(-100);
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          scrollContainer(100);
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative h-full">
      {/* Left shadow overlay - always visible when scrollable, more prominent when scrolled */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none transition-opacity duration-300 ${
          showLeftGradient ? 'opacity-100' : 'opacity-40'
        } bg-gradient-to-r from-background/95 to-transparent shadow-inner-right shadow-black/25`}
      />

      {/* Container with inner shadow for continuous shadow effect */}
      <div className="h-full shadow-inner-both shadow-black/15">
        {/* Scrollable container */}
        <div
          ref={containerRef}
          className={`flex gap-5 overflow-x-auto scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-transparent h-full min-h-0 pb-2 focus:outline-none ${className}`}
          style={{ scrollBehavior: 'smooth' }}
          tabIndex={0} // Make it focusable for keyboard navigation
          onMouseEnter={() => containerRef.current?.focus()} // Focus when mouse enters
        >
          {children}
        </div>
      </div>

      {/* Right shadow overlay - always visible when scrollable, more prominent when scrolled */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none transition-opacity duration-300 ${
          showRightGradient ? 'opacity-100' : 'opacity-40'
        } bg-gradient-to-l from-background/95 to-transparent shadow-inner-left shadow-black/25`}
      />
    </div>
  );
};
