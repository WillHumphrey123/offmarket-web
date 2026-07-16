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

  /* ---------------- Portfolio: subtle per-card parallax, only for visible cards ---------------- */
  const portfolioPictures = document.querySelectorAll(".portfolio__card picture");
  if (portfolioPictures.length && !reduceMotion) {
    const visiblePictures = new Set();
    const portfolioIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visiblePictures.add(entry.target);
          else visiblePictures.delete(entry.target);
        });
      },
      { threshold: 0 }
    );
    portfolioPictures.forEach((el) => portfolioIO.observe(el));

    let pTicking = false;
    const updatePortfolioParallax = () => {
      visiblePictures.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * 0.06;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
      pTicking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!pTicking) {
          requestAnimationFrame(updatePortfolioParallax);
          pTicking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------------- Social proof: count up when it scrolls into view ---------------- */
  const proofCounters = document.querySelectorAll(".social-proof__text b[data-target]");
  if (proofCounters.length) {
    const runCount = (el) => {
      const target = parseInt(el.dataset.target, 10);
      if (reduceMotion) {
        el.textContent = target.toLocaleString();
        return;
      }
      const start = performance.now();
      const duration = 1100;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window) {
      const proofIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runCount(entry.target);
              proofIO.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      proofCounters.forEach((el) => proofIO.observe(el));
    } else {
      proofCounters.forEach(runCount);
    }
  }

  /* ---------------- Waitlist form: async submit with inline success/error ---------------- */
  const waitlistForm = document.getElementById("waitlistForm");
  if (waitlistForm) {
    const submitBtn = waitlistForm.querySelector(".waitlist-form__submit");
    const errorEl = document.getElementById("waitlistError");
    const successEl = document.getElementById("waitlistSuccess");

    waitlistForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorEl) errorEl.hidden = true;
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");

      try {
        const res = await fetch(waitlistForm.action, {
          method: "POST",
          body: new FormData(waitlistForm),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Submit failed");
        waitlistForm.hidden = true;
        if (successEl) successEl.hidden = false;
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
        if (errorEl) errorEl.hidden = false;
      }
    });
  }
})();
