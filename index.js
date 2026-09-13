gsap.registerPlugin(ScrollTrigger);


// ==========================================
// ĐIỀU KHIỂN HAMBURGER MENU (MOBILE)
// ==========================================
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    // Bật/tắt menu khi bấm vào nút
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Tự động đóng menu khi bấm vào 1 link bất kỳ để chuyển trang
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

function applyScrollState(namespace) {
    if (namespace === 'home') {
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';
    } else if (namespace === 'work') {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100%';
    }
}

const currentContainer = document.querySelector('[data-barba="container"]');
if (currentContainer) applyScrollState(currentContainer.getAttribute('data-barba-namespace'));

function lockScrollTemporarily() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
}

let homeTextRotatorInterval;
let canvasAnimationId;

// ==========================================
// HÀM XOAY CHỮ (FIX LỖI CHỒNG CHỮ KHI ĐỔI TAB)
// ==========================================
function startTextRotator() {
    const words = document.querySelectorAll('.text-rotator .word');
    if (words.length === 0) return;
    
    let currentIndex = 0;
    gsap.set(words, { y: '100%', opacity: 0 });
    gsap.set(words[0], { y: '0%', opacity: 1 });

    if (homeTextRotatorInterval) clearInterval(homeTextRotatorInterval);

    homeTextRotatorInterval = setInterval(() => {
        // NGỪNG CHẠY NẾU USER ĐANG Ở TAB KHÁC (Chống lag chồng chữ)
        if (document.hidden) return; 

        const currentWord = words[currentIndex];
        currentIndex = (currentIndex + 1) % words.length;
        const nextWord = words[currentIndex];

        const tl = gsap.timeline();
        tl.to(currentWord, { y: '-100%', opacity: 0, duration: 0.6, ease: "power3.inOut" })
          .fromTo(nextWord, { y: '100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.6, ease: "power3.inOut" }, "-=0.4");
    }, 2500); 
}

// ==========================================
// BACKGROUND TƯƠNG TÁC (CANVAS PARTICLES)
// ==========================================
function initInteractiveCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    setCanvasSize();

    let particlesArray = [];
    const mouse = { x: null, y: null, radius: 150 }; 

    // Lắng nghe chuột TRỰC TIẾP trên cửa sổ
    window.addEventListener('mousemove', function(event) {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    window.addEventListener('mouseout', function() {
        mouse.x = undefined; mouse.y = undefined;
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x; this.y = y;
            this.directionX = directionX; this.directionY = directionY;
            this.size = size; this.color = color;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = '#ff4a32'; 
            ctx.fill();
        }
        update() {
            if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
            if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            // Xử lý né chuột
            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) this.x += 3;
                if (mouse.x > this.x && this.x > this.size * 10) this.x -= 3;
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) this.y += 3;
                if (mouse.y > this.y && this.y > this.size * 10) this.y -= 3;
            }
            this.x += this.directionX; this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 10000; // Tăng mật độ hạt lên chút
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 1.5) - 0.75;
            let directionY = (Math.random() * 1.5) - 0.75;
            particlesArray.push(new Particle(x, y, directionX, directionY, size, '#ff4a32'));
        }
    }

    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                             + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 15000); // Làm tia sáng rõ hơn
                    ctx.strokeStyle = `rgba(255, 74, 50, ${opacityValue})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        canvasAnimationId = requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }
    
    init(); animate();

    window.addEventListener('resize', function() {
        setCanvasSize();
        init();
    });
}

// ==========================================
// HIỆU ỨNG LOADING VÀ TRANG CHỦ
// ==========================================
function initHomeAnimations() {
    ScrollTrigger.getAll().forEach(t => t.kill());

    // Dọn dẹp rác khi quay về từ Work
    if (homeTextRotatorInterval) clearInterval(homeTextRotatorInterval); 
    if (canvasAnimationId) cancelAnimationFrame(canvasAnimationId); 

    // KHỞI ĐỘNG MẠNG LƯỚI HẠT NGAY LẬP TỨC
    initInteractiveCanvas();

    const preloader = document.querySelector('.home-preloader');
    const loaderText = document.getElementById('loader-text');
    
    if (loaderText && !loaderText.classList.contains('splitted')) {
        const text = loaderText.innerText;
        loaderText.innerHTML = '';
        text.split('').forEach(char => {
            const inner = document.createElement('span');
            inner.className = 'char-inner';
            inner.innerText = char === ' ' ? '\u00A0' : char;
            inner.style.display = 'inline-block'; 
            loaderText.appendChild(inner);
        });
        loaderText.classList.add('splitted');
    }

    const tlHero = gsap.timeline();

    // Loại bỏ code cản lăn chuột cũ (vì đã xóa 3D Spline)

   if (preloader) {
        gsap.set(preloader, { y: '0%', display: 'flex' });
        
        gsap.set('.char-inner', { 
            y: '100vh', 
            opacity: 0,
            scaleY: 2, 
            filter: 'blur(10px)',
            textShadow: '0px 80px 30px rgba(255, 255, 255, 0.8)' 
        }); 
        
        tlHero.to('.char-inner', {
            y: 0,
            opacity: 1,
            scaleY: 1,
            filter: 'blur(0px)',
            textShadow: '0px 0px 0px rgba(255, 255, 255, 0)',
            duration: 1.2,
            stagger: 0.05, 
            ease: "expo.out", 
            delay: 0.1
        })
        .to(preloader, {
            y: '-100%', 
            duration: 1.2,
            ease: "power4.inOut",
            // FIX LỖI TOUCH MOBILE: Ép ẩn hoàn toàn khối này khỏi DOM sau khi chạy xong
            onComplete: () => { 
                gsap.set(preloader, { display: 'none', pointerEvents: 'none' }); 
            } 
        }, "+=0.4"); 
    }

    setTimeout(startTextRotator, 1500);

    const heroElements = document.querySelectorAll(".hero-left, .hero-right");
    if (heroElements.length > 0) {
        tlHero.fromTo(heroElements, 
            { y: 100, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power4.out" }, 
            "-=0.9" 
        );
    }

    // Các ScrollTrigger (Giữ nguyên)
    gsap.to("#services .section-title", {
        scrollTrigger: { trigger: ".services", start: "top 80%" },
        opacity: 1, y: -20, duration: 1, ease: "power3.out"
    });
    gsap.to(".service-card", {
        scrollTrigger: { trigger: ".services", start: "top 70%" },
        y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "back.out(1.2)"
    });
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


    // ==========================================
    // HIỆU ỨNG TEXT SCRUB (WHO WE ARE)
    // ==========================================
    const scrubText = document.querySelector('.scrub-text');
    
    // 1. Cắt đoạn văn thành từng từ (Word) bọc trong thẻ <span>
    if (scrubText && !scrubText.classList.contains('splitted')) {
        const words = scrubText.innerText.split(' ');
        scrubText.innerHTML = '';
        words.forEach(word => {
            const span = document.createElement('span');
            span.className = 'scrub-word';
            span.innerText = word;
            scrubText.appendChild(span);
        });
        scrubText.classList.add('splitted');
    }

   // ==========================================
    // HIỆU ỨNG TEXT SCRUB (WHO WE ARE)
    // Kéo dải gradient chéo sang trái để lộ màu trắng
    // ==========================================
    gsap.to('.scrub-text', {
        scrollTrigger: {
            trigger: '.who-we-are',
            
            /* ĐIỀU CHỈNH LẠI HÀNH TRÌNH CUỘN */
            start: 'top 85%', // Bắt đầu trễ hơn (khi khung vừa nhú lên 85% màn hình)
            end: 'bottom 60%', // Kết thúc muộn hơn nhiều, bắt buộc phải cuộn sâu xuống dưới mới sáng hết
            
            scrub: 2.5 // Tăng độ "nặng". Số càng to, màu chạy theo cuộn chuột càng có độ trễ và đầm chắc.
        },
        backgroundPositionX: '0%', 
        ease: "none" 
    });
}

// ==========================================
// CẤU HÌNH BARBA.JS THÔNG MINH
// ==========================================
barba.init({
    sync: true, 
    views: [
        {
            namespace: 'home',
            afterEnter() { initHomeAnimations(); }
        },
        {
            namespace: 'work',
            afterEnter() { if (typeof initWorkSpace === 'function') initWorkSpace(); },
            beforeLeave() { if (typeof killWorkSpace === 'function') killWorkSpace(); }
        }
    ],
    transitions: [
        {
            name: 'to-work-transition',
            to: { namespace: ['work'] },
            before() { 
                lockScrollTemporarily(); 
                if (homeTextRotatorInterval) clearInterval(homeTextRotatorInterval); 
                // Xóa vòng lặp Canvas để trang Work không bị nặng
                if (canvasAnimationId) cancelAnimationFrame(canvasAnimationId); 
            },
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
                applyScrollState('work'); 
            }
        },
        {
            name: 'to-home-transition',
            to: { namespace: ['home'] },
            before(data) { 
                lockScrollTemporarily();
                const nextPreloader = data.next.container.querySelector('.home-preloader');
                
                // SỬA LỖI Ở ĐÂY: Dùng querySelectorAll để lấy toàn bộ cả trái và phải
                const nextHero = data.next.container.querySelectorAll('.hero-left, .hero-right'); 
                
                if (nextPreloader) gsap.set(nextPreloader, { y: '0%', display: 'flex', opacity: 1, pointerEvents: 'auto' });
                
                // SỬA LỖI Ở ĐÂY: Ẩn toàn bộ mảng nextHero
                if (nextHero.length > 0) gsap.set(nextHero, { opacity: 0 }); 
            }, 
            leave(data) {
                return gsap.to(data.current.container, { opacity: 0, duration: 0.2 });
            },
            enter(data) {
                gsap.set(data.next.container, { position: 'relative', opacity: 1, zIndex: 1 });
            },
            after(data) {
                gsap.set(data.next.container, { clearProps: 'all' });
                applyScrollState('home'); 
            }
        }
    ]
});


