export const TextureFactory = {
    createCanvas: (size) => {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        return { c, ctx: c.getContext('2d') };
    },
    
    noise: (ctx, w, h, opacity) => {
        const idata = ctx.getImageData(0,0,w,h);
        const data = idata.data;
        for(let i=0; i<data.length; i+=4) {
            const v = Math.random() * 255 * opacity;
            data[i] += v; data[i+1] += v; data[i+2] += v;
        }
        ctx.putImageData(idata, 0, 0);
    },

    wood: () => {
        const size = 512;
        const { c, ctx } = TextureFactory.createCanvas(size);
        ctx.fillStyle = '#3e2723'; ctx.fillRect(0,0,size,size);
        ctx.globalAlpha = 0.3;
        for(let i=0; i<150; i++) {
            ctx.strokeStyle = i%2===0 ? '#5d4037' : '#281a14';
            ctx.lineWidth = 1 + Math.random() * 4;
            ctx.beginPath();
            ctx.moveTo(0, Math.random()*size);
            ctx.bezierCurveTo(size/3, Math.random()*size, size*2/3, Math.random()*size, size, Math.random()*size);
            ctx.stroke();
        }
        TextureFactory.noise(ctx, size, size, 0.1);
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
    },

    metal: (isDark) => {
        const size = 512;
        const { c, ctx } = TextureFactory.createCanvas(size);
        ctx.fillStyle = isDark ? '#1a1a1a' : '#555555'; ctx.fillRect(0,0,size,size);
        ctx.globalAlpha = 0.1; ctx.strokeStyle = '#ffffff';
        for(let i=0; i<400; i++) {
            ctx.lineWidth = 0.5; ctx.beginPath();
            const x = Math.random()*size; const y = Math.random()*size;
            ctx.moveTo(x, y); ctx.lineTo(x + (Math.random()-0.5)*50, y + (Math.random()-0.5)*10);
            ctx.stroke();
        }
        TextureFactory.noise(ctx, size, size, 0.05);
        return new THREE.CanvasTexture(c);
    },

    concrete: () => {
        const size = 512;
        const { c, ctx } = TextureFactory.createCanvas(size);
        ctx.fillStyle = '#888888'; ctx.fillRect(0,0,size,size);
        //Heavy noise for aggregate
        TextureFactory.noise(ctx, size, size, 0.4); 
        // Cracks
        ctx.strokeStyle = '#444444'; ctx.lineWidth = 1; ctx.globalAlpha = 0.5;
        for(let i=0; i<20; i++) {
             ctx.beginPath(); ctx.moveTo(Math.random()*size, Math.random()*size);
             for(let j=0; j<5; j++) ctx.lineTo(Math.random()*size, Math.random()*size);
             ctx.stroke();
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(20, 20);
        return tex;
    },

    brick: () => {
        const size = 512;
        const { c, ctx } = TextureFactory.createCanvas(size);
        ctx.fillStyle = '#301510'; ctx.fillRect(0,0,size,size); // Grout
        ctx.fillStyle = '#56302a'; // Brick color
        const brickW = 64; const brickH = 32;
        for(let y=0; y<size; y+=brickH+2) {
            const offset = (y/(brickH+2))%2 === 0 ? 0 : brickW/2;
            for(let x=-brickW; x<size; x+=brickW+2) {
                ctx.fillRect(x+offset, y, brickW, brickH);
            }
        }
        TextureFactory.noise(ctx, size, size, 0.2);
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(10, 5);
        return tex;
    },

    grid: () => {
        const size = 1024;
        const { c, ctx } = TextureFactory.createCanvas(size);
        ctx.fillStyle = '#080808'; ctx.fillRect(0,0,size,size); // Darker floor
        TextureFactory.noise(ctx, size, size, 0.2);
        ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.globalAlpha = 1.0;
        const step = 128; // Bigger grid
        for(let i=0; i<=size; i+=step) {
            ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,size); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(size,i); ctx.stroke();
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(50, 50);
        return tex;
    },

    // Procedural Bullet Hole
    impact: () => {
        const size = 128;
        const { c, ctx } = TextureFactory.createCanvas(size);
        // Alpha mask
        ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.clearRect(0,0,size,size);
        
        // Cracks
        ctx.beginPath();
        ctx.arc(64,64, 20, 0, Math.PI*2);
        ctx.fillStyle = '#050505'; ctx.fill();
        
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        for(let i=0; i<12; i++) {
            ctx.beginPath(); ctx.moveTo(64,64);
            ctx.lineTo(64 + Math.cos(i)*40 + (Math.random()-0.5)*10, 64 + Math.sin(i)*40 + (Math.random()-0.5)*10);
            ctx.stroke();
        }
        return new THREE.CanvasTexture(c);
    }
};

