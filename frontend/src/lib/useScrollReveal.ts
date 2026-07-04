import { useEffect, useRef } from 'react';

/**
 * Attaches an IntersectionObserver to a container ref.
 * Any child element inside with a reveal-* class will get
 * the "animated" class added once it enters the viewport.
 *
 * Usage:
 *   const ref = useScrollReveal();
 *   <section ref={ref}><div className="reveal-up">...</div></section>
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>(
      '.reveal-up, .reveal-left, .reveal-right, .reveal-fade'
    );

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
