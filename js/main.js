(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Nav scroll state ---------------- */
  const nav = document.getElementById("nav");
  const onNavScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  onNavScroll();
  window.addEventListener("scroll", onNavScroll, { passive: true });

  /* ---------------- Hero load-in ---------------- */
  const hero = document.querySelector(".hero");
  requestAnimationFrame(() => hero.classList.add("is-loaded"));

  /* ---------------- Hero parallax ---------------- */
  const heroMedia = document.getElementById("heroMedia");
  if (!reduceMotion && heroMedia) {
    let ticking = false;
    const updateParallax = () => {
      const y = window.scrollY;
      const heroHeight = hero.offsetHeight;
      if (y < heroHeight * 1.2) {
        heroMedia.style.transform = `translate3d(0, ${y * 0.28}px, 0)`;
      }
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------------- Generic scroll reveals ---------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------- Noise word: OFF-MARKET -> OffMarket ---------------- */
  const noiseWordWrap = document.getElementById("noiseWordWrap");
  const noiseWord = document.getElementById("noiseWord");
  if (noiseWordWrap && noiseWord) {
    if (reduceMotion) {
      noiseWord.classList.add("is-clean");
    } else {
      const io2 = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => noiseWord.classList.add("is-clean"), 300);
              io2.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      io2.observe(noiseWordWrap);
    }
  }

  /* ---------------- How-it-works: step + stage sync ---------------- */
  const howSteps = document.querySelectorAll(".how__step");
  const stageFrame = document.getElementById("stageFrame");

  if (howSteps.length && stageFrame) {
    if (reduceMotion) {
      howSteps.forEach((s) => s.classList.add("is-active"));
      stageFrame.classList.add("step-4");
    } else {
      const stepIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const stepNum = entry.target.dataset.step;
            if (entry.isIntersecting) {
              entry.target.classList.add("is-active");
              stageFrame.className = "how__stage-frame step-" + stepNum;
            } else if (entry.boundingClientRect.top > 0) {
              entry.target.classList.remove("is-active");
            }
          });
        },
        { threshold: 0.55, rootMargin: "-10% 0px -10% 0px" }
      );
      howSteps.forEach((s) => stepIO.observe(s));
    }
  }

  /* ---------------- Portfolio rail: drag-to-scroll on desktop ---------------- */
  const rail = document.getElementById("portfolioRail");
  if (rail) {
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    rail.addEventListener("pointerdown", (e) => {
      isDown = true;
      rail.setPointerCapture(e.pointerId);
      startX = e.clientX;
      scrollStart = rail.scrollLeft;
    });
    rail.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      rail.scrollLeft = scrollStart - (e.clientX - startX);
    });
    const stopDrag = () => (isDown = false);
    rail.addEventListener("pointerup", stopDrag);
    rail.addEventListener("pointerleave", stopDrag);
  }
})();
