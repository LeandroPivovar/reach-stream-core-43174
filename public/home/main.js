

document.addEventListener('DOMContentLoaded', () => {
    const isMobileDevice = window.innerWidth <= 1024;

    let lenis = null;
    if (!isMobileDevice) {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // GSAP
    gsap.registerPlugin(ScrollTrigger);

    const gridLinesGroup = document.getElementById('grid-lines');
    const gridDotsGroup = document.getElementById('grid-dots');
    const spacing = isMobileDevice ? 100 : 50;
    const rows = Math.floor(1000 / spacing);
    const cols = Math.floor(1000 / spacing);

    for (let r = 0; r <= rows; r++) {
        if (Math.random() < 0.98) {
            const y = r * spacing;
            const hLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            const direction = Math.random() < 0.5 ? 1 : -1;

            if (direction === 1) {
                hLine.setAttribute("x1", 0);
                hLine.setAttribute("x2", 1000);
            } else {
                hLine.setAttribute("x1", 1000);
                hLine.setAttribute("x2", 0);
            }
            hLine.setAttribute("y1", y);
            hLine.setAttribute("y2", y);
            hLine.setAttribute("class", "grid-line h-line");

            const drawLen = random(600, 1000);
            hLine.style.strokeDasharray = `${drawLen} 2000`;
            hLine.style.strokeDashoffset = drawLen;
            gridLinesGroup.appendChild(hLine);
        }
    }
    for (let c = 0; c <= cols; c++) {
        if (Math.random() < 0.98) {
            const x = c * spacing;
            const vLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            const direction = Math.random() < 0.5 ? 1 : -1;

            if (direction === 1) {
                vLine.setAttribute("y1", 0);
                vLine.setAttribute("y2", 1000);
            } else {
                vLine.setAttribute("y1", 1000);
                vLine.setAttribute("y2", 0);
            }
            vLine.setAttribute("x1", x);
            vLine.setAttribute("x2", x);
            vLine.setAttribute("class", "grid-line v-line");

            const drawLen = random(600, 1000);
            vLine.style.strokeDasharray = `${drawLen} 2000`;
            vLine.style.strokeDashoffset = drawLen;
            gridLinesGroup.appendChild(vLine);
        }
    }

    const numDots = isMobileDevice ? 15 : 40;
    for (let i = 0; i < numDots; i++) {
        const cx = Math.floor(random(0, cols)) * spacing;
        const cy = Math.floor(random(0, rows)) * spacing;

        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", cx);
        dot.setAttribute("cy", cy);
        dot.setAttribute("r", 1.5);
        dot.setAttribute("class", "grid-dot scatter-dot");
        gridDotsGroup.appendChild(dot);
    }

    const raysGroup = document.getElementById('energy-rays');
    const numRays = isMobileDevice ? 15 : 40;
    for (let i = 0; i < numRays; i++) {
        const radius = 45;
        const spread = 1500;
        const angle = (i * 360 / numRays) * (Math.PI / 180);

        const x1 = 500 + radius * Math.cos(angle);
        const y1 = 500 + radius * Math.sin(angle);
        const x2 = 500 + spread * Math.cos(angle);
        const y2 = 500 + spread * Math.sin(angle);

        const ray = document.createElementNS("http://www.w3.org/2000/svg", "line");
        ray.setAttribute("x1", x1);
        ray.setAttribute("y1", y1);
        ray.setAttribute("x2", x2);
        ray.setAttribute("y2", y2);
        ray.setAttribute("class", "energy-ray");

        const rayLength = random(200, 500);
        ray.style.strokeDasharray = `${rayLength} ${spread}`;
        ray.style.strokeDashoffset = rayLength;
        raysGroup.appendChild(ray);
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // SEÇÃO HERO - CURSOR
    const explorerCursor = document.getElementById('explorer-cursor');

    if (explorerCursor && !isMobileDevice) {
        const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const mouse = { x: pos.x, y: pos.y };

        window.addEventListener("mousemove", e => {
            mouse.x = e.x;
            mouse.y = e.y;
            if (window.scrollY < window.innerHeight * 0.5) {
                gsap.to(explorerCursor, { opacity: 1, duration: 0.5 });
            } else {
                gsap.to(explorerCursor, { opacity: 0, duration: 0.3 });
            }
        });

        gsap.ticker.add(() => {
            const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());
            pos.x += (mouse.x - pos.x) * dt;
            pos.y += (mouse.y - pos.y) * dt;
            gsap.set(explorerCursor, { x: pos.x + 20, y: pos.y + 20 });
        });
    }

    const mm = gsap.matchMedia();

    mm.add({
        isDesktop: "(min-width: 1025px)",
        isMobile: "(max-width: 1024px)"
    }, (context) => {
        let { isDesktop, isMobile } = context.conditions;

        // SEÇÃO HERO - TIMELINE
        const heroTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom bottom",
                scrub: isMobile ? true : 0.6,
                pin: ".hero-sticky-wrapper",
                pinSpacing: false,
                onUpdate: (self) => {
                    const prog = self.progress;
                    if (prog > 0.15) {
                        document.querySelector('.hero').classList.add('universe-mode');
                    } else {
                        document.querySelector('.hero').classList.remove('universe-mode');
                    }
                }
            }
        });


        // Stage 2: SYNCED RAYS, SWEEP, AND GRID
        if (isMobile) {
            // Circular reveal for mobile to prevent "cutting" feel
            heroTl.fromTo(".hero-cinematic-wrapper",
                { clipPath: "circle(100% at 50% 50%)" },
                { clipPath: "circle(0% at 50% 50%)", duration: 2, ease: "power2.inOut" }, 0.5);
        } else {
            // Horizontal sweep for desktop
            heroTl.fromTo(".hero-cinematic-wrapper",
                { clipPath: "inset(0% 0% 0% 0%)" },
                { clipPath: "inset(0% 50% 0% 50%)", duration: 1.8, ease: "power2.inOut" }, 0.5);
        }
        heroTl.to(".hero-cinematic-wrapper", { opacity: 0, duration: 0.1 }, 2.3);

        // Animação unificada: raios de energia
        heroTl.to(".energy-ray", {
            strokeDashoffset: -1500,
            opacity: 1,
            duration: 2,
            stagger: { amount: 0.5, from: "random" },
            ease: "power2.out"
        }, 1.8);

        heroTl.to(".energy-ray", { opacity: 0, duration: 1.5 }, 3.5);

        // Animação unificada: desenhando a grid (quadrados)
        heroTl.to(".grid-line", {
            strokeDashoffset: 0,
            duration: 3,
            stagger: { amount: 2, from: "random" },
            ease: "power2.inOut"
        }, 1.8);

        // Animação unificada: pontos nas interseções
        heroTl.to(".scatter-dot", { opacity: 0.8, duration: 2, stagger: { amount: 2, from: "random" } }, 2.5);

        heroTl.to("#hero-text-content", { opacity: 1, duration: 1.2, ease: "power3.out" }, 3.5);

        if (isDesktop) {
            ScrollTrigger.create({
                trigger: ".features-carousel",
                start: "top top",
                end: "bottom bottom",
                pin: ".features-right",
                pinSpacing: false,
            });

            const scrollTrap = document.getElementById('scrollTrapezoid');
            if (scrollTrap) {
                gsap.fromTo(scrollTrap, { top: '5vh' }, {
                    top: '40vh',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.features-carousel',
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: true,
                    }
                });
            }

            const featureItems = gsap.utils.toArray('.feature-item');
            const featureSlides = document.querySelectorAll('.feature-slide');

            function splitChars(el) {
                const text = el.innerText;
                el.innerHTML = '';
                return [...text].map(char => {
                    const s = document.createElement('span');
                    s.className = 'feat-char';
                    s.textContent = char;
                    el.appendChild(s);
                    return s;
                });
            }

            const COLOR_GRAY = 'rgba(0,0,0,0.1)';
            const COLOR_TITLE = '#020617';
            const COLOR_BODY = '#475569';
            const COLOR_GLOW = '#8C73ED';
            const SHADOW_GLOW = '0 0 14px rgba(140,115,237,0.95), 0 0 4px rgba(140,115,237,1)';
            const SHADOW_NONE = '0 0 0px transparent';

            const itemData = featureItems.map((item, idx) => {
                const h3 = item.querySelector('h3');
                const p = item.querySelector('p');
                const numSpan = item.querySelector('.feature-num');
                const titleChars = splitChars(h3);
                const bodyChars = splitChars(p);
                const allChars = [...titleChars, ...bodyChars];

                gsap.set(allChars, { color: COLOR_GRAY, textShadow: SHADOW_NONE });
                if (numSpan) gsap.set(numSpan, { opacity: 0.12 });

                return { item, idx, titleChars, bodyChars, allChars, numSpan, lastPaintedIdx: 0 };
            });

            featureItems.forEach((item, idx) => {
                ScrollTrigger.create({
                    trigger: item,
                    start: 'top 65%',
                    end: 'bottom 35%',
                    onEnter: () => activateSlide(idx),
                    onEnterBack: () => activateSlide(idx),
                });
            });

            function activateSlide(idx) {
                featureSlides.forEach(s => s.classList.remove('active'));
                const target = document.querySelector(`.feature-slide[data-slide="${idx + 1}"]`);
                if (target) target.classList.add('active');
            }

            itemData.forEach((data) => {
                ScrollTrigger.create({
                    trigger: data.item,
                    start: "top 95%",
                    end: "center center",
                    scrub: true,
                    onUpdate: (self) => {
                        const progress = self.progress;
                        const totalChars = data.allChars.length;
                        const targetIdx = Math.floor(progress * totalChars);

                        if (targetIdx > (data.lastPaintedIdx || 0)) {
                            for (let i = (data.lastPaintedIdx || 0); i < targetIdx; i++) {
                                const char = data.allChars[i];
                                const isTitle = data.titleChars.includes(char);
                                gsap.to(char, {
                                    color: isTitle ? COLOR_TITLE : COLOR_BODY,
                                    textShadow: SHADOW_GLOW,
                                    duration: 0.1,
                                    onComplete: () => { gsap.to(char, { textShadow: SHADOW_NONE, duration: 0.6 }); }
                                });
                            }
                            data.lastPaintedIdx = targetIdx;
                        }
                        if (data.numSpan && progress > 0.1) gsap.to(data.numSpan, { opacity: 1, duration: 0.5 });
                    }
                });
            });

            activateSlide(0);

            const stepsFill = document.getElementById('stepsProgressFill');
            if (stepsFill) {
                gsap.to(stepsFill, {
                    scaleX: 1, duration: 2.5, ease: "power2.inOut",
                    scrollTrigger: { trigger: ".steps-grid", start: "top 80%", toggleActions: "play none none none" }
                });
            }

        } else {
            // SEÇÃO MENU MOBILE
            const burger = document.getElementById('burgerToggle');
            const closeSidebar = document.getElementById('closeSidebar');
            const sidebar = document.getElementById('sidebarMenu');
            const sidebarLinks = document.querySelectorAll('.sidebar-link');

            if (burger && sidebar) {
                burger.addEventListener('click', () => sidebar.classList.add('active'));
            }

            if (closeSidebar && sidebar) {
                closeSidebar.addEventListener('click', () => sidebar.classList.remove('active'));
            }

            sidebarLinks.forEach(link => {
                link.addEventListener('click', () => sidebar.classList.remove('active'));
            });

            // SEÇÃO RECURSOS - MOBILE
            const featuresList = document.querySelector('.features-list');
            const items = gsap.utils.toArray('.feature-item');
            const slides = gsap.utils.toArray('.feature-slide');
            const pageNums = gsap.utils.toArray('.feat-page-num');
            const progressFill = document.getElementById('featProgressFill');
            const nextBtn = document.querySelector('.feat-next');
            const prevBtn = document.querySelector('.feat-prev');
            let currentIdx = 0;

            function updateCarousel(newIdx) {
                items.forEach(el => el.classList.remove('active-mobile'));
                slides.forEach(el => el.classList.remove('active'));
                pageNums.forEach(el => el.classList.remove('active'));

                currentIdx = (newIdx + items.length) % items.length;

                items[currentIdx].classList.add('active-mobile');
                slides[currentIdx].classList.add('active');
                pageNums[currentIdx].classList.add('active');

                // Animate Horizontal Slide of Texts
                if (featuresList && items[currentIdx]) {
                    const offset = -(items[currentIdx].offsetLeft - items[0].offsetLeft);
                    gsap.to(featuresList, { x: offset, duration: 0.5, ease: "power3.out" });
                }

                // Update Progress Bar
                if (progressFill) {
                    const progress = ((currentIdx + 1) / items.length) * 100;
                    gsap.to(progressFill, { width: `${progress}%`, duration: 0.5, ease: "power2.out" });
                }
            }

            if (nextBtn && prevBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    updateCarousel(currentIdx + 1);
                });
                prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    updateCarousel(currentIdx - 1);
                });
            }

            pageNums.forEach((num, idx) => {
                num.addEventListener('click', (e) => {
                    e.preventDefault();
                    updateCarousel(idx);
                });
            });

            updateCarousel(0);

            // MOBILE HERO ENTRANCE SEQUENCE
            const mobileEntryTl = gsap.timeline({ delay: 0.5 });
            mobileEntryTl
                .to(".m-headline", { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
                .to(".m-title", { opacity: 1, y: 0, duration: 1, ease: "back.out(1.7)" }, "-=0.4")
                .to(".m-subtitle", { opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.6")
                .from(".orb", { scale: 0, opacity: 0, duration: 2, stagger: 0.5, ease: "power2.out" }, 0);
        }

        if (isDesktop) {
            gsap.set("#hero-text-content", { opacity: 0 });
        }
    });

    // ANIMAÇÕES GLOBAIS
    gsap.utils.toArray('.reveal').forEach(el => {
        gsap.fromTo(el, { opacity: 0, y: 30 }, {
            opacity: 1, y: 0, duration: 1,
            scrollTrigger: { trigger: el, start: "top 85%" }
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                if (lenis) {
                    lenis.scrollTo(target);
                } else {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

