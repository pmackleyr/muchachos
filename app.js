(() => {
  const root = document.documentElement;
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointerFineQuery = window.matchMedia("(pointer: fine)");
  const prefersReducedMotion = reduceMotionQuery.matches;
  const hasFinePointer = pointerFineQuery.matches;

  root.classList.add("js");

  const header = document.querySelector(".site-header");
  const syncScrollFx = () => {
    const scrollY = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
    root.style.setProperty("--scroll-progress", progress.toFixed(4));
    if (header) {
      header.classList.toggle("is-scrolled", scrollY > 12);
    }
  };

  syncScrollFx();
  window.addEventListener("scroll", syncScrollFx, { passive: true });
  window.addEventListener("resize", syncScrollFx, { passive: true });

  const revealTargets = Array.from(document.querySelectorAll("[data-reveal]"));
  if (revealTargets.length > 0) {
    const revealAll = () => {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
    };

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealAll();
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -4% 0px" }
      );

      revealTargets.forEach((element) => revealObserver.observe(element));
      window.setTimeout(revealAll, 1200);
    }
  }

  const tiltTargets = Array.from(document.querySelectorAll("[data-tilt]"));
  if (prefersReducedMotion || !hasFinePointer || tiltTargets.length === 0) return;

  const resetTilt = (element) => {
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
    element.style.setProperty("--tilt-z", "0px");
    element.classList.remove("is-tilting");
  };

  tiltTargets.forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
      const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
      const maxTilt = 6;
      const tiltY = normalizedX * maxTilt;
      const tiltX = normalizedY * -maxTilt;
      const lift = 2 + Math.min(rect.width, rect.height) * 0.01;

      element.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
      element.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
      element.style.setProperty("--tilt-z", `${lift.toFixed(2)}px`);
      element.classList.add("is-tilting");
    });

    element.addEventListener("pointerleave", () => resetTilt(element));
    element.addEventListener("blur", () => resetTilt(element));
  });
})();
