let workAnimationId; 
// Object chứa các hàm sự kiện để dễ dàng remove
const workEvents = {}; 

window.toggleMenu = function(isOpen) {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    if(!menu || !overlay) return;
    
    if (isOpen) {
        menu.classList.add('active');
        overlay.classList.add('active');
    } else {
        menu.classList.remove('active');
        overlay.classList.remove('active');
    }
};
// ==========================================
// HÀM KHỞI TẠO KHÔNG GIAN 3D (CHẠY KHI VÀO TRANG WORK)
// ==========================================
function initWorkSpace() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return; // Thoát nếu không tìm thấy DOM (Bảo vệ code)

    const viewport = document.getElementById('viewport');
    const menuListContainer = document.getElementById('menu-list-container');
    const uiX = document.getElementById('ui-x');
    const uiY = document.getElementById('ui-y');
    const uiCursor = document.getElementById('ui-cursor');
    
    // Reset rác bộ nhớ DOM cũ (phòng khi vào lại)
    canvas.innerHTML = '';
    menuListContainer.innerHTML = '';

    const myProjects = [
      { title: "E-COMMERCE APP", category: "Web Dev", img: "https://picsum.photos/seed/101/600/800" },
      { title: "FINSNAP UI", category: "App Design", img: "https://picsum.photos/seed/102/600/800" },
      { title: "MARIS MUSE", category: "Branding", img: "https://picsum.photos/seed/103/600/800" },
      { title: "DASHBOARD PRO", category: "UX/UI", img: "https://picsum.photos/seed/104/600/800" },
      { title: "SMART RETAIL", category: "Template", img: "https://picsum.photos/seed/105/600/800" },
      { title: "CRYPTO WALLET", category: "App Design", img: "https://picsum.photos/seed/106/600/800" },
      { title: "AGENCY PORTFOLIO", category: "Web Dev", img: "https://picsum.photos/seed/107/600/800" },
      { title: "AI GENERATOR UI", category: "UX/UI", img: "https://picsum.photos/seed/108/600/800" },
      ...Array.from({ length: 18 }, (_, i) => ({
        title: `PROJECT FW-${String(i + 6).padStart(2, '0')}`,
        category: "Concept",
        img: `https://picsum.photos/seed/${i + 200}/600/800`
      }))
    ];

    const TOTAL_ITEMS = myProjects.length;
    document.getElementById('project-counter').innerText = TOTAL_ITEMS;

    const isMobile = window.innerWidth <= 768;
    const GAP_X = isMobile ? 270 : 440; 
    const GAP_Y = isMobile ? 400 : 600; 

    let rows = isMobile 
      ? Math.max(3, Math.ceil(Math.sqrt(TOTAL_ITEMS * 1.2))) 
      : Math.max(2, Math.round(Math.sqrt(TOTAL_ITEMS * 0.6)));
    let cols = Math.ceil(TOTAL_ITEMS / rows);

    const BOUND_X = ((cols - 1) / 2) * GAP_X + GAP_X * 0.5; 
    const BOUND_Y = ((rows - 1) / 2) * GAP_Y + GAP_Y * 0.8;

    const items = [];
    const startX = -((cols - 1) * GAP_X) / 2;
    let count = 0;

    window.jumpToProject = function(baseX, baseY) {
      targetX = -baseX;
      targetY = -baseY;
      vx = 0; vy = 0; 
      window.toggleMenu(false);
    }

    // RENDER ITEMS
    for (let c = 0; c < cols; c++) {
      const x = startX + c * GAP_X;
      const yOffset = (c % 2 !== 0) ? (GAP_Y * 0.5) : 0;
      const startY = -((rows - 1) * GAP_Y) / 2 + yOffset;
      
      for (let r = 0; r < rows; r++) {
        if(count >= TOTAL_ITEMS) break;

        const y = startY + r * GAP_Y;
        const projectData = myProjects[count];
        const idx = String(count + 1).padStart(2, '0');
        
        // 1. 3D CARD
        const el = document.createElement('div');
        el.className = 'project';
        el.innerHTML = `
          <div class="img-wrap"><img src="${projectData.img}" draggable="false" /></div>
          <div class="project-info">
            <div>
              <h3>${projectData.title}</h3>
              <p>${projectData.category} / COORD [${Math.round(x)}, ${Math.round(y)}]</p>
            </div>
          </div>
        `;
        canvas.appendChild(el);
        items.push({ el, img: el.querySelector('img'), baseX: x, baseY: y });

        // 2. MENU ITEM
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
          <div class="menu-item-left">
            <img class="menu-thumb" src="${projectData.img}" alt="${projectData.title}" draggable="false" />
            <div>
              <h4>${projectData.title}</h4>
              <p>${projectData.category}</p>
            </div>
          </div>
          <div class="idx">FW-${idx}</div>
        `;
        menuItem.onclick = () => window.jumpToProject(x, y);
        menuListContainer.appendChild(menuItem);

        count++;
      }
    }

    // STATE VẬT LÝ (Phải reset mỗi khi vào hàm)
    let isDragging = false;
    let targetX = 0, targetY = 0, dragX = 0, dragY = 0; 
    let currentImgX = 0, currentImgY = 0, vx = 0, vy = 0; 
    let lastMouseX = 0, lastMouseY = 0, lastDragX = 0, lastDragY = 0;
    const friction = 0.94, sensitivity = isMobile ? 1.0 : 0.8, flowFactor = 0.08; 

    // HÀM RENDER FRAME
    function render() {
      if (!isDragging) {
        vx *= friction; vy *= friction;
        targetX += vx; targetY += vy;
      }
      if (targetX > BOUND_X) { targetX = BOUND_X; vx *= -0.2; }
      if (targetX < -BOUND_X) { targetX = -BOUND_X; vx *= -0.2; }
      if (targetY > BOUND_Y) { targetY = BOUND_Y; vy *= -0.2; }
      if (targetY < -BOUND_Y) { targetY = -BOUND_Y; vy *= -0.2; }

      dragX += (targetX - dragX) * flowFactor;
      dragY += (targetY - dragY) * flowFactor;
      uiX.innerText = (-dragX).toFixed(1);
      uiY.innerText = (dragY).toFixed(1);
      
      const cursorPercent = ((dragX + BOUND_X) / (BOUND_X * 2)) * 100;
      uiCursor.style.left = `${Math.min(100, Math.max(0, 100 - cursorPercent))}%`;

      let renderVx = dragX - lastDragX;
      let renderVy = dragY - lastDragY;
      lastDragX = dragX; lastDragY = dragY;

      let targetImgX = Math.max(-40, Math.min(40, -renderVx * 2.5));
      let targetImgY = Math.max(-40, Math.min(40, -renderVy * 2.5));
      currentImgX += (targetImgX - currentImgX) * 0.15;
      currentImgY += (targetImgY - currentImgY) * 0.15;

      const sphereRadius = Math.max(window.innerWidth, window.innerHeight) * (isMobile ? 1.2 : 1.5);

      items.forEach(item => {
        let localX = item.baseX + dragX;
        let localY = item.baseY + dragY;
        const dist = Math.sqrt(localX * localX + localY * localY);
        let z = 0, rotateX = 0, rotateY = 0, opacity = 1;

        if (dist < sphereRadius) {
          z = Math.sqrt(Math.pow(sphereRadius, 2) - Math.pow(dist, 2)) - sphereRadius;
          rotateX = -(localY / sphereRadius) * 40; 
          rotateY = (localX / sphereRadius) * 40;
          
          const edgeThreshold = sphereRadius * 0.6;
          if (dist > edgeThreshold) {
            const falloff = (dist - edgeThreshold) / (sphereRadius - edgeThreshold);
            opacity = Math.max(0.1, 1 - Math.pow(falloff, 1.5));
          }
        } else { opacity = 0; }

        item.el.style.display = opacity <= 0.05 ? 'none' : 'flex';
        item.el.style.opacity = opacity;
        item.el.style.transform = `translate3d(${localX}px, ${localY}px, ${z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        item.img.style.transform = `scale(1.2) translate3d(${currentImgX}px, ${currentImgY}px, 0)`;
      });
      
      workAnimationId = requestAnimationFrame(render);
    }
    render();

    // SỰ KIỆN KÉO THẢ (Đã gán vào biến để hủy)
    const startDrag = (x, y) => {
      if(document.getElementById('side-menu').classList.contains('active')) return;
      isDragging = true; lastMouseX = x; lastMouseY = y; vx = 0; vy = 0; 
      viewport.style.cursor = 'grabbing';
    };
    const onDrag = (x, y) => {
      if (!isDragging) return;
      const dx = (x - lastMouseX) * sensitivity;
      const dy = (y - lastMouseY) * sensitivity;
      targetX += dx; targetY += dy; vx = dx; vy = dy;
      lastMouseX = x; lastMouseY = y;
    };
    const endDrag = () => { isDragging = false; viewport.style.cursor = 'grab'; };

    // Gán hàm vào biến toàn cục
    handleMouseDown = (e) => startDrag(e.clientX, e.clientY);
    handleMouseMove = (e) => onDrag(e.clientX, e.clientY);
    handleMouseUp = endDrag;
    handleMenuTouchMove = (e) => e.stopPropagation();
    handleTouchStart = (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY);
    handleTouchMove = (e) => onDrag(e.touches[0].clientX, e.touches[0].clientY);
    handleTouchEnd = endDrag;

    // Lắng nghe sự kiện
    viewport.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseUp);
    document.getElementById('side-menu').addEventListener('touchmove', handleMenuTouchMove);
    viewport.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
}

// ==========================================
// HÀM DỌN DẸP RÁC (CHẠY TRƯỚC KHI RỜI TRANG WORK)
// ==========================================
function killWorkSpace() {
    // 1. Tắt vòng lặp render 3D
    if (workAnimationId) {
        cancelAnimationFrame(workAnimationId);
    }
    
    const viewport = document.getElementById('viewport');
    const sideMenu = document.getElementById('side-menu');
    
    // 2. Gỡ bỏ sự kiện (Nếu không gỡ, sang trang chủ di chuột nó vẫn báo lỗi)
    if(viewport) {
        viewport.removeEventListener('mousedown', handleMouseDown);
        viewport.removeEventListener('touchstart', handleTouchStart);
    }
    if(sideMenu) {
        sideMenu.removeEventListener('touchmove', handleMenuTouchMove);
    }
    
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('mouseleave', handleMouseUp);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
}