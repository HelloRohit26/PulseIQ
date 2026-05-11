// --- 1. SETUP THE CANVAS ---
const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');
const rightPanel = document.querySelector('.right-panel');

// Canvas ka size right panel ke barabar set karna
function resizeCanvas() {
    canvas.width = rightPanel.clientWidth;
    canvas.height = rightPanel.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); 

// --- 2. RAIN PARTICLES ---
let drops = [];
const numDrops = 100; // Halka aur smooth effect ke liye

for (let i = 0; i < numDrops; i++) {
    drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        velocity: Math.random() * 3 + 2, // Speed
        len: Math.random() * 15 + 10,    // FIXED: Drop ki lambaai
        opacity: Math.random() * 0.3 + 0.1 // Halki visibility
    });
}

// --- 3. ANIMATION LOOP ---
function drawRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.lineCap = 'round';

    for (let i = 0; i < drops.length; i++) {
        let d = drops[i];
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${d.opacity})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.len); // Vertical drop
        ctx.stroke();

        // Drop ko neeche move karo
        d.y += d.velocity;

        // Agar drop screen se bahar jaye toh wapas upar bhejo
        if (d.y > canvas.height) {
            d.y = -d.len; 
            d.x = Math.random() * canvas.width;
        }
    }
    
    // --- 4. WATER RIPPLE / CHHITE EFFECT ---
    if (Math.random() > 0.95) { // Random timing par chhite padenge
        const splashX = Math.random() * canvas.width; 
        const splashY = Math.random() * canvas.height;
        
        ctx.strokeStyle = 'rgba(102, 217, 239, 0.4)'; // Cyan color ki ripple
        ctx.beginPath();
        // Chota circle banayega jo boond girne jaisa lagega
        ctx.arc(splashX, splashY, Math.random() * 4 + 2, 0, Math.PI * 2);
        ctx.stroke();
    }

    requestAnimationFrame(drawRain); 
}

// Engine start karo
drawRain();