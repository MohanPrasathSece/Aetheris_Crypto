import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { playGlitchAudio, playTickSound, playRestoreSound } from '../utils/audioUtils';

export default function ThreeBackground({ isDestructMode, onDestructComplete }) {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const destructModeRef = useRef(isDestructMode);

    useEffect(() => {
        destructModeRef.current = isDestructMode;
    }, [isDestructMode]);

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        let scene, camera, renderer;
        let bitcoinGroup;
        let particlesGeometry, particlesMesh;
        let particlesCount = 800;
        let particleVelocityArray = [];
        let targetCameraY = 0;
        let targetCameraX = 0;
        let animationFrameId;

        function initThreeJS() {
            const width = window.innerWidth;
            const height = window.innerHeight;

            scene = new THREE.Scene();
            sceneRef.current = scene;
            scene.fog = new THREE.FogExp2(0x06060c, 0.012);

            camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
            camera.position.z = 8;
            camera.position.y = 0;

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(width, height);
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.05;
            container.appendChild(renderer.domElement);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);
            scene.add(ambientLight);

            const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
            dirLight1.position.set(5, 5, 4);
            scene.add(dirLight1);

            const cyanLight = new THREE.PointLight(0x00f2fe, 3.5, 15);
            cyanLight.position.set(-4, -3, 2);
            cyanLight.userData.isCyan = true;
            scene.add(cyanLight);

            const purpleLight = new THREE.PointLight(0x7f00ff, 4.0, 15);
            purpleLight.position.set(-3, 3, 2);
            purpleLight.userData.isPurple = true;
            scene.add(purpleLight);

            createBitcoinModel();
            createParticles();

            const handleMouseMove = (e) => {
                if (!destructModeRef.current) {
                    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
                    const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
                    targetCameraX = mouseX * 0.6;
                    targetCameraY = mouseY * 0.5;
                }
            };
            window.addEventListener('mousemove', handleMouseMove);

            const handleResize = () => {
                const w = window.innerWidth;
                const h = window.innerHeight;
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);

                if (bitcoinGroup) {
                    if (w < 1024) {
                        bitcoinGroup.position.set(0, 0.8, -1);
                        bitcoinGroup.scale.set(0.85, 0.85, 0.85);
                    } else {
                        bitcoinGroup.position.set(2.2, 0, 0);
                        bitcoinGroup.scale.set(1, 1, 1);
                    }
                }
            };
            window.addEventListener('resize', handleResize);

            animate();

            // Setup listeners for custom events to trigger destruct/restore
            window.addEventListener('trigger-destruct', executeDestruct);
            window.addEventListener('trigger-restore', executeRestore);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('trigger-destruct', executeDestruct);
                window.removeEventListener('trigger-restore', executeRestore);
                cancelAnimationFrame(animationFrameId);
                renderer.dispose();
                container.innerHTML = '';
            };
        }

        function createBitcoinModel() {
            bitcoinGroup = new THREE.Group();

            const goldFaceMaterial = new THREE.MeshStandardMaterial({
                color: 0xf4b728,
                metalness: 0.95,
                roughness: 0.12,
                roughnessMap: null
            });

            const goldCoreMaterial = new THREE.MeshStandardMaterial({
                color: 0xe09e0a,
                metalness: 0.85,
                roughness: 0.25
            });

            const cylinderGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.15, 64);
            const cylinderMesh = new THREE.Mesh(cylinderGeo, goldFaceMaterial);
            cylinderMesh.rotation.x = Math.PI / 2;
            bitcoinGroup.add(cylinderMesh);

            const rimGeo = new THREE.TorusGeometry(1.5, 0.08, 12, 64);
            const rimMesh = new THREE.Mesh(rimGeo, goldCoreMaterial);
            rimMesh.position.z = 0.08;
            bitcoinGroup.add(rimMesh);

            const rimMeshBack = rimMesh.clone();
            rimMeshBack.position.z = -0.08;
            bitcoinGroup.add(rimMeshBack);

            const notchGeo = new THREE.TorusGeometry(1.3, 0.025, 8, 48);
            const notchMesh = new THREE.Mesh(notchGeo, goldCoreMaterial);
            notchMesh.position.z = 0.07;
            bitcoinGroup.add(notchMesh);
            
            const notchMeshBack = notchMesh.clone();
            notchMeshBack.position.z = -0.07;
            bitcoinGroup.add(notchMeshBack);

            const emblemGroup = new THREE.Group();

            const barGeo = new THREE.BoxGeometry(0.24, 1.1, 0.12);
            const barMesh = new THREE.Mesh(barGeo, goldFaceMaterial);
            barMesh.position.set(-0.25, 0, 0.08);
            emblemGroup.add(barMesh);

            const topLoopGeo = new THREE.TorusGeometry(0.28, 0.12, 12, 24, Math.PI * 1.1);
            const topLoop = new THREE.Mesh(topLoopGeo, goldFaceMaterial);
            topLoop.position.set(-0.1, 0.24, 0.08);
            topLoop.rotation.z = -Math.PI / 2;
            emblemGroup.add(topLoop);

            const bottomLoopGeo = new THREE.TorusGeometry(0.32, 0.12, 12, 24, Math.PI * 1.15);
            const bottomLoop = new THREE.Mesh(bottomLoopGeo, goldFaceMaterial);
            bottomLoop.position.set(-0.1, -0.26, 0.08);
            bottomLoop.rotation.z = -Math.PI / 2;
            emblemGroup.add(bottomLoop);

            const hashGeo = new THREE.BoxGeometry(0.12, 0.25, 0.12);
            const hash1 = new THREE.Mesh(hashGeo, goldFaceMaterial);
            hash1.position.set(-0.14, 0.62, 0.08);
            emblemGroup.add(hash1);

            const hash2 = hash1.clone();
            hash2.position.set(0.08, 0.62, 0.08);
            emblemGroup.add(hash2);

            const hash3 = hash1.clone();
            hash3.position.y = -0.64;
            emblemGroup.add(hash3);

            const hash4 = hash2.clone();
            hash4.position.y = -0.64;
            emblemGroup.add(hash4);

            bitcoinGroup.add(emblemGroup);

            const emblemGroupBack = emblemGroup.clone();
            emblemGroupBack.position.z = -0.16;
            emblemGroupBack.rotation.y = Math.PI;
            bitcoinGroup.add(emblemGroupBack);

            bitcoinGroup.position.set(2.2, 0, 0);
            bitcoinGroup.rotation.y = 0.3;
            
            if (window.innerWidth < 1024) {
                bitcoinGroup.position.set(0, 0.8, -1);
                bitcoinGroup.scale.set(0.85, 0.85, 0.85);
            }

            scene.add(bitcoinGroup);
        }

        function createParticles() {
            particlesGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particlesCount * 3);
            const colors = new Float32Array(particlesCount * 3);

            for (let i = 0; i < particlesCount * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 25; 
                positions[i + 1] = (Math.random() - 0.5) * 15; 
                positions[i + 2] = (Math.random() - 0.5) * 15;

                colors[i] = 0.5 + Math.random() * 0.5;
                colors[i + 1] = 0.8 + Math.random() * 0.2;
                colors[i + 2] = 1.0;
            }

            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const particleTexture = createCircularTexture();

            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.12,
                map: particleTexture,
                vertexColors: true,
                transparent: true,
                opacity: 0.75,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particlesMesh);
        }

        function createCircularTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.3, 'rgba(0, 242, 254, 0.8)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(8, 8, 8, 0, Math.PI * 2);
            ctx.fill();

            return new THREE.CanvasTexture(canvas);
        }

        function executeDestruct() {
            if (destructModeRef.current) return;
            destructModeRef.current = true;
            playGlitchAudio();

            particleVelocityArray = [];
            bitcoinGroup.children.forEach(() => {
                particleVelocityArray.push({
                    x: (Math.random() - 0.5) * 0.3,
                    y: (Math.random() - 0.5) * 0.3,
                    z: (Math.random() - 0.5) * 0.3,
                    rx: (Math.random() - 0.5) * 0.4,
                    ry: (Math.random() - 0.5) * 0.4
                });
            });

            document.body.classList.add('shake-dismantle');
            const glitchOverlay = document.getElementById('glitch-overlay');
            if (glitchOverlay) glitchOverlay.classList.add('scanlines');

            const elementsToCrumble = [
                '.navbar', '.ticker-wrap', '#profit-calculator',
                '.hero-text-content h1', '.hero-text-content .lead',
                '.hero-actions', '.stats-row', '.about-features',
                '.about-visuals', '.contact-info-panel',
                '.contact-form-card', '.main-footer'
            ];

            const title = document.querySelector('.hero-text-content h1');
            if (title) title.classList.add('glitch-text-active');

            elementsToCrumble.forEach((selector) => {
                const el = document.querySelector(selector);
                if (el) {
                    const delay = Math.random() * 1400;
                    setTimeout(() => {
                        el.classList.add('crumble-item');
                        playTickSound();
                    }, delay);
                }
            });

            setTimeout(() => {
                document.body.classList.remove('shake-dismantle');
                if (glitchOverlay) glitchOverlay.classList.remove('scanlines');
                if (onDestructComplete) onDestructComplete();
            }, 2800);
        }

        function executeRestore() {
            playRestoreSound();
            destructModeRef.current = false;

            bitcoinGroup.rotation.set(0, 0.3, 0);
            bitcoinGroup.position.set(window.innerWidth < 1024 ? 0 : 2.2, window.innerWidth < 1024 ? 0.8 : 0, window.innerWidth < 1024 ? -1 : 0);
            bitcoinGroup.scale.set(1, 1, 1);

            bitcoinGroup.children.forEach(child => {
                child.position.set(0, 0, 0);
                child.rotation.set(0, 0, 0);
                child.scale.set(1, 1, 1);
            });

            const emblemBack = bitcoinGroup.children[bitcoinGroup.children.length - 1];
            emblemBack.position.z = -0.16;
            emblemBack.rotation.y = Math.PI;

            bitcoinGroup.children[0].rotation.x = Math.PI / 2;
            bitcoinGroup.children[1].position.z = 0.08;
            bitcoinGroup.children[2].position.z = -0.08;
            bitcoinGroup.children[3].position.z = 0.07;
            bitcoinGroup.children[4].position.z = -0.07;

            const frontEmblem = bitcoinGroup.children[5];
            frontEmblem.children.forEach((c) => {
                if (c.geometry.type === "BoxGeometry") {
                    if (c.position.y === 0) c.position.set(-0.25, 0, 0.08); 
                    else if (c.position.y > 0.5) {
                        if (c.position.x < 0) c.position.set(-0.14, 0.62, 0.08); 
                        else c.position.set(0.08, 0.62, 0.08); 
                    } else {
                        if (c.position.x < 0) c.position.set(-0.14, -0.64, 0.08); 
                        else c.position.set(0.08, -0.64, 0.08); 
                    }
                } else if (c.geometry.type === "TorusGeometry") {
                    if (c.position.y > 0) c.position.set(-0.1, 0.24, 0.08); 
                    else c.position.set(-0.1, -0.26, 0.08); 
                }
            });

            const backEmblem = bitcoinGroup.children[6];
            backEmblem.children.forEach((c) => {
                if (c.geometry.type === "BoxGeometry") {
                    if (c.position.y === 0) c.position.set(-0.25, 0, 0.08);
                    else if (c.position.y > 0.5) {
                        if (c.position.x < 0) c.position.set(-0.14, 0.62, 0.08);
                        else c.position.set(0.08, 0.62, 0.08);
                    } else {
                        if (c.position.x < 0) c.position.set(-0.14, -0.64, 0.08);
                        else c.position.set(0.08, -0.64, 0.08);
                    }
                } else if (c.geometry.type === "TorusGeometry") {
                    if (c.position.y > 0) c.position.set(-0.1, 0.24, 0.08);
                    else c.position.set(-0.1, -0.26, 0.08);
                }
            });

            scene.children.forEach(c => {
                if (c instanceof THREE.PointLight) {
                    c.intensity = c.userData.isCyan ? 3.5 : 4.0;
                    if(c.userData.isCyan) c.color.setHex(0x00f2fe);
                    if(c.userData.isPurple) c.color.setHex(0x7f00ff);
                }
            });

            const elementsToRemoveCrumble = document.querySelectorAll('.crumble-item');
            elementsToRemoveCrumble.forEach(el => el.classList.remove('crumble-item'));

            const glitchedTitle = document.querySelector('.glitch-text-active');
            if (glitchedTitle) glitchedTitle.classList.remove('glitch-text-active');
        }

        function animate() {
            animationFrameId = requestAnimationFrame(animate);

            if (bitcoinGroup && !destructModeRef.current) {
                bitcoinGroup.rotation.y += 0.008;
                bitcoinGroup.rotation.x = Math.sin(Date.now() * 0.0005) * 0.08;
            }

            if (!destructModeRef.current) {
                camera.position.x += (targetCameraX - camera.position.x) * 0.05;
                camera.position.y += (targetCameraY - camera.position.y) * 0.05;
                camera.lookAt(new THREE.Vector3(0, 0, 0));
            }

            if (particlesMesh) {
                const positions = particlesGeometry.attributes.position.array;
                const time = Date.now() * 0.0001;

                for (let i = 0; i < particlesCount; i++) {
                    const i3 = i * 3;
                    positions[i3 + 1] += Math.sin(time + positions[i3]) * 0.002;
                    
                    if (positions[i3 + 1] < -10) positions[i3 + 1] = 10;
                    if (positions[i3 + 1] > 10) positions[i3 + 1] = -10;
                }
                particlesGeometry.attributes.position.needsUpdate = true;
            }

            if (destructModeRef.current && bitcoinGroup) {
                bitcoinGroup.rotation.y += 0.12;
                bitcoinGroup.rotation.x += 0.06;
                bitcoinGroup.rotation.z += 0.03;

                camera.position.x = (Math.random() - 0.5) * 0.25;
                camera.position.y = (Math.random() - 0.5) * 0.25;

                bitcoinGroup.children.forEach((child, index) => {
                    const vel = particleVelocityArray[index];
                    if (vel) {
                        child.position.x += vel.x;
                        child.position.y += vel.y;
                        child.position.z += vel.z;
                        child.rotation.x += vel.rx;
                        child.rotation.y += vel.ry;
                        child.scale.multiplyScalar(0.978);
                    }
                });

                scene.children.forEach(c => {
                    if (c instanceof THREE.PointLight) {
                        c.color.setHex(0xff3838);
                        c.intensity *= 0.98;
                    }
                });
            }

            renderer.render(scene, camera);
        }

        const cleanup = initThreeJS();
        return cleanup;
    }, [onDestructComplete]);

    return <div id="canvas-container" ref={mountRef}></div>;
}
