// Đăng ký plugin ScrollTrigger của GSAP
gsap.registerPlugin(ScrollTrigger);

// Hàm khóa cuộn để chống giật màn hình khi đang chạy animation
function lockScroll() { document.body.style.overflow = 'hidden'; }
function unlockScroll() { document.body.style.overflow = ''; }

// GOM TOÀN BỘ HIỆU ỨNG TRANG CHỦ VÀO MỘT HÀM
function initHomeAnimations() {
    // Reset lại ScrollTrigger mỗi lần vào lại trang
    ScrollTrigger.getAll().forEach(t => t.kill());

    // 1. Animation cho Hero Section
    const tlHero = gsap.timeline();
    tlHero.to(".hero-title", { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.2 })
          .to(".hero-subtitle", { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.8")
          .fromTo(".hero .btn", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }, "-=0.5");

    // 2. Animation cho phần Services
    gsap.to("#services .section-title", {
        scrollTrigger: { trigger: ".services", start: "top 80%" },
        opacity: 1, y: -20, duration: 1, ease: "power3.out"
    });
    gsap.to(".service-card", {
        scrollTrigger: { trigger: ".services", start: "top 70%" },
        y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "back.out(1.2)"
    });

    // 3. Animation cho phần Work (Dự án)
    gsap.to("#work .section-title", {
        scrollTrigger: { trigger: ".work", start: "top 80%" },
        opacity: 1, y: -20, duration: 1, ease: "power3.out"
    });
    const workItems = gsap.utils.toArray('.work-item');
    workItems.forEach((item) => {
        gsap.to(item, {
            scrollTrigger: { trigger: item, start: "top 85%", end: "bottom 20%", toggleActions: "play none none reverse" },
            y: 0, opacity: 1, duration: 1, ease: "power3.out"
        });
    });
}

// KHỞI TẠO BARBA
barba.init({
    sync: true, 

    // VIEWS: Quản lý vòng đời Javascript của từng trang
    views: [
        {
            namespace: 'home',
            afterEnter() {
                initHomeAnimations(); // Chạy lại animation khi quay về Home
            }
        },
        {
            namespace: 'work',
            afterEnter() {
                // Kích hoạt giao diện 3D khi vào trang Work
                if (typeof initWorkSpace === 'function') initWorkSpace();
            },
            beforeLeave() {
                // Tắt giao diện 3D để giải phóng bộ nhớ khi rời trang Work
                if (typeof killWorkSpace === 'function') killWorkSpace();
            }
        }
    ],

    transitions: [
        // 1. HIỆU ỨNG ĐI TIẾP (CLICK LINK)
        {
            name: 'slide-up-forward',
            custom({ action }) { return action !== 'back'; },
            before() { lockScroll(); },
            leave(data) {
                return gsap.to(data.current.container, {
                    y: -50, scale: 0.95, opacity: 0.3, duration: 0.7, ease: "power3.inOut"
                });
            },
            enter(data) {
                gsap.set(data.next.container, {
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
                    overflowY: 'auto', zIndex: 99, y: '100%'
                });
                return gsap.to(data.next.container, { y: '0%', duration: 0.7, ease: "power3.inOut" });
            },
            after(data) {
                gsap.set(data.next.container, { clearProps: 'all' });
                window.scrollTo(0, 0);
                unlockScroll();
            }
        },

        // 2. HIỆU ỨNG TRỞ VỀ (BẤM NÚT BACK)
        {
            name: 'slide-down-back',
            custom({ action }) { return action === 'back'; },
            before() { lockScroll(); },
            leave(data) {
                gsap.set(data.current.container, {
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 99
                });
                return gsap.to(data.current.container, { y: '100%', duration: 0.7, ease: "power3.inOut" });
            },
            enter(data) {
                gsap.set(data.next.container, {
                    position: 'relative', y: -50, scale: 0.95, opacity: 0.3, zIndex: 1
                });
                return gsap.to(data.next.container, { y: 0, scale: 1, opacity: 1, duration: 0.7, ease: "power3.inOut" });
            },
            after(data) {
                gsap.set(data.next.container, { clearProps: 'all' });
                unlockScroll();
            }
        }
    ]
});