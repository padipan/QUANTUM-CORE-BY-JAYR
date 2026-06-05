'use client';

import { useEffect, useRef, useState } from 'react';

// ==========================================
// ⚙️ ตั้งค่ารูปภาพและชุดข้อความโฮโลแกรมตรงนี้!
// ==========================================
const CUSTOM_IMAGE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'; 
// เปลี่ยนข้อความที่จะให้สลับไปมาได้เลย
const HOLOGRAM_MESSAGES = [
  { top: "SRVC", bottom: "DIGITAL BIZ" },
  { top: "INNOVATION", bottom: "TECHNOLOGY" },
  { top: "NEXT GEN", bottom: "2026" }
];
// ==========================================

export default function QuantumCore() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const hudModeRef = useRef(null);
  const hudStatusRef = useRef(null);
  const hudPowerBarRef = useRef(null);
  const hudWrapperRef = useRef(null); 
  
  const shapeNames = ['IMG_SPHERE', 'TXT_CUBE', 'IMG_PYRAMID', 'TXT_CYLINDER', 'IMG_TORUS'];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;
    let cameraFrameId;
    let localStream;
    let handsData = []; 

    const speakAlert = (text) => {
      if (!window.speechSynthesis) return;
      if (window.__LAST_SPEECH__ === text && window.speechSynthesis.speaking) return;
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.5; 
      utterance.rate = 1.1; 
      utterance.volume = 0.8; 
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US'));
      if (enVoice) utterance.voice = enVoice;
      window.speechSynthesis.speak(utterance);
      window.__LAST_SPEECH__ = text;
    };

    const sketch = (p) => {
      let layer3D;
      let objPos, objVel;
      let isGrabbed = false;
      let currentScale = 1.0;
      const baseSize = 45; 
      const gravity = 0.65; 
      const bounce = -0.82; 
      const friction = 0.992;
      let shapeIndex = 0;
      let wasFist = false;

      let particles = [];
      let trails = [];
      let matrixDrops = []; 
      let shockwaves = []; // [ใหม่] เก็บเอฟเฟกต์คลื่นกระแทก
      
      let isTimeFrozen = false;
      let isSingularity = false; 
      let isOrbitMode = false;
      let isWarping = false;
      let warpSpeed = 0;
      let warpStars = []; 

      let isSnapped = false;
      let snapRespawnTimer = 0;
      let isFiringLaser = false;

      let domainTimer = 0;
      let isDomainActive = false;
      let isDoublePinch = false; 
      let isAntiGravity = false; 

      let shakeIntensity = 0; 
      let hasWelcomed = false;

      // [ใหม่] ตัวแปรสำหรับควบคุมการหมุนด้วยมือ
      let targetRotX = 0, targetRotY = 0;
      let currentRotX = 0, currentRotY = 0;

      let noiseOsc, env, bassOsc, switchOsc;
      let customImage;
      let textGraphics;

      p.setup = () => {
        p.createCanvas(640, 480).parent(containerRef.current);
        layer3D = p.createGraphics(640, 480, p.WEBGL);
        layer3D.clear();

        objPos = p.createVector(p.width / 2, p.height / 4);
        objVel = p.createVector(0, 0);

        for(let i=0; i<60; i++) {
          matrixDrops.push({ x: p.random(p.width), y: p.random(p.height), speed: p.random(2, 6), char: String.fromCharCode(0x30A0 + p.floor(p.random(0, 96))) });
        }
        for(let i=0; i<200; i++) {
          warpStars.push({ x: p.random(-p.width, p.width), y: p.random(-p.height, p.height), z: p.random(p.width) });
        }

        env = new window.p5.Envelope(); env.setADSR(0.001, 0.12, 0.1, 0.1); env.setRange(0.4, 0.0);
        noiseOsc = new window.p5.Noise('white'); noiseOsc.disconnect(); noiseOsc.amp(env); noiseOsc.start();
        bassOsc = new window.p5.Oscillator('sine'); bassOsc.amp(0); bassOsc.start();
        switchOsc = new window.p5.Oscillator('square'); switchOsc.amp(0); switchOsc.start();

        customImage = p.loadImage(CUSTOM_IMAGE_URL);
        textGraphics = p.createGraphics(256, 256);
      };

      const spawnParticles = (x, y, color, amount, speedLimit = 5, isBlackHole = false, isDust = false) => {
        for (let i = 0; i < amount; i++) {
          particles.push({
            x: x, y: y,
            vx: p.random(-speedLimit, speedLimit), vy: p.random(-speedLimit, speedLimit) * (isDust ? 0.2 : 1), 
            life: 255, 
            color: isBlackHole ? p.color(255, 0, 0) : color, 
            isSucked: isBlackHole,
            isDust: isDust
          });
        }
      };

      const createShockwave = (x, y, color) => {
        shockwaves.push({ x, y, radius: 10, color, alpha: 255 });
      };

      const drawLightning = (x1, y1, x2, y2, themeColor, erratic = false, thickness = 2.5) => {
        p.push();
        p.stroke(themeColor.levels[0], themeColor.levels[1], themeColor.levels[2], 200);
        p.strokeWeight(erratic ? thickness * 1.5 : thickness);
        p.noFill();
        p.beginShape();
        let steps = erratic ? 8 : 12; 
        for (let i = 0; i <= steps; i++) {
          let tx = p.lerp(x1, x2, i / steps); let ty = p.lerp(y1, y2, i / steps);
          if (i > 0 && i < steps) {
            let offset = erratic ? 60 : 25;
            tx += p.random(-offset, offset); ty += p.random(-offset, offset);
          }
          p.vertex(tx, ty);
        }
        p.endShape();
        p.stroke(255, 255, 255, erratic ? 200 : 100);
        p.strokeWeight(erratic ? thickness * 0.8 : thickness * 0.5);
        p.line(x1, y1, x2, y2);
        p.pop();
      };

      p.draw = () => {
        p.background(0);
        
        if (shakeIntensity > 0) {
          p.translate(p.random(-shakeIntensity, shakeIntensity), p.random(-shakeIntensity, shakeIntensity));
          shakeIntensity *= 0.85; 
          if (shakeIntensity < 0.5) shakeIntensity = 0;
        }

        isDomainActive = domainTimer > 0;
        if (isDomainActive) domainTimer--;

        // วาดภาพจากกล้อง
        if (videoRef.current && videoRef.current.readyState >= 2) {
          p.push();
          if (!isDomainActive) {
            p.translate(p.width, 0); p.scale(-1, 1);
            p.drawingContext.drawImage(videoRef.current, 0, 0, p.width, p.height);
            
            if (isTimeFrozen) {
              p.fill(0, 15, 30, 180); p.rect(0, 0, p.width, p.height);
            } else if (isSingularity) {
              p.fill(40, 0, 10, 220); p.rect(0, 0, p.width, p.height);
            } else if (isOrbitMode) {
              p.fill(10, 0, 40, 150); p.rect(0, 0, p.width, p.height); 
            } else if (isFiringLaser) {
              p.fill(255, 255, 255, p.random(30, 80)); p.rect(0, 0, p.width, p.height); 
            }
          } else {
            p.background(10, 0, 25); 
            p.stroke(150, 0, 255, 60);
            p.strokeWeight(2);
            let offset = (p.frameCount * 3) % 50;
            for(let i = 0; i < p.height; i+=50) p.line(0, i + offset, p.width, i + offset);
            for(let i = 0; i < p.width; i+=50) p.line(i, 0, i, p.height);
            p.fill(0, 255, 255, 15);
            p.noStroke();
            p.rect(0, (p.frameCount * 15) % p.height, p.width, 20);
          }
          p.pop();
        }

        if (isTimeFrozen && !isDomainActive) {
          p.fill(0, 255, 100, 200); p.textSize(18); p.textAlign(p.CENTER, p.CENTER);
          for(let drop of matrixDrops) {
            p.text(drop.char, drop.x, drop.y); drop.y += drop.speed;
            if(drop.y > p.height) { drop.y = -20; drop.char = String.fromCharCode(0x30A0 + p.floor(p.random(0, 96))); }
            if(p.frameCount % 15 === 0 && p.random(1) > 0.5) drop.char = String.fromCharCode(0x30A0 + p.floor(p.random(0, 96)));
          }
        }

        let themeColor = p.color(255, 200, 0);
        let currentStatus = "SEARCHING SIGNAL...";
        let currentPower = 0;
        let isGlitching = false;

        let wasSingularity = isSingularity;
        isSingularity = false;
        isOrbitMode = false;
        isFiringLaser = false;
        isDoublePinch = false;
        isAntiGravity = false;

        if (isSnapped) {
          snapRespawnTimer--;
          currentStatus = "OBJECT ERASED (QUANTUM RECONSTRUCTION)";
          currentPower = 0;
          if (snapRespawnTimer <= 0) {
            isSnapped = false;
            objPos.set(p.width/2, p.height/4); 
            objVel.set(0, 0);
            createShockwave(objPos.x, objPos.y, p.color(0, 255, 255));
            spawnParticles(objPos.x, objPos.y, p.color(0, 255, 255), 100, 10);
            speakAlert("Reconstruction complete.");
          }
        }

        if (handsData.length === 2 && !isSnapped) {
          isGrabbed = true; 
          isTimeFrozen = false;
          
          let hand1 = handsData[0];
          let hand2 = handsData[1];
          let centerX = (hand1.midX + hand2.midX) / 2;
          let centerY = (hand1.midY + hand2.midY) / 2;
          let handDist = p.dist(hand1.midX, hand1.midY, hand2.midX, hand2.midY);
          let wristDist = p.dist(hand1.wristX, hand1.wristY, hand2.wristX, hand2.wristY);

          let dThumb = p.dist(hand1.thumbX, hand1.thumbY, hand2.thumbX, hand2.thumbY);
          let dIndex = p.dist(hand1.indexX, hand1.indexY, hand2.indexX, hand2.indexY);
          
          if (hand1.isOpenPalm && hand2.isOpenPalm && dThumb < 45 && dIndex < 45) {
             if (domainTimer <= 0) { 
                domainTimer = 300; 
                speakAlert("Domain Expansion. Infinite Void.");
                triggerDrumHit('kick', 50); 
                shakeIntensity = 50; 
                createShockwave(centerX, centerY, p.color(150, 0, 255));
                spawnParticles(centerX, centerY, p.color(150, 0, 255), 200, 20);
             }
             isGlitching = true; themeColor = p.color(150, 0, 255);
             currentStatus = "DOMAIN EXPANSION: INFINITE VOID"; currentPower = 100;
             objPos.x = centerX; objPos.y = centerY; currentScale = 3.5;
          }
          else if (hand1.pinchDistance < 45 && hand2.pinchDistance < 45 && !hand1.isFist && !hand2.isFist) {
             isDoublePinch = true; themeColor = p.color(0, 255, 100); 
             objPos.x = p.lerp(objPos.x, centerX, 0.2); objPos.y = p.lerp(objPos.y, centerY, 0.2); currentScale = 1.0;
             if (p.frameCount % 60 === 0) speakAlert("Shadow Clone Protocol.");
             currentStatus = "SHADOW CLONE JUTSU: PENTAGRAM"; currentPower = 80;
          }
          else if (hand1.isOpenPalm && hand2.isOpenPalm && wristDist < 90) {
            isFiringLaser = true; shakeIntensity = 20; isGlitching = true; themeColor = p.color(0, 255, 255);
            
            p.push(); p.noStroke(); let beamWidth = p.random(60, 120);
            p.fill(themeColor.levels[0], themeColor.levels[1], themeColor.levels[2], 150); p.rect(centerX - beamWidth/2, 0, beamWidth, centerY); 
            p.fill(255, 255, 255, 200); p.rect(centerX - beamWidth/4, 0, beamWidth/2, centerY); p.pop();

            if (p.frameCount % 2 === 0) drawLightning(centerX, centerY, centerX + p.random(-50,50), 0, themeColor, true, 5);
            bassOsc.freq(p.random(150, 400)); bassOsc.amp(0.6, 0.1);
            currentStatus = "PLASMA CANNON: FIRING!"; currentPower = 100;
            if(p.frameCount % 60 === 0) speakAlert("Plasma cannon engaged.");
            objPos.x = centerX; objPos.y = centerY - 50; currentScale = 0.5; 
          }
          else if (hand1.isFist && hand2.isFist && handDist < 120) {
            isSingularity = true; isGlitching = true;
            objPos.x = p.lerp(objPos.x, centerX, 0.4); objPos.y = p.lerp(objPos.y, centerY, 0.4);
            currentScale = p.lerp(currentScale, 0.4, 0.2); themeColor = p.color(255, 0, 50); 
            
            shakeIntensity = 8; spawnParticles(centerX, centerY, themeColor, 15, 25, true);
            if (p.frameCount % 5 === 0) drawLightning(hand1.midX, hand1.midY, hand2.midX, hand2.midY, themeColor, true);
            
            bassOsc.freq(p.random(30, 80)); bassOsc.amp(0.5, 0.1);
            currentStatus = "CRITICAL: SINGULARITY ENGAGED"; currentPower = 100;
            if(p.frameCount % 120 === 0) speakAlert("Critical Warning. Singularity engaged.");
          } 
          else if (hand1.isOpenPalm && hand2.isOpenPalm && handDist > 150) {
            isOrbitMode = true;
            objPos.x = p.lerp(objPos.x, centerX, 0.1); objPos.y = p.lerp(objPos.y, centerY, 0.1);
            currentScale = p.lerp(currentScale, 2.0, 0.1); themeColor = p.color(0, 255, 255); 
            p.stroke(0, 255, 255, 100); p.strokeWeight(2);
            p.line(hand1.midX, hand1.midY, objPos.x, objPos.y); p.line(hand2.midX, hand2.midY, objPos.x, objPos.y);
            bassOsc.freq(300); bassOsc.amp(0.1, 0.1);
            currentStatus = "TELEKINESIS: ORBITAL SYSTEM"; currentPower = 70;
            if(p.frameCount % 200 === 0) speakAlert("Telekinetic Orbit established.");
          }
          else {
            objPos.x = p.lerp(objPos.x, centerX, 0.2); objPos.y = p.lerp(objPos.y, centerY, 0.2); objVel.set(0, 0);
            currentScale = p.constrain(p.map(handDist, 50, 400, 1.0, 4.5), 1.0, 5.0);
            themeColor = p.color(255, 50, 255); 
            
            if (p.frameCount % 2 === 0) {
              drawLightning(hand1.midX, hand1.midY, hand2.midX, hand2.midY, themeColor);
              drawLightning(hand1.midX, hand1.midY, hand2.midX, hand2.midY, p.color(0, 255, 255));
            }
            if (currentScale > 2.5 && p.frameCount % 2 === 0) spawnParticles(objPos.x, objPos.y, themeColor, 2, 6);
            if (currentScale > 3.5) isGlitching = true; 

            bassOsc.freq(p.map(handDist, 50, 400, 100, 400), 0.1); bassOsc.amp(0.2, 0.1);
            currentStatus = "DUAL-CORE SYNC: OVERCHARGE"; currentPower = p.map(currentScale, 1.0, 4.5, 20, 100);

            if (handDist < 50 && currentScale > 1.5 && !hand1.isFist && !hand2.isFist) {
              createShockwave(objPos.x, objPos.y, p.color(255));
              spawnParticles(objPos.x, objPos.y, p.color(255), 200, 25); 
              triggerDrumHit('kick', 20); shapeIndex = (shapeIndex + 1) % 5; shakeIntensity = 45; currentScale = 1.0;
              speakAlert("Supernova Detonated.");
            }
          }
        } 
        else if (handsData.length === 1 && !isSnapped) {
          let handData = handsData[0];
          isTimeFrozen = handData.isPeace; 
          isAntiGravity = handData.isLevitate;

          if (!hasWelcomed && p.frameCount > 60) {
            speakAlert("Quantum Core V12 online. Sorcerer mode activated."); 
            hasWelcomed = true;
          }

          if (handData.isSnap) {
             isSnapped = true; snapRespawnTimer = 180; shakeIntensity = 30;
             createShockwave(objPos.x, objPos.y, themeColor);
             spawnParticles(objPos.x, objPos.y, themeColor, 150, 15, false, true);
             triggerDrumHit('snare', 30); speakAlert("Quantum erasure activated.");
          }

          if (handData.isFist && !wasFist && !handData.isSnap) {
            shapeIndex = (shapeIndex + 1) % 5; triggerSwitchSound(); spawnParticles(objPos.x, objPos.y, themeColor, 30, 8);
            speakAlert(`${shapeNames[shapeIndex]} mode.`);
          }
          wasFist = handData.isFist;

          if (!handData.isFist && !handData.isSnap && !handData.isShield && !handData.isLevitate && handData.pinchDistance < 45 && !isTimeFrozen && !isDomainActive) {
            if (!isGrabbed) { p.userStartAudio(); triggerClickSound(); }
            isGrabbed = true;
          } else if (handData.pinchDistance > 75) {
            if (isGrabbed) triggerWhooshSound(p.mag(objVel.x, objVel.y));
            isGrabbed = false;
          }

          if (handData.isShield && !isDomainActive) {
            isGrabbed = false;
            currentStatus = "MYSTIC SHIELD: ACTIVE"; 
            currentPower = 90; 
            themeColor = p.color(255, 120, 0); 
            
            p.push(); 
            p.translate(handData.midX, handData.midY); 
            p.rotate(p.frameCount * 0.08); 
            p.stroke(255, 120, 0, 200); p.strokeWeight(3); p.noFill();
            p.circle(0, 0, 160); p.circle(0, 0, 140);
            p.strokeWeight(2); p.rotate(p.frameCount * -0.03); p.rectMode(p.CENTER);
            p.rect(0, 0, 100, 100); p.rotate(p.PI/4); p.rect(0, 0, 100, 100); 
            p.pop();

            let d = p.dist(handData.midX, handData.midY, objPos.x, objPos.y);
            let shieldRadius = 100;
            if (d < shieldRadius) {
               let n = p.createVector(objPos.x - handData.midX, objPos.y - handData.midY);
               n.normalize();
               objVel.reflect(n); 
               objVel.mult(1.8); 
               objPos.add(objVel);
               triggerDrumHit('snare', 25); 
               createShockwave(objPos.x, objPos.y, themeColor);
               spawnParticles(objPos.x, objPos.y, themeColor, 30, 15);
               shakeIntensity = 10;
            }
            if(p.frameCount % 200 === 0) speakAlert("Mystic shield deployed.");
            p.stroke(255, 120, 0, 100); p.strokeWeight(2); p.line(handData.thumbX, handData.thumbY, handData.indexX, handData.indexY);
          }
          else if (isGrabbed) {
            objVel.x = handData.midX - objPos.x; objVel.y = handData.midY - objPos.y;
            objPos.x = handData.midX; objPos.y = handData.midY;
            currentScale = p.constrain(p.map(handData.pinchDistance, 20, 75, 0.6, 2.0), 0.5, 2.5);
            p.stroke(0, 255, 255, 200); p.strokeWeight(3); p.line(handData.thumbX, handData.thumbY, handData.indexX, handData.indexY);
            themeColor = handData.handLabel === "Right" ? p.color(255, 0, 128) : p.color(0, 255, 255);
            bassOsc.freq(p.map(handData.pinchDistance, 20, 75, 90, 220), 0.05); bassOsc.amp(0.1, 0.05);
            currentStatus = "MANUAL OVERRIDE: INTERACTIVE ROTATION"; currentPower = p.map(currentScale, 0.5, 2.5, 10, 100);
            
            // [ใหม่] คำนวณแกนหมุน 3D อิงตามตำแหน่งมือที่จับ (Interactive Rotation)
            targetRotY = p.map(handData.midX, 0, p.width, -p.PI, p.PI);
            targetRotX = p.map(handData.midY, 0, p.height, -p.PI, p.PI);
          } 
          else {
            let d = p.dist(handData.midX, handData.midY, objPos.x, objPos.y);
            let forceRadius = 100 + (currentScale * baseSize);

            if (d < forceRadius && !isTimeFrozen && !handData.isFist && !handData.isOpenPalm && !handData.isSnap && !handData.isLevitate && !isDomainActive) {
               let pushForce = p.createVector(objPos.x - handData.midX, objPos.y - handData.midY);
               pushForce.normalize(); pushForce.mult(2.0); objVel.add(pushForce);

               p.push(); p.noFill(); p.stroke(0, 255, 255, p.map(d, 0, forceRadius, 200, 0));
               p.strokeWeight(3); p.circle(objPos.x, objPos.y, forceRadius * 1.5); p.pop();
               
               currentStatus = "FORCE FIELD REPULSION"; currentPower = p.map(d, forceRadius, 0, 0, 100);
            }

            if (handData.isOpenPalm && !isDomainActive) {
              let forceX = (handData.midX - objPos.x) * 0.05; let forceY = (handData.midY - objPos.y) * 0.05;
              objVel.x += forceX; objVel.y += forceY - (gravity * 0.9);
              
              p.stroke(255, 200, 0, 150); p.strokeWeight(4); p.line(handData.midX, handData.midY, objPos.x, objPos.y);
              if (p.frameCount % 15 === 0) triggerRecallSound();

              currentStatus = "RECALLING (MJOLNIR PROTOCOL)"; currentPower = 100; themeColor = p.color(255, 200, 0); 
            } else if (handData.isPeace && !isDomainActive) {
              currentStatus = "MATRIX MODE: TIME FROZEN"; currentPower = 50; themeColor = p.color(0, 255, 150); 
              p.stroke(0, 255, 150, 150); p.strokeWeight(2); p.noFill(); p.circle(handData.midX, handData.midY, p.sin(p.frameCount * 0.1) * 20 + 40);
              if(p.frameCount % 200 === 0) speakAlert("Time protocol engaged.");
            } else if (handData.isLevitate && !isDomainActive) {
              currentStatus = "ANTI-GRAVITY: LEVITATION"; currentPower = 60; themeColor = p.color(100, 200, 255); 
              p.stroke(100, 200, 255, 150); p.strokeWeight(3); 
              p.line(handData.indexX, handData.indexY, handData.indexX, handData.indexY - 50); 
              if(p.frameCount % 200 === 0) speakAlert("Anti gravity field active.");
            } else if (!currentStatus.includes("FORCE") && !isDomainActive) {
              currentStatus = "AI TRACKING SECURED"; currentPower = 20;
            }
            
            p.stroke(255, 255, 255, 80); p.strokeWeight(1.5); p.line(handData.thumbX, handData.thumbY, handData.indexX, handData.indexY);
          }
        } else if (!isSnapped) {
          if (isGrabbed) triggerWhooshSound(p.mag(objVel.x, objVel.y));
          isGrabbed = false; wasFist = false; isTimeFrozen = false; isAntiGravity = false;
        }

        if (wasSingularity && !isSingularity && handsData.length < 2) {
          isWarping = true; warpSpeed = 80; 
          triggerDrumHit('kick', 30); speakAlert("Warp speed initiated.");
        }

        if (isWarping) {
          warpSpeed = p.lerp(warpSpeed, 0, 0.02); 
          if (warpSpeed < 1) isWarping = false;
          currentStatus = `QUANTUM WARP ACTIVE (MACH ${p.floor(warpSpeed)})`;
          currentPower = 100; themeColor = p.color(200, 200, 255); isGlitching = true; shakeIntensity = warpSpeed * 0.2;
        }

        if (!isGrabbed && !isSingularity && !isOrbitMode && !isFiringLaser && !isSnapped && !isDoublePinch && !isDomainActive) {
          let currentGravity = isAntiGravity ? -0.4 : (isTimeFrozen ? 0.01 : gravity);
          let currentFriction = (isTimeFrozen || isAntiGravity) ? 0.90 : friction;

          objVel.y += currentGravity; objVel.x *= currentFriction; objVel.y *= currentFriction; objPos.add(objVel); 
          let r = (baseSize * currentScale); let speed = p.mag(objVel.x, objVel.y);
          
          let hit = false;
          if (objPos.y > p.height - r) { objPos.y = p.height - r; objVel.y *= bounce; hit = true; if(speed>1.5) triggerDrumHit('kick', speed); }
          if (objPos.y < r) { objPos.y = r; objVel.y *= bounce; hit = true; if(speed>1.5) triggerDrumHit('snare', speed); }
          if (objPos.x > p.width - r) { objPos.x = p.width - r; objVel.x *= bounce; hit = true; if(speed>1.5) triggerDrumHit('snare', speed); }
          if (objPos.x < r) { objPos.x = r; objVel.x *= bounce; hit = true; if(speed>1.5) triggerDrumHit('snare', speed); }
          
          if (hit && speed > 5 && !isTimeFrozen) {
            spawnParticles(objPos.x, objPos.y, themeColor, p.min(speed * 2, 20), speed * 0.5);
            shakeIntensity = p.min(speed, 10); 
          }
          bassOsc.amp(0, 0.2);
          if (handsData.length === 0 && speed > 0.5 && !isWarping) {
             currentStatus = `FREE FALL (VELOCITY: ${speed.toFixed(1)})`; currentPower = p.map(speed, 0, 30, 0, 100);
          }
        }

        if (!isSnapped) {
          trails.push(p.createVector(objPos.x, objPos.y));
          if (trails.length > (isTimeFrozen || isAntiGravity ? 30 : isSingularity ? 2 : 15)) trails.shift(); 
          p.noFill(); p.stroke(themeColor.levels[0], themeColor.levels[1], themeColor.levels[2], isSingularity ? 255 : 80);
          p.strokeWeight(baseSize * currentScale * 0.6);
          p.beginShape(); for(let v of trails) p.vertex(v.x, v.y); p.endShape();
        } else {
          trails = []; 
        }

        for(let i = particles.length - 1; i >= 0; i--) {
          let pt = particles[i];
          if (isSingularity && pt.isSucked) {
            let dir = p.createVector(objPos.x - pt.x, objPos.y - pt.y);
            dir.normalize(); dir.mult(6); pt.vx += dir.x; pt.vy += dir.y;
            let tangent = p.createVector(-dir.y, dir.x); pt.vx += tangent.x * 2.5; pt.vy += tangent.y * 2.5;
          } else {
            if (!isTimeFrozen && !isAntiGravity && !isOrbitMode && !isWarping && !pt.isDust) pt.vy += gravity * 0.5; 
          }
          pt.x += pt.vx; pt.y += pt.vy; pt.life -= isTimeFrozen ? 2 : pt.isDust ? 3 : 8; 
          
          p.push(); 
          if(pt.isDust) p.fill(pt.color.levels[0], pt.color.levels[1], pt.color.levels[2], pt.life);
          else p.stroke(pt.color.levels[0], pt.color.levels[1], pt.color.levels[2], pt.life);
          p.strokeWeight(p.map(pt.life, 0, 255, 1, 6)); 
          
          if(pt.isDust) { p.noStroke(); p.circle(pt.x, pt.y, p.map(pt.life, 0, 255, 1, 8)); }
          else p.point(pt.x, pt.y); 
          p.pop();
          
          if(pt.life <= 0) particles.splice(i, 1);
        }

        // [ใหม่] วาดคลื่นกระแทก Shockwaves
        for(let i = shockwaves.length - 1; i >= 0; i--) {
          let sw = shockwaves[i];
          p.push();
          p.noFill();
          p.stroke(sw.color.levels[0], sw.color.levels[1], sw.color.levels[2], sw.alpha);
          p.strokeWeight(p.map(sw.alpha, 0, 255, 1, 8));
          p.circle(sw.x, sw.y, sw.radius);
          p.pop();
          sw.radius += 25;
          sw.alpha -= 15;
          if (sw.alpha <= 0) shockwaves.splice(i, 1);
        }

        if (!isSnapped && !handsData.find(h => h.isShield)) {
          p.push(); p.noFill(); p.strokeWeight(2);
          let ringSize = baseSize * currentScale * 2;
          let pulse = p.sin(p.frameCount * 0.2) * (currentPower * 0.2);
          p.stroke(themeColor.levels[0], themeColor.levels[1], themeColor.levels[2], 100);
          p.circle(objPos.x, objPos.y, ringSize + pulse);
          p.stroke(themeColor.levels[0], themeColor.levels[1], themeColor.levels[2], 50);
          p.circle(objPos.x, objPos.y, ringSize * 1.5 + (pulse * 2));
          p.pop();
        }

        if (isDomainActive) {
            currentStatus = "DOMAIN EXPANSION: INFINITE VOID"; themeColor = p.color(150, 0, 255); isGlitching = true;
        }

        let renderStatus = currentStatus;
        if (isGlitching && p.frameCount % 3 === 0) {
          const glitches = ["!@#%^&*", "SYS_FAILURE", "OVERLOAD_0x", "PLASMA_BURN", renderStatus];
          renderStatus = p.random(glitches);
        }
        
        if (hudModeRef.current) hudModeRef.current.innerText = `MODE: ${shapeNames[shapeIndex]}`;
        if (hudStatusRef.current) {
          hudStatusRef.current.innerText = `STATUS: ${renderStatus}`;
          hudStatusRef.current.style.color = isDomainActive ? "#a020f0" : isDoublePinch ? "#00ff00" : isSingularity ? "#ff0000" : isFiringLaser ? "#00ffff" : isWarping ? "#ffffff" : isSnapped ? "#ff5555" : currentStatus.includes("DUAL-CORE") || isOrbitMode ? "#ff33ff" : isAntiGravity ? "#66ccff" : currentStatus.includes("SHIELD") ? "#ff8800" : isTimeFrozen ? "#00ff96" : currentStatus.includes("FORCE") ? "#00ffff" : currentStatus.includes("MANUAL") ? "#ff0080" : currentStatus.includes("RECALLING") ? "#ffcc00" : "#00ffff";
        }
        if (hudPowerBarRef.current) {
          hudPowerBarRef.current.style.width = `${p.constrain(currentPower, 0, 100)}%`;
          hudPowerBarRef.current.style.backgroundColor = isDomainActive ? "#a020f0" : isDoublePinch ? "#00ff00" : isSingularity ? "#ff0000" : isFiringLaser ? "#ffffff" : isWarping ? "#ffffff" : isSnapped ? "#333333" : currentStatus.includes("DUAL-CORE") || isOrbitMode ? "#ff33ff" : isAntiGravity ? "#66ccff" : currentStatus.includes("SHIELD") ? "#ff8800" : isTimeFrozen ? "#00ff96" : currentStatus.includes("FORCE") ? "#00ffff" : currentStatus.includes("MANUAL") ? "#ff0080" : currentStatus.includes("RECALLING") ? "#ffcc00" : "#00ffff";
        }

        if (hudWrapperRef.current) {
          if (isGlitching && p.frameCount % 2 === 0) {
            hudWrapperRef.current.style.transform = `translate(${p.random(-10, 10)}px, ${p.random(-10, 10)}px)`;
            hudWrapperRef.current.style.opacity = p.random(0.3, 1);
          } else {
            hudWrapperRef.current.style.transform = `translate(0px, 0px)`;
            hudWrapperRef.current.style.opacity = 1;
          }
        }

        // ==========================================
        // [อัปเดตใหม่] ระบบ Dynamic Hologram Carousel (ข้อความเปลี่ยนอัตโนมัติ)
        // ==========================================
        if (textGraphics) {
          textGraphics.clear();
          textGraphics.textAlign(p.CENTER, p.CENTER);
          textGraphics.textStyle(p.BOLD);
          textGraphics.fill(themeColor.levels[0], themeColor.levels[1], themeColor.levels[2], 255); 
          
          // สลับข้อความทุกๆ 150 เฟรม (ประมาณ 2-3 วินาที)
          let msgIndex = p.floor(p.frameCount / 150) % HOLOGRAM_MESSAGES.length;
          let currentMsg = HOLOGRAM_MESSAGES[msgIndex];

          textGraphics.textSize(50);
          textGraphics.text(currentMsg.top, 128, 100);
          textGraphics.textSize(30);
          textGraphics.text(currentMsg.bottom, 128, 160);
          
          textGraphics.loadPixels();
        }

        if (!isSnapped) {
          layer3D.clear(); 
          layer3D.ambientLight(isSingularity ? 30 : 200); 
          layer3D.directionalLight(255, 255, 255, 0.5, 1, -0.5);
          
          if (isWarping) {
            layer3D.push(); layer3D.stroke(255, 255, 255, 150);
            for (let star of warpStars) {
              star.z -= warpSpeed;
              if (star.z < 1) { star.z = p.width; star.x = p.random(-p.width, p.width); star.y = p.random(-p.height, p.height); }
              let sx = p.map(star.x / star.z, 0, 1, 0, p.width); let sy = p.map(star.y / star.z, 0, 1, 0, p.height);
              let pz = star.z + warpSpeed; let px = p.map(star.x / pz, 0, 1, 0, p.width); let py = p.map(star.y / pz, 0, 1, 0, p.height);
              layer3D.strokeWeight(p.map(star.z, 0, p.width, 4, 0));
              layer3D.line(sx, sy, star.z, px, py, pz);
            }
            layer3D.pop();
          }

          let webglX = objPos.x - p.width / 2;
          let webglY = objPos.y - p.height / 2;
          
          layer3D.push();
          layer3D.translate(webglX, webglY, 0); 
          layer3D.scale(currentScale);
          
          let speedMult = !isGrabbed ? p.mag(objVel.x, objVel.y) * 0.02 : 0;
          let rotationTime = (isTimeFrozen || isAntiGravity) ? p.frameCount * 0.005 : p.frameCount;
          
          if (handsData.length === 2) speedMult += currentScale * 0.05;
          if (isSingularity) speedMult += 0.5; 
          if (isWarping) speedMult += warpSpeed * 0.05;
          if (isDomainActive) speedMult += 0.2;

          // [ใหม่] ระบบ Smooth Interactive Rotation
          if (isGrabbed && handsData.length === 1) {
            currentRotX = p.lerp(currentRotX, targetRotX, 0.1);
            currentRotY = p.lerp(currentRotY, targetRotY, 0.1);
            layer3D.rotateX(currentRotX);
            layer3D.rotateY(currentRotY);
          } else {
            // หมุนอัตโนมัติถ้าไม่ได้จับ
            currentRotX = rotationTime * (isSingularity ? 0.1 : 0.02) + speedMult;
            currentRotY = rotationTime * (isSingularity ? 0.15 : 0.03) + speedMult;
            layer3D.rotateX(currentRotX);
            layer3D.rotateY(currentRotY);
          }
          
          if (isDoublePinch) {
            for(let i=0; i<5; i++) {
              layer3D.push();
              layer3D.rotateY(p.frameCount * 0.1 + (i * p.TWO_PI/5)); 
              layer3D.translate(baseSize * 2.5, 0, 0);
              layer3D.rotateX(p.frameCount * 0.2);
              layer3D.stroke(0, 255, 100); layer3D.fill(0, 255, 100, 50); 
              layer3D.box(baseSize * 0.5); 
              layer3D.pop();
            }
          }

          if (isOrbitMode) {
            for(let i=0; i<3; i++) {
              layer3D.push();
              layer3D.rotateY(p.frameCount * 0.05 + (i * p.TWO_PI/3)); 
              layer3D.translate(baseSize * 2, 0, 0);
              layer3D.rotateX(p.frameCount * 0.1);
              layer3D.noStroke(); layer3D.emissiveMaterial(0, 255, 255); layer3D.sphere(baseSize * 0.2); 
              layer3D.pop();
            }
          }

          layer3D.push();
          layer3D.stroke(themeColor.levels[0], themeColor.levels[1], themeColor.levels[2], 255);
          layer3D.strokeWeight(isSingularity ? 3 : 1.5);
          
          if (!isSingularity) {
            layer3D.fill(10, 10, 10, 200); 
            
            let isImgReady = customImage && customImage.width > 1;
            let isTxtReady = textGraphics && textGraphics.width > 0;

            try {
              if (shapeIndex % 2 === 0 && isImgReady) {
                layer3D.texture(customImage);
                layer3D.tint(255, 255, 255, 220); 
              } else if (isTxtReady) {
                layer3D.texture(textGraphics);
                layer3D.noTint(); 
              }
            } catch (e) {
              layer3D.fill(themeColor); 
            }
          } else {
            layer3D.noFill(); 
          }

          try {
            switch(shapeIndex) {
              case 0: layer3D.sphere(baseSize, 24, 24); break; 
              case 1: layer3D.box(baseSize * 1.3); break;      
              case 2: layer3D.cone(baseSize, baseSize*1.5, 12, 1); break; 
              case 3: layer3D.cylinder(baseSize*0.8, baseSize*1.5, 24, 1); break; 
              case 4: layer3D.torus(baseSize*0.7, 10, 24, 16); break; 
            }
          } catch (err) {}
          
          layer3D.pop();

          layer3D.push();
          layer3D.rotateX(-rotationTime * 0.04);
          layer3D.noStroke();
          layer3D.emissiveMaterial(255, 255, 255); 
          if (isSingularity) layer3D.emissiveMaterial(255, 0, 50);
          else if (isFiringLaser) layer3D.emissiveMaterial(0, 255, 255); 
          else if (isDomainActive) layer3D.emissiveMaterial(150, 0, 255); 
          else if (isDoublePinch) layer3D.emissiveMaterial(0, 255, 100);
          else if (currentStatus.includes("SHIELD")) layer3D.emissiveMaterial(255, 100, 0);
          
          layer3D.sphere(baseSize * 0.35, 12, 12); 
          layer3D.pop();
          
          layer3D.pop();
          p.image(layer3D, 0, 0);
        } else {
          layer3D.clear();
          p.image(layer3D, 0, 0);
        }

        // ==========================================
        // [ใหม่] เพิ่ม CRT Scanline & Vignette Effect ทับชั้นบนสุด
        // ==========================================
        if (!isSnapped) {
          p.push();
          // เส้น Scanline บางๆ แนวนอน
          p.stroke(themeColor.levels[0], themeColor.levels[1], themeColor.levels[2], 10);
          p.strokeWeight(2);
          for (let i = 0; i < p.height; i += 4) {
            p.line(0, i, p.width, i);
          }
          // ขอบมืด (Vignette) ให้ดูลึกลับและโฟกัสตรงกลาง
          let gradient = p.drawingContext.createRadialGradient(p.width/2, p.height/2, p.height/3, p.width/2, p.height/2, p.width);
          gradient.addColorStop(0, 'rgba(0,0,0,0)');
          gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
          p.drawingContext.fillStyle = gradient;
          p.drawingContext.fillRect(0, 0, p.width, p.height);
          p.pop();
        }
      };

      function triggerClickSound() { bassOsc.freq(300); bassOsc.amp(0.3); bassOsc.amp(0, 0.04); }
      function triggerWhooshSound(throwSpeed) {
        let volume = p.map(throwSpeed, 5, 30, 0.1, 0.6, true); let duration = p.map(throwSpeed, 5, 30, 0.3, 0.1, true); 
        env.setADSR(0.01, duration, 0.0, 0.01); env.setRange(volume, 0.0); env.play(); 
      }
      function triggerDrumHit(type, hitSpeed) {
        let dynamicVol = p.map(hitSpeed, 1, 20, 0.1, 0.7, true);
        if (type === 'kick') { bassOsc.freq(150); bassOsc.freq(40, 0.12); bassOsc.amp(dynamicVol); bassOsc.amp(0, 0.12); } 
        else if (type === 'snare') { env.setADSR(0.001, 0.08, 0.0, 0.01); env.setRange(dynamicVol, 0.0); env.play(); bassOsc.freq(180); bassOsc.amp(dynamicVol * 0.5); bassOsc.amp(0, 0.08); }
      }
      function triggerSwitchSound() { switchOsc.freq(800); switchOsc.freq(150, 0.15); switchOsc.amp(0.2); switchOsc.amp(0, 0.15); }
      function triggerRecallSound() { switchOsc.freq(150); switchOsc.freq(400, 0.1); switchOsc.amp(0.15); switchOsc.amp(0, 0.1); }
    };

    const initSystem = async () => {
      const p5 = window.p5;
      const Hands = window.Hands;
      if (!p5 || !Hands) return;

      if (window.__QUANTUM_P5__) window.__QUANTUM_P5__.remove();
      window.__QUANTUM_P5__ = new p5(sketch, containerRef.current);

      let hands = window.__GLOBAL_HANDS_AI__;
      if (!hands) {
        hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
        hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
        window.__GLOBAL_HANDS_AI__ = hands;
      }

      hands.onResults((results) => {
        if (!isMounted) return;
        handsData = []; 
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const p = window.__QUANTUM_P5__;
          for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const hand = results.multiHandLandmarks[i];
            let thumbX = (1 - hand[4].x) * p.width, thumbY = hand[4].y * p.height;
            let indexX = (1 - hand[8].x) * p.width, indexY = hand[8].y * p.height;
            
            let midTipX = (1 - hand[12].x) * p.width, midTipY = hand[12].y * p.height;
            let wristX = (1 - hand[0].x) * p.width, wristY = hand[0].y * p.height;
            
            let wrist = hand[0];
            let dIndex = p.dist(wrist.x, wrist.y, hand[8].x, hand[8].y);
            let dMid = p.dist(wrist.x, wrist.y, hand[12].x, hand[12].y);
            let dRing = p.dist(wrist.x, wrist.y, hand[16].x, hand[16].y);
            let dPinky = p.dist(wrist.x, wrist.y, hand[20].x, hand[20].y);
            let avgDist = (dIndex + dMid + dRing + dPinky) / 4;

            let isIndexUp = dIndex > 0.45;
            let isMidUp = dMid > 0.45;
            let isRingUp = dRing > 0.45; 
            let isPinkyUp = dPinky > 0.45; 
            
            let isRingDown = dRing < 0.3;
            let isPinkyDown = dPinky < 0.3;
            let isMidDown = dMid < 0.3;
            
            let isPeace = isIndexUp && isMidUp && isRingDown && isPinkyDown;
            let dThumbMid = p.dist(thumbX, thumbY, midTipX, midTipY);
            let isSnap = dThumbMid < 40 && isIndexUp && isRingDown && isPinkyDown;
            let isShield = isIndexUp && isMidDown && isRingDown && isPinkyUp;
            let isLevitate = isIndexUp && isMidDown && isRingDown && isPinkyDown && dThumbMid > 50;

            handsData.push({
              midX: (thumbX + indexX) / 2, midY: (thumbY + indexY) / 2,
              thumbX, thumbY, indexX, indexY,
              wristX, wristY, 
              pinchDistance: p.dist(thumbX, thumbY, indexX, indexY),
              handLabel: results.multiHandedness[i].label === "Right" ? "Left" : "Right",
              isFist: avgDist < 0.25, 
              isOpenPalm: avgDist > 0.65, 
              isPeace: isPeace,
              isSnap: isSnap,
              isShield: isShield,
              isLevitate: isLevitate
            });
          }
        }
      });

      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = localStream;
          setIsLoaded(true);
          const processFrame = async () => {
            if (!isMounted) return;
            if (videoRef.current && videoRef.current.readyState >= 2) {
              await hands.send({ image: videoRef.current });
            }
            cameraFrameId = requestAnimationFrame(processFrame);
          };
          processFrame();
        } else {
          localStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("ไม่สามารถเปิดกล้องได้:", err);
      }
    };

    const bootApp = async () => {
      if (!window.__LIBRARIES_LOADED__) {
        const loadScript = (src) => new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = src; script.crossOrigin = 'anonymous'; script.onload = resolve;
          document.head.appendChild(script);
        });

        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/addons/p5.sound.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
        window.__LIBRARIES_LOADED__ = true; 
      }
      if (isMounted) initSystem(); 
    };

    bootApp();

    return () => {
      isMounted = false; 
      if (window.__QUANTUM_P5__) { window.__QUANTUM_P5__.remove(); window.__QUANTUM_P5__ = null; }
      if (cameraFrameId) cancelAnimationFrame(cameraFrameId);
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-8 font-sans">
      
      <div className="text-center mb-6 relative z-30">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-fuchsia-500 to-cyan-500 tracking-widest drop-shadow-[0_0_15px_rgba(255,100,0,0.5)]">
          QUANTUM CORE BY ครูเจอาร์ <span className="text-sm font-light text-white bg-orange-900/60 px-2 py-1 rounded border border-orange-500/50 align-top ml-2 animate-pulse">V12.5</span>
        </h1>
        <p className="text-orange-200/60 text-xs tracking-[0.3em] mt-2 border-b border-orange-900/50 pb-2 inline-block">
          SRVC DIGITAL BUSINESS TECHNOLOGY :KRU PADIPAN PANTONG
        </p>
      </div>
      
      <div className="relative">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-xl z-20 border border-orange-500/30 backdrop-blur-md">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-orange-300 font-mono text-sm tracking-widest animate-pulse">WEAVING SPELLS...</p>
            </div>
          </div>
        )}
        
        <div className="absolute top-4 left-4 z-10 pointer-events-none w-64" ref={hudWrapperRef}>
          <div className="bg-black/60 backdrop-blur-md border border-orange-500/50 rounded-lg p-3 shadow-[0_0_20px_rgba(255,100,0,0.2)] transition-colors duration-100">
            <h3 ref={hudModeRef} className="font-mono text-orange-400 font-bold text-sm tracking-widest mb-1 drop-shadow-[0_0_5px_rgba(255,100,0,0.5)]">MODE: IMG_SPHERE</h3>
            <p ref={hudStatusRef} className="font-mono text-orange-200 text-xs tracking-wider h-4 overflow-hidden text-ellipsis whitespace-nowrap drop-shadow-[0_0_5px_rgba(255,100,0,0.5)]">STATUS: ONLINE...</p>
            
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                <span>MYSTIC ENERGY</span>
                <span>MAX</span>
              </div>
              <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                <div ref={hudPowerBarRef} className="h-full bg-orange-400 transition-all duration-75 ease-out shadow-[0_0_10px_currentColor]" style={{width: '0%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-orange-500 rounded-tl-xl z-10 pointer-events-none opacity-80 shadow-[0_0_15px_rgba(255,100,0,0.5)]"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-orange-500 rounded-tr-xl z-10 pointer-events-none opacity-80 shadow-[0_0_15px_rgba(255,100,0,0.5)]"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-orange-500 rounded-bl-xl z-10 pointer-events-none opacity-80 shadow-[0_0_15px_rgba(255,100,0,0.5)]"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-orange-500 rounded-br-xl z-10 pointer-events-none opacity-80 shadow-[0_0_15px_rgba(255,100,0,0.5)]"></div>

        <video ref={videoRef} className="hidden" playsInline autoPlay muted></video>
        
        <div ref={containerRef} className="rounded-xl overflow-hidden shadow-[0_0_60px_rgba(255,100,0,0.25)] ring-2 ring-orange-500/30"></div>
      </div>
      
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap justify-center gap-3 text-[10px] md:text-xs font-mono text-gray-400 bg-gray-950 px-6 py-4 rounded-xl border border-orange-900/50 max-w-6xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 hover:text-orange-300 transition-colors"><span className="text-lg">🤏</span> <span>GRAB/ROTATE</span></div>
        <div className="w-px h-4 bg-gray-700 hidden lg:block"></div>
        <div className="flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors"><span className="text-lg">☝️</span> <span>ANTI-GRAVITY</span></div>
        <div className="w-px h-4 bg-gray-700 hidden lg:block"></div>
        <div className="flex items-center gap-2 text-cyan-400 hover:text-cyan-200 transition-colors"><span className="text-lg">✌️</span> <span>TIME FREEZE</span></div>
        <div className="w-px h-4 bg-gray-700 hidden lg:block"></div>
        
        <div className="flex items-center col-span-2 lg:col-span-1 justify-center gap-2 text-orange-400 font-black mt-2 lg:mt-0 bg-orange-950/40 px-3 py-1 rounded border border-orange-500/50 shadow-[0_0_10px_rgba(255,150,0,0.3)] animate-pulse">
          <span className="text-xl">🤘</span> <span>MYSTIC SHIELD</span>
        </div>
        <div className="w-px h-4 bg-gray-700 hidden lg:block"></div>
        <div className="flex items-center gap-2 text-fuchsia-400 font-bold hover:text-fuchsia-300 transition-colors"><span className="text-lg">👐</span> <span>ORBIT/SUPERNOVA</span></div>
        
        <div className="flex items-center col-span-2 md:col-span-2 lg:col-span-1 justify-center gap-2 text-yellow-400 font-black mt-2 lg:mt-0 bg-yellow-950/40 px-3 py-1 rounded border border-yellow-700/50">
          <span className="text-xl">👌</span> <span>SNAP ERASE</span>
        </div>
        <div className="flex items-center col-span-2 md:col-span-2 lg:col-span-1 justify-center gap-2 text-purple-400 font-black mt-2 lg:mt-0 bg-purple-950/60 px-3 py-1 rounded border border-purple-500/50">
          <span className="text-xl">🙏</span> <span>DOMAIN EXPANSION</span>
        </div>
      </div>

    </div>
  );
}