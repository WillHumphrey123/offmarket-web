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
  if (hero) {
    requestAnimationFrame(() => hero.classList.add("is-loaded"));
  }

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

  /* ---------------- Proof post: engagement counters tick up ---------------- */
  const proofStats = document.getElementById("proofStats");
  if (proofStats) {
    const counters = proofStats.querySelectorAll("b[data-target]");
    const runCount = () => {
      counters.forEach((el) => {
        const target = parseInt(el.dataset.target, 10);
        if (reduceMotion) {
          el.textContent = target.toLocaleString();
          return;
        }
        const start = performance.now();
        const duration = 900;
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    };
    const io2 = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCount();
            io2.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    io2.observe(proofStats);
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

  /* ---------------- Mobile nav menu ---------------- */
  const burger = document.getElementById("navBurger");
  const mobileMenu = document.getElementById("navMobileMenu");
  if (burger && mobileMenu) {
    const closeMenu = () => {
      burger.setAttribute("aria-expanded", "false");
      mobileMenu.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    const openMenu = () => {
      burger.setAttribute("aria-expanded", "true");
      mobileMenu.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    burger.addEventListener("click", () => {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });
    mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
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
