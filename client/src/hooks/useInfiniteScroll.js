import { useEffect, useRef } from "react";

export default function useInfiniteScroll(
  enabled,
  onHit,
  rootMargin = "600px"
) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) onHit();
        });
      },
      { root: null, rootMargin, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, onHit, rootMargin]);

  return ref;
}
