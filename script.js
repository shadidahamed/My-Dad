document.addEventListener("DOMContentLoaded", () => {
    
    // --- THREE.JS INITIALIZATION ---
    const container = document.getElementById('three-canvas');
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    
    // Camera with distinct depth perspective matrix 
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ canvas: container, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Array logic to hold target vertices matching the mathematical equation
    const heartVertices = [];
    const totalPoints = 450; 

    // Generate accurate mathematical trace trajectory vectors
    for (let i = 0; i < totalPoints; i++) {
        const t = (i / totalPoints) * Math.PI * 2;
        
        // Equation mapping
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        const z = (Math.random() - 0.5) * 1.5; // Slight Z depth separation

        // Normalized down to viewport match coordinates
        heartVertices.push(new THREE.Vector3(x * 0.42, y * 0.42, z));
    }

    // Creating discrete dynamic points for sequential generation loop
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(totalPoints * 3);
    const progressRates = new Float32Array(totalPoints);

    // Initializing particle generation field origins at starting vector coordinates [0]
    for(let i=0; i<totalPoints; i++) {
        positions[i*3] = heartVertices[0].x;
        positions[i*3+1] = heartVertices[0].y;
        positions[i*3+2] = heartVertices[0].z;
        progressRates[i] = 0;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom textured material shader effect for high-end particle aesthetic
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xff2a74,
        size: 0.28,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // --- ANIMATION SEQUENCE LOGIC (GSAP + RAF) ---
    let constructionProgress = 0;
    let animationComplete = false;

    // Smooth entry timeline orchestration
    const introTimeline = gsap.timeline();
    
    // Animate the construction progress variable
    introTimeline.to({val: 0}, {
        val: 1,
        duration: 4.5,
        ease: "power2.inOut",
        onUpdate: function() {
            constructionProgress = this.targets()[0].val;
        },
        onComplete: () => {
            animationComplete = true;
            revealPhotoFrame();
        }
    });

    function animate() {
        requestAnimationFrame(animate);

        const currentPositions = particleGeometry.attributes.position.array;

        for (let i = 0; i < totalPoints; i++) {
            // Sequential delay mechanism based on index position around the ring
            const targetActivationIndex = totalPoints * constructionProgress;
            
            if (i < targetActivationIndex) {
                // Point calculation interpolation
                currentPositions[i * 3] = THREE.MathUtils.lerp(currentPositions[i * 3], heartVertices[i].x, 0.08);
                currentPositions[i * 3 + 1] = THREE.MathUtils.lerp(currentPositions[i * 3 + 1], heartVertices[i].y, 0.08);
                currentPositions[i * 3 + 2] = THREE.MathUtils.lerp(currentPositions[i * 3 + 2], heartVertices[i].z, 0.08);
            }
        }
        
        particleGeometry.attributes.position.needsUpdate = true;

        // Micro ambient rotational physics
        if(animationComplete) {
            particleSystem.rotation.y = Math.sin(Date.now() * 0.001) * 0.08;
            particleSystem.rotation.x = Math.cos(Date.now() * 0.0008) * 0.05;
        } else {
            particleSystem.rotation.y = Date.now() * 0.0002;
        }

        renderer.render(scene, camera);
    }
    
    animate();

    // --- REVEAL INTERACTIVE ELEMENTS ---
    function revealPhotoFrame() {
        const frame = document.getElementById('heartFrame');
        const photo = document.querySelector('.family-photo');
        const btn = document.getElementById('btnProceed');

        // Cinematic frame fade in mimicking a professional production pipeline
        gsap.to(frame, {
            opacity: 1,
            scale: 1,
            rotationY: 0,
            duration: 1.8,
            ease: "power3.out"
        });

        // Ken Burns premium zoom interpolation
        gsap.to(photo, {
            scale: 1.0,
            duration: 8,
            ease: "power1.out"
        });

        // Smooth button reveal
        gsap.to(btn, {
            opacity: 1,
            translateY: 0,
            duration: 1,
            delay: 0.5,
            ease: "back.out(1.7)"
        });
    }

    // --- VIEW SWITCHING MANAGER ---
    document.getElementById('btnProceed').addEventListener('click', () => {
        const stageOne = document.getElementById('stage-one');
        const stageTwo = document.getElementById('stage-two');

        // Master UI Transition Sequence
        gsap.to(stageOne, {
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            ease: "power3.inOut",
            onComplete: () => {
                stageOne.classList.add('hidden');
                stageTwo.classList.remove('hidden');
                
                // Animate card layout entries inside next viewport block
                gsap.to('.glass-card', {
                    opacity: 1,
                    translateY: 0,
                    duration: 1.2,
                    ease: "power4.out"
                });
            }
        });
    });

    // Window Resize Handler
    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
});
