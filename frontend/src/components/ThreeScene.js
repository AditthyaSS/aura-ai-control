import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import useGameStore from '../store/gameStore';
import { AgentHoverMessage } from './AgentHoverMessage';

export const ThreeScene = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const robotMeshesRef = useRef([]);
  const animationIdRef = useRef(null);
  const createCuteRobotRef = useRef(null);

  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const agents = useGameStore((state) => state.agents);

  // Separate effect to handle agent additions/removals
  useEffect(() => {
    if (!sceneRef.current || !createCuteRobotRef.current) return;

    const scene = sceneRef.current;
    const createCuteRobot = createCuteRobotRef.current;
    const currentAgentIds = robotMeshesRef.current.map(r => r.userData.agentId);
    const newAgentIds = agents.map(a => a.id);

    // Remove deleted agents
    const removedIds = currentAgentIds.filter(id => !newAgentIds.includes(id));
    removedIds.forEach(id => {
      const robotIndex = robotMeshesRef.current.findIndex(r => r.userData.agentId === id);
      if (robotIndex !== -1) {
        const robot = robotMeshesRef.current[robotIndex];
        scene.remove(robot);
        robotMeshesRef.current.splice(robotIndex, 1);
      }
    });

    // Add new agents
    const addedIds = newAgentIds.filter(id => !currentAgentIds.includes(id));
    addedIds.forEach(id => {
      const agent = agents.find(a => a.id === id);
      if (agent) {
        const robot = createCuteRobot(agent, scene);
        robotMeshesRef.current.push(robot);
        scene.add(robot);
      }
    });
  }, [agents]);

  useEffect(() => {
    if (!mountRef.current) return;
    const mountNode = mountRef.current;

    // Clear any existing content to prevent duplicates
    while (mountNode.firstChild) {
      mountNode.removeChild(mountNode.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#D5EDF7');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(14, 12, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountNode.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.minPolarAngle = 0.3;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 8;
    controls.maxDistance = 30;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.far = 60;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    scene.add(directionalLight);

    const hemiLight = new THREE.HemisphereLight(0xD0E8F5, 0x8BB8D0, 0.6);
    scene.add(hemiLight);

    const floorGeometry = new THREE.BoxGeometry(30, 0.4, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: '#88D898',
      metalness: 0.05,
      roughness: 0.95
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(30, 30, 0x80D890, 0x80D890);
    gridHelper.position.y = 0.01;
    gridHelper.material.opacity = 0.12;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    const walkwayGeometry = new THREE.BoxGeometry(2.5, 0.08, 20);
    const walkwayMaterial = new THREE.MeshStandardMaterial({
      color: '#F4BD7A',
      metalness: 0.05,
      roughness: 0.9
    });
    const walkway = new THREE.Mesh(walkwayGeometry, walkwayMaterial);
    walkway.position.set(-9, 0.03, -2);
    walkway.receiveShadow = true;
    scene.add(walkway);

    const carpetGeometry = new THREE.BoxGeometry(6, 0.12, 5);
    const carpetMaterial = new THREE.MeshStandardMaterial({
      color: '#5AA8D8',
      metalness: 0.05,
      roughness: 0.9
    });
    const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
    carpet.position.set(6, 0.05, -5);
    carpet.receiveShadow = true;
    scene.add(carpet);

    const createWall = (width, height, position, rotation = 0) => {
      const wallGeometry = new THREE.BoxGeometry(width, height, 0.6);
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: '#A8CDE0',
        metalness: 0.1,
        roughness: 0.8
      });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.copy(position);
      wall.rotation.y = rotation;
      wall.castShadow = true;
      wall.receiveShadow = true;
      return wall;
    };

    scene.add(createWall(30, 6, new THREE.Vector3(0, 3, -15)));
    scene.add(createWall(30, 6, new THREE.Vector3(-15, 3, 0), Math.PI / 2));
    scene.add(createWall(30, 6, new THREE.Vector3(15, 3, 0), Math.PI / 2));
    scene.add(createWall(30, 6, new THREE.Vector3(0, 3, 15), Math.PI));

    const createArtwork = (width, height, color, position) => {
      const frameGeometry = new THREE.BoxGeometry(width, height, 0.15);
      const frameMaterial = new THREE.MeshStandardMaterial({ color: '#333333' });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.copy(position);

      const canvasGeometry = new THREE.PlaneGeometry(width - 0.2, height - 0.2);
      const canvasMaterial = new THREE.MeshBasicMaterial({ color: color });
      const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
      canvas.position.set(position.x, position.y, position.z + 0.08);

      scene.add(frame);
      scene.add(canvas);
    };

    createArtwork(2, 1.5, '#FFB3C6', new THREE.Vector3(-6, 3.5, -14.9));
    createArtwork(2, 1.5, '#A8D5F5', new THREE.Vector3(-2, 3.5, -14.9));
    createArtwork(1.5, 1.5, '#D4A5FF', new THREE.Vector3(-10, 3, -14.9));

    const whiteboardGeometry = new THREE.BoxGeometry(3, 2, 0.15);
    const whiteboardMaterial = new THREE.MeshStandardMaterial({ color: '#FFFFFF' });
    const whiteboard = new THREE.Mesh(whiteboardGeometry, whiteboardMaterial);
    whiteboard.position.set(10, 3, -14.9);
    scene.add(whiteboard);

    const createWorkstation = (position, rotation = 0, accentColor = '#D4A5FF') => {
      const workstation = new THREE.Group();

      const partitionGeometry = new THREE.BoxGeometry(2, 1.3, 0.2);
      const partitionMaterial = new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: 0.2,
        roughness: 0.8
      });
      const backPartition = new THREE.Mesh(partitionGeometry, partitionMaterial);
      backPartition.position.set(0, 1.4, -0.7);
      backPartition.castShadow = true;
      backPartition.receiveShadow = true;
      workstation.add(backPartition);

      const sidePartitionGeometry = new THREE.BoxGeometry(0.2, 1.3, 1.5);
      const leftPartition = new THREE.Mesh(sidePartitionGeometry, partitionMaterial);
      leftPartition.position.set(-1, 1.4, 0);
      leftPartition.castShadow = true;
      workstation.add(leftPartition);

      const rightPartition = new THREE.Mesh(sidePartitionGeometry, partitionMaterial);
      rightPartition.position.set(1, 1.4, 0);
      rightPartition.castShadow = true;
      workstation.add(rightPartition);

      const deskGeometry = new THREE.BoxGeometry(2, 0.18, 1.2);
      const deskMaterial = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.15,
        roughness: 0.7
      });
      const desk = new THREE.Mesh(deskGeometry, deskMaterial);
      desk.position.y = 0.75;
      desk.castShadow = true;
      desk.receiveShadow = true;
      workstation.add(desk);

      const legGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 16);
      const legMaterial = new THREE.MeshStandardMaterial({
        color: '#C0C0C0',
        metalness: 0.6,
        roughness: 0.4
      });
      [[-0.9, -0.5], [0.9, -0.5], [-0.9, 0.5], [0.9, 0.5]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(x, 0.35, z);
        leg.castShadow = true;
        workstation.add(leg);
      });

      const monitorGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.1);
      const monitorMaterial = new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        metalness: 0.4,
        roughness: 0.6
      });
      const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
      monitor.position.set(0, 1.05, -0.3);
      monitor.castShadow = true;
      workstation.add(monitor);

      const screenGeometry = new THREE.PlaneGeometry(0.75, 0.45);
      const screenMaterial = new THREE.MeshBasicMaterial({
        color: '#5AB8E8',
        emissive: '#4AA8D8',
        emissiveIntensity: 0.4
      });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.set(0, 1.05, -0.25);
      workstation.add(screen);

      const standGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.15, 16);
      const stand = new THREE.Mesh(standGeometry, monitorMaterial);
      stand.position.set(0, 0.85, -0.3);
      workstation.add(stand);

      const keyboardGeometry = new THREE.BoxGeometry(0.4, 0.03, 0.15);
      const keyboardMaterial = new THREE.MeshStandardMaterial({ color: '#2a2a2a' });
      const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
      keyboard.position.set(0, 0.82, 0.1);
      keyboard.castShadow = true;
      workstation.add(keyboard);

      const chairSeatGeometry = new THREE.CylinderGeometry(0.28, 0.24, 0.12, 24);
      const chairMaterial = new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        metalness: 0.2,
        roughness: 0.8
      });
      const chairSeat = new THREE.Mesh(chairSeatGeometry, chairMaterial);
      chairSeat.position.set(0, 0.5, 0.6);
      chairSeat.castShadow = true;
      workstation.add(chairSeat);

      const backrestGeometry = new THREE.BoxGeometry(0.45, 0.6, 0.08);
      const backrest = new THREE.Mesh(backrestGeometry, chairMaterial);
      backrest.position.set(0, 0.8, 0.45);
      backrest.rotation.x = -0.1;
      backrest.castShadow = true;
      workstation.add(backrest);

      const poleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 16);
      const poleMaterial = new THREE.MeshStandardMaterial({
        color: '#404040',
        metalness: 0.7,
        roughness: 0.3
      });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.set(0, 0.3, 0.6);
      workstation.add(pole);

      workstation.position.copy(position);
      workstation.rotation.y = rotation;
      return workstation;
    };

    const workstations = [
      createWorkstation(new THREE.Vector3(-6, 0, -8), 0, '#FFD4A3'),
      createWorkstation(new THREE.Vector3(-3, 0, -8), 0, '#D4A5FF'),
      createWorkstation(new THREE.Vector3(0, 0, -8), 0, '#FFB3C6'),
      createWorkstation(new THREE.Vector3(3, 0, -8), 0, '#A8D5F5'),
      createWorkstation(new THREE.Vector3(-6, 0, -4), 0, '#D4A5FF'),
      createWorkstation(new THREE.Vector3(-3, 0, -4), 0, '#FFD4A3'),
      createWorkstation(new THREE.Vector3(0, 0, -4), 0, '#A8D5F5'),
      createWorkstation(new THREE.Vector3(3, 0, -4), 0, '#FFB3C6'),
      createWorkstation(new THREE.Vector3(8, 0, -6), 0, '#D4A5FF'),
      createWorkstation(new THREE.Vector3(8, 0, -2), 0, '#FFD4A3')
    ];
    workstations.forEach(ws => scene.add(ws));

    const sofaGeometry = new THREE.BoxGeometry(4, 0.9, 1.3);
    const sofaMaterial = new THREE.MeshStandardMaterial({
      color: '#6BB5E0',
      metalness: 0.1,
      roughness: 0.9
    });
    const sofa = new THREE.Mesh(sofaGeometry, sofaMaterial);
    sofa.position.set(6, 0.4, -6);
    sofa.castShadow = true;
    sofa.receiveShadow = true;
    scene.add(sofa);

    const sofaBackGeometry = new THREE.BoxGeometry(4, 0.7, 0.4);
    const sofaBack = new THREE.Mesh(sofaBackGeometry, sofaMaterial);
    sofaBack.position.set(6, 0.7, -6.6);
    sofaBack.castShadow = true;
    scene.add(sofaBack);

    const tableGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32);
    const tableMaterial = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.3,
      roughness: 0.6
    });
    [[-1, -3.5], [1, -3.5]].forEach(([x, z]) => {
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.set(6 + x, 0.4, z);
      table.castShadow = true;
      table.receiveShadow = true;
      scene.add(table);
    });

    const createWaitingChair = (position, rotation = 0) => {
      const chair = new THREE.Group();

      const seatGeometry = new THREE.BoxGeometry(0.5, 0.08, 0.5);
      const chairMaterial = new THREE.MeshStandardMaterial({
        color: '#FFB3C6',
        metalness: 0.15,
        roughness: 0.85
      });
      const seat = new THREE.Mesh(seatGeometry, chairMaterial);
      seat.position.y = 0.4;
      seat.castShadow = true;
      chair.add(seat);

      const backGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.08);
      const back = new THREE.Mesh(backGeometry, chairMaterial);
      back.position.set(0, 0.65, -0.21);
      back.castShadow = true;
      chair.add(back);

      const legGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 12);
      const legMaterial = new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0.5,
        roughness: 0.5
      });
      [[0.2, 0.2], [-0.2, 0.2], [0.2, -0.2], [-0.2, -0.2]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(x, 0.2, z);
        leg.castShadow = true;
        chair.add(leg);
      });

      chair.position.copy(position);
      chair.rotation.y = rotation;
      return chair;
    };

    scene.add(createWaitingChair(new THREE.Vector3(-11, 0, -1), Math.PI / 2));
    scene.add(createWaitingChair(new THREE.Vector3(-11, 0, 1), Math.PI / 2));

    const waitingTableGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
    const waitingTable = new THREE.Mesh(waitingTableGeometry, tableMaterial);
    waitingTable.position.set(-9.5, 0.45, 0);
    waitingTable.castShadow = true;
    scene.add(waitingTable);

    const waitingTableLegGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.45, 12);
    const waitingTableLeg = new THREE.Mesh(waitingTableLegGeometry, new THREE.MeshStandardMaterial({
      color: '#666666',
      metalness: 0.6,
      roughness: 0.4
    }));
    waitingTableLeg.position.set(-9.5, 0.225, 0);
    waitingTableLeg.castShadow = true;
    scene.add(waitingTableLeg);

    const tvStandGeometry = new THREE.BoxGeometry(2.5, 0.15, 0.5);
    const tvStandMaterial = new THREE.MeshStandardMaterial({ color: '#2a2a2a' });
    const tvStand = new THREE.Mesh(tvStandGeometry, tvStandMaterial);
    tvStand.position.set(6, 0.8, -7.5);
    tvStand.castShadow = true;
    scene.add(tvStand);

    const tvGeometry = new THREE.BoxGeometry(2, 1.2, 0.12);
    const tvMaterial = new THREE.MeshStandardMaterial({ color: '#1a1a1a' });
    const tv = new THREE.Mesh(tvGeometry, tvMaterial);
    tv.position.set(6, 1.5, -7.45);
    tv.castShadow = true;
    scene.add(tv);

    const tvScreenGeometry = new THREE.PlaneGeometry(1.9, 1.1);
    const tvScreenMaterial = new THREE.MeshBasicMaterial({
      color: '#4AA8D8',
      emissive: '#3A98C8',
      emissiveIntensity: 0.35
    });
    const tvScreen = new THREE.Mesh(tvScreenGeometry, tvScreenMaterial);
    tvScreen.position.set(6, 1.5, -7.39);
    scene.add(tvScreen);

    // Create diverse plant types based on reference image

    // Type 1: Tall leafy plant (like Monstera)
    const createTallLeafyPlant = (position, scale = 1) => {
      const plant = new THREE.Group();

      const potGeometry = new THREE.CylinderGeometry(0.25 * scale, 0.2 * scale, 0.5 * scale, 16);
      const potMaterial = new THREE.MeshStandardMaterial({
        color: '#C8B8A0',
        metalness: 0.1,
        roughness: 0.9
      });
      const pot = new THREE.Mesh(potGeometry, potMaterial);
      pot.castShadow = true;
      plant.add(pot);

      const leafMaterial = new THREE.MeshStandardMaterial({
        color: '#2D5F3B',
        metalness: 0,
        roughness: 0.9
      });

      for (let i = 0; i < 8; i++) {
        const leafGeometry = new THREE.BoxGeometry(0.3 * scale, 0.6 * scale, 0.02);
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        const angle = (i / 8) * Math.PI * 2;
        const height = 0.3 + (i * 0.15) * scale;
        leaf.position.set(
          Math.cos(angle) * 0.15 * scale,
          height,
          Math.sin(angle) * 0.15 * scale
        );
        leaf.rotation.z = angle;
        leaf.rotation.x = Math.PI / 6;
        leaf.castShadow = true;
        plant.add(leaf);
      }

      plant.position.copy(position);
      return plant;
    };

    // Type 2: Bushy plant with round pot
    const createBushyPlant = (position, scale = 1) => {
      const plant = new THREE.Group();

      const potGeometry = new THREE.SphereGeometry(0.2 * scale, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const potMaterial = new THREE.MeshStandardMaterial({
        color: '#8B7355',
        metalness: 0.15,
        roughness: 0.85
      });
      const pot = new THREE.Mesh(potGeometry, potMaterial);
      pot.castShadow = true;
      plant.add(pot);

      const foliageMaterial = new THREE.MeshStandardMaterial({
        color: '#4A9B5F',
        metalness: 0,
        roughness: 0.95
      });

      for (let i = 0; i < 12; i++) {
        const foliageGeometry = new THREE.SphereGeometry(0.08 * scale, 8, 8);
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        const angle = (i / 12) * Math.PI * 2;
        const radius = 0.12 * scale;
        foliage.position.set(
          Math.cos(angle) * radius,
          0.15 * scale + Math.random() * 0.1 * scale,
          Math.sin(angle) * radius
        );
        foliage.castShadow = true;
        plant.add(foliage);
      }

      plant.position.copy(position);
      return plant;
    };

    // Type 3: Tall cactus-like plant
    const createCactusPlant = (position, scale = 1) => {
      const plant = new THREE.Group();

      const potGeometry = new THREE.CylinderGeometry(0.18 * scale, 0.15 * scale, 0.35 * scale, 16);
      const potMaterial = new THREE.MeshStandardMaterial({
        color: '#9B8B7E',
        metalness: 0.1,
        roughness: 0.9
      });
      const pot = new THREE.Mesh(potGeometry, potMaterial);
      pot.castShadow = true;
      plant.add(pot);

      const cactusGeometry = new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 0.8 * scale, 12);
      const cactusMaterial = new THREE.MeshStandardMaterial({
        color: '#5B8C5A',
        metalness: 0,
        roughness: 0.95
      });
      const cactus = new THREE.Mesh(cactusGeometry, cactusMaterial);
      cactus.position.y = 0.55 * scale;
      cactus.castShadow = true;
      plant.add(cactus);

      plant.position.copy(position);
      return plant;
    };

    // Type 4: Palm-like plant with stand
    const createPalmPlant = (position, scale = 1) => {
      const plant = new THREE.Group();

      // Stand legs
      const standMaterial = new THREE.MeshStandardMaterial({
        color: '#D4C5B0',
        metalness: 0.2,
        roughness: 0.8
      });

      for (let i = 0; i < 3; i++) {
        const legGeometry = new THREE.CylinderGeometry(0.02 * scale, 0.025 * scale, 0.4 * scale, 8);
        const leg = new THREE.Mesh(legGeometry, standMaterial);
        const angle = (i / 3) * Math.PI * 2;
        leg.position.set(
          Math.cos(angle) * 0.15 * scale,
          0.2 * scale,
          Math.sin(angle) * 0.15 * scale
        );
        leg.rotation.z = Math.sin(angle) * 0.1;
        leg.rotation.x = Math.cos(angle) * 0.1;
        leg.castShadow = true;
        plant.add(leg);
      }

      const potGeometry = new THREE.SphereGeometry(0.22 * scale, 16, 16);
      const potMaterial = new THREE.MeshStandardMaterial({
        color: '#E8DCC8',
        metalness: 0.1,
        roughness: 0.85
      });
      const pot = new THREE.Mesh(potGeometry, potMaterial);
      pot.position.y = 0.4 * scale;
      pot.castShadow = true;
      plant.add(pot);

      const leafMaterial = new THREE.MeshStandardMaterial({
        color: '#3A8F4A',
        metalness: 0,
        roughness: 0.9
      });

      for (let i = 0; i < 6; i++) {
        const leafGeometry = new THREE.BoxGeometry(0.08 * scale, 0.7 * scale, 0.02);
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        const angle = (i / 6) * Math.PI * 2;
        leaf.position.set(
          Math.cos(angle) * 0.05 * scale,
          0.75 * scale,
          Math.sin(angle) * 0.05 * scale
        );
        leaf.rotation.z = angle;
        leaf.rotation.x = -Math.PI / 4;
        leaf.castShadow = true;
        plant.add(leaf);
      }

      plant.position.copy(position);
      return plant;
    };

    // Add plants throughout the office, especially in empty spaces
    const allPlants = [
      // Corner plants (large)
      createTallLeafyPlant(new THREE.Vector3(-13, 0, -13), 1.8),
      createPalmPlant(new THREE.Vector3(13, 0, -13), 1.6),
      createTallLeafyPlant(new THREE.Vector3(-13, 0, 13), 1.5),
      createPalmPlant(new THREE.Vector3(13, 0, 13), 1.8),

      // Left side empty space (walkway area)
      createBushyPlant(new THREE.Vector3(-11, 0, -6), 1.3),
      createCactusPlant(new THREE.Vector3(-11, 0, -2), 1.2),
      createBushyPlant(new THREE.Vector3(-11, 0, 3), 1.4),
      createTallLeafyPlant(new THREE.Vector3(-11, 0, 7), 1.5),
      createPalmPlant(new THREE.Vector3(-8, 0, -8), 1.2),
      createCactusPlant(new THREE.Vector3(-8, 0, 6), 1.1),

      // Between workstations
      createBushyPlant(new THREE.Vector3(-1.5, 0, -6), 0.9),
      createCactusPlant(new THREE.Vector3(1.5, 0, -6), 0.9),
      createBushyPlant(new THREE.Vector3(-1.5, 0, -2), 0.9),

      // Collaborative area
      createPalmPlant(new THREE.Vector3(4, 0, -3.5), 1.1),
      createBushyPlant(new THREE.Vector3(8, 0, -3.5), 1),
      createTallLeafyPlant(new THREE.Vector3(9, 0, -8), 1.2),

      // Additional decoration plants
      createCactusPlant(new THREE.Vector3(-6, 0, 1), 0.8),
      createBushyPlant(new THREE.Vector3(6, 0, 1), 0.8),
      createPalmPlant(new THREE.Vector3(-3, 0, 2), 0.9),
    ];

    allPlants.forEach(p => scene.add(p));

    // ═══════════════════════════════════════════════════════════
    // ENHANCED OFFICE ENVIRONMENT - VISUAL RICHNESS & DETAIL
    // ═══════════════════════════════════════════════════════════

    // === MEETING AREA (Right side of office) ===
    const createMeetingTable = () => {
      const table = new THREE.Group();

      // Table top (thicker, more substantial)
      const topGeometry = new THREE.BoxGeometry(3.5, 0.15, 2);
      const topMaterial = new THREE.MeshStandardMaterial({
        color: '#E8DCC8',
        metalness: 0.2,
        roughness: 0.7
      });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.y = 0.75;
      top.castShadow = true;
      top.receiveShadow = true;
      table.add(top);

      // Legs (thicker)
      const legGeometry = new THREE.BoxGeometry(0.12, 0.7, 0.12);
      const legMaterial = new THREE.MeshStandardMaterial({
        color: '#A89080',
        metalness: 0.15,
        roughness: 0.8
      });

      [[1.6, 0.9], [-1.6, 0.9], [1.6, -0.9], [-1.6, -0.9]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(x, 0.35, z);
        leg.castShadow = true;
        table.add(leg);
      });

      return table;
    };

    const createMeetingChair = () => {
      const chair = new THREE.Group();

      const seatGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
      const chairMaterial = new THREE.MeshStandardMaterial({
        color: '#6BA8CC',
        metalness: 0.15,
        roughness: 0.85
      });
      const seat = new THREE.Mesh(seatGeometry, chairMaterial);
      seat.position.y = 0.45;
      seat.castShadow = true;
      chair.add(seat);

      const backGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.1);
      const back = new THREE.Mesh(backGeometry, chairMaterial);
      back.position.set(0, 0.75, -0.2);
      back.castShadow = true;
      chair.add(back);

      // Legs
      const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 12);
      const legMaterial = new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0.6,
        roughness: 0.4
      });
      [[0.2, 0.2], [-0.2, 0.2], [0.2, -0.2], [-0.2, -0.2]].forEach(([x, z]) => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(x, 0.225, z);
        leg.castShadow = true;
        chair.add(leg);
      });

      return chair;
    };

    // Add meeting area
    const meetingTable = createMeetingTable();
    meetingTable.position.set(10, 0, 4);
    scene.add(meetingTable);

    // Meeting chairs around table
    const meetingChairPositions = [
      [10, 0, 2.8, 0],
      [10, 0, 5.2, Math.PI],
      [8.5, 0, 4, -Math.PI / 2],
      [11.5, 0, 4, Math.PI / 2]
    ];

    meetingChairPositions.forEach(([x, y, z, rotation]) => {
      const chair = createMeetingChair();
      chair.position.set(x, y, z);
      chair.rotation.y = rotation;
      scene.add(chair);
    });

    // Meeting area whiteboard (larger, more prominent)
    const meetingBoardGeometry = new THREE.BoxGeometry(2.5, 1.8, 0.15);
    const meetingBoardMaterial = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.1,
      roughness: 0.9
    });
    const meetingBoard = new THREE.Mesh(meetingBoardGeometry, meetingBoardMaterial);
    meetingBoard.position.set(14.85, 2.5, 4);
    meetingBoard.castShadow = true;
    scene.add(meetingBoard);

    // Board frame
    const frameGeometry = new THREE.BoxGeometry(2.7, 2, 0.18);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: '#2a2a2a' });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(14.82, 2.5, 4);
    frame.castShadow = true;
    scene.add(frame);

    // === ENHANCED LOUNGE AREA ===

    // Side table next to sofa
    const createSideTable = () => {
      const table = new THREE.Group();

      const topGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 24);
      const topMaterial = new THREE.MeshStandardMaterial({
        color: '#D4C5B0',
        metalness: 0.2,
        roughness: 0.7
      });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.y = 0.5;
      top.castShadow = true;
      table.add(top);

      const legGeometry = new THREE.CylinderGeometry(0.05, 0.06, 0.5, 12);
      const legMaterial = new THREE.MeshStandardMaterial({
        color: '#8B7355',
        metalness: 0.3,
        roughness: 0.6
      });
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.y = 0.25;
      leg.castShadow = true;
      table.add(leg);

      return table;
    };

    const sideTable1 = createSideTable();
    sideTable1.position.set(4.5, 0, -5.5);
    scene.add(sideTable1);

    const sideTable2 = createSideTable();
    sideTable2.position.set(7.5, 0, -5.5);
    scene.add(sideTable2);

    // Decorative books on side tables
    const createBook = (color) => {
      const bookGeometry = new THREE.BoxGeometry(0.15, 0.2, 0.12);
      const bookMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.1,
        roughness: 0.9
      });
      return new THREE.Mesh(bookGeometry, bookMaterial);
    };

    const book1 = createBook('#FF6B6B');
    book1.position.set(4.5, 0.56, -5.5);
    book1.rotation.y = 0.3;
    book1.castShadow = true;
    scene.add(book1);

    const book2 = createBook('#4ECDC4');
    book2.position.set(4.6, 0.56, -5.4);
    book2.rotation.y = -0.2;
    book2.castShadow = true;
    scene.add(book2);

    // Coffee mug
    const createMug = () => {
      const mug = new THREE.Group();

      const bodyGeometry = new THREE.CylinderGeometry(0.06, 0.05, 0.12, 16);
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: '#FFD93D',
        metalness: 0.2,
        roughness: 0.8
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.castShadow = true;
      mug.add(body);

      // Handle
      const handleGeometry = new THREE.TorusGeometry(0.04, 0.01, 8, 16, Math.PI);
      const handle = new THREE.Mesh(handleGeometry, bodyMaterial);
      handle.position.set(0.06, 0, 0);
      handle.rotation.y = Math.PI / 2;
      handle.castShadow = true;
      mug.add(handle);

      return mug;
    };

    const mug = createMug();
    mug.position.set(7.5, 0.56, -5.5);
    scene.add(mug);

    // === DECORATIVE SHELVES ===

    const createShelf = (width = 1.5) => {
      const shelf = new THREE.Group();

      // Shelves (3 levels, thicker)
      for (let i = 0; i < 3; i++) {
        const shelfGeometry = new THREE.BoxGeometry(width, 0.08, 0.35);
        const shelfMaterial = new THREE.MeshStandardMaterial({
          color: '#C8B8A0',
          metalness: 0.1,
          roughness: 0.9
        });
        const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelfMesh.position.y = 0.5 + i * 0.6;
        shelfMesh.castShadow = true;
        shelfMesh.receiveShadow = true;
        shelf.add(shelfMesh);
      }

      // Side supports (thicker)
      const supportGeometry = new THREE.BoxGeometry(0.08, 2, 0.35);
      const supportMaterial = new THREE.MeshStandardMaterial({
        color: '#8B7355',
        metalness: 0.15,
        roughness: 0.85
      });

      [-width / 2 + 0.04, width / 2 - 0.04].forEach(x => {
        const support = new THREE.Mesh(supportGeometry, supportMaterial);
        support.position.set(x, 1, 0);
        support.castShadow = true;
        shelf.add(support);
      });

      return shelf;
    };

    // Add shelves to different areas
    const shelf1 = createShelf(1.8);
    shelf1.position.set(-14.75, 0, -10);
    shelf1.rotation.y = Math.PI / 2;
    scene.add(shelf1);

    const shelf2 = createShelf(2);
    shelf2.position.set(-14.75, 0, 10);
    shelf2.rotation.y = Math.PI / 2;
    scene.add(shelf2);

    const shelf3 = createShelf(1.5);
    shelf3.position.set(0, 0, -14.75);
    scene.add(shelf3);

    // === DECORATIVE OBJECTS ON SHELVES ===

    const createVase = (color) => {
      const vase = new THREE.Group();

      const bodyGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.25, 16);
      const vaseMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.6
      });
      const body = new THREE.Mesh(bodyGeometry, vaseMaterial);
      body.castShadow = true;
      vase.add(body);

      const neckGeometry = new THREE.CylinderGeometry(0.04, 0.08, 0.1, 16);
      const neck = new THREE.Mesh(neckGeometry, vaseMaterial);
      neck.position.y = 0.175;
      neck.castShadow = true;
      vase.add(neck);

      return vase;
    };

    // Add decorative items to shelves
    const vase1 = createVase('#FF6B6B');
    vase1.position.set(-14.6, 0.58, -10);
    scene.add(vase1);

    const vase2 = createVase('#4ECDC4');
    vase2.position.set(-14.6, 1.18, -9.5);
    scene.add(vase2);

    const vase3 = createVase('#FFD93D');
    vase3.position.set(-14.6, 1.78, -10.5);
    scene.add(vase3);

    // === ADDITIONAL PLANTS (30-40 total across office) ===

    const additionalPlants = [
      // Along back wall (structured line)
      createBushyPlant(new THREE.Vector3(-10, 0, -14), 1.1),
      createTallLeafyPlant(new THREE.Vector3(-7, 0, -14), 1.3),
      createCactusPlant(new THREE.Vector3(-4, 0, -14), 1),
      createPalmPlant(new THREE.Vector3(2, 0, -14), 1.2),
      createBushyPlant(new THREE.Vector3(5, 0, -14), 1.15),
      createTallLeafyPlant(new THREE.Vector3(8, 0, -14), 1.25),
      createCactusPlant(new THREE.Vector3(11, 0, -14), 1.1),

      // Along right wall
      createPalmPlant(new THREE.Vector3(14, 0, -10), 1.3),
      createBushyPlant(new THREE.Vector3(14, 0, -6), 1.2),
      createTallLeafyPlant(new THREE.Vector3(14, 0, -2), 1.4),
      createCactusPlant(new THREE.Vector3(14, 0, 2), 1.1),
      createPalmPlant(new THREE.Vector3(14, 0, 6), 1.35),
      createBushyPlant(new THREE.Vector3(14, 0, 10), 1.25),

      // Left wall clusters
      createTallLeafyPlant(new THREE.Vector3(-14, 0, -8), 1.4),
      createBushyPlant(new THREE.Vector3(-14, 0, -4), 1.15),
      createPalmPlant(new THREE.Vector3(-14, 0, 4), 1.3),
      createCactusPlant(new THREE.Vector3(-14, 0, 8), 1.2),

      // Around meeting area
      createPalmPlant(new THREE.Vector3(12, 0, 1.5), 1.2),
      createBushyPlant(new THREE.Vector3(12, 0, 6.5), 1.1),
      createTallLeafyPlant(new THREE.Vector3(8, 0, 2), 1.15),
      createCactusPlant(new THREE.Vector3(8, 0, 6), 1),

      // Around workstations (structured placement)
      createBushyPlant(new THREE.Vector3(-7, 0, -9), 0.95),
      createCactusPlant(new THREE.Vector3(-4, 0, -9), 0.9),
      createBushyPlant(new THREE.Vector3(-1, 0, -9), 0.95),
      createCactusPlant(new THREE.Vector3(2, 0, -9), 0.9),

      createPalmPlant(new THREE.Vector3(-7, 0, -3), 1),
      createBushyPlant(new THREE.Vector3(-4, 0, -3), 0.95),
      createCactusPlant(new THREE.Vector3(-1, 0, -3), 0.9),
      createPalmPlant(new THREE.Vector3(2, 0, -3), 1),

      // Lounge area decoration
      createBushyPlant(new THREE.Vector3(3.5, 0, -6.5), 1.1),
      createPalmPlant(new THREE.Vector3(8.5, 0, -6.5), 1.15),
      createTallLeafyPlant(new THREE.Vector3(5, 0, -8), 1.25),

      // Entrance/walkway area
      createPalmPlant(new THREE.Vector3(-9, 0, -10), 1.4),
      createBushyPlant(new THREE.Vector3(-9, 0, 6), 1.3),
      createTallLeafyPlant(new THREE.Vector3(-7, 0, -11), 1.35),
    ];

    additionalPlants.forEach(p => scene.add(p));

    // === DESK DECORATIONS (Small items on workstation desks) ===

    const createDeskLamp = () => {
      const lamp = new THREE.Group();

      const baseGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.03, 16);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: '#2a2a2a',
        metalness: 0.6,
        roughness: 0.4
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.castShadow = true;
      lamp.add(base);

      const armGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8);
      const arm = new THREE.Mesh(armGeometry, baseMaterial);
      arm.position.y = 0.15;
      arm.rotation.z = 0.3;
      arm.castShadow = true;
      lamp.add(arm);

      const shadeGeometry = new THREE.ConeGeometry(0.08, 0.12, 16);
      const shadeMaterial = new THREE.MeshStandardMaterial({
        color: '#FFD93D',
        metalness: 0.1,
        roughness: 0.9,
        emissive: '#FFD93D',
        emissiveIntensity: 0.2
      });
      const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
      shade.position.set(0.1, 0.25, 0);
      shade.rotation.z = 1.2;
      shade.castShadow = true;
      lamp.add(shade);

      return lamp;
    };

    // Add desk lamps to some workstations
    const deskLampPositions = [
      [-6, 0.82, -8.3],
      [-3, 0.82, -8.3],
      [0, 0.82, -4.3],
      [3, 0.82, -4.3],
      [8, 0.82, -6.3]
    ];

    deskLampPositions.forEach(pos => {
      const lamp = createDeskLamp();
      lamp.position.set(pos[0], pos[1], pos[2]);
      scene.add(lamp);
    });

    // === FLOOR RUG UNDER MEETING TABLE ===
    const meetingRugGeometry = new THREE.BoxGeometry(5, 0.05, 3.5);
    const meetingRugMaterial = new THREE.MeshStandardMaterial({
      color: '#D4A5FF',
      metalness: 0.05,
      roughness: 0.95
    });
    const meetingRug = new THREE.Mesh(meetingRugGeometry, meetingRugMaterial);
    meetingRug.position.set(10, 0.03, 4);
    meetingRug.receiveShadow = true;
    scene.add(meetingRug);

    // === CEILING LIGHTS (for visual interest) ===
    const createCeilingLight = () => {
      const light = new THREE.Group();

      const wireGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1, 8);
      const wireMaterial = new THREE.MeshStandardMaterial({ color: '#333333' });
      const wire = new THREE.Mesh(wireGeometry, wireMaterial);
      wire.position.y = 5;
      light.add(wire);

      const shadeGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.3, 16);
      const shadeMaterial = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.2,
        roughness: 0.7,
        emissive: '#FFFFEE',
        emissiveIntensity: 0.3
      });
      const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
      shade.position.y = 4.35;
      shade.castShadow = true;
      light.add(shade);

      return light;
    };

    // Add ceiling lights
    const lightPositions = [
      [-3, 0, -6],
      [0, 0, -6],
      [3, 0, -6],
      [6, 0, -5],
      [10, 0, 4]
    ];

    lightPositions.forEach(pos => {
      const cLight = createCeilingLight();
      cLight.position.set(pos[0], pos[1], pos[2]);
      scene.add(cLight);
    });

    // === WALL DECORATIONS - More artwork ===
    createArtwork(1.5, 1.2, '#95E1D5', new THREE.Vector3(3, 3.5, -14.9));
    createArtwork(1.5, 1.2, '#F8A5C2', new THREE.Vector3(6, 3.5, -14.9));
    createArtwork(2, 1.5, '#C9B8F5', new THREE.Vector3(13, 3.5, -14.9));

    // Wall art on side walls
    const createSideWallArt = (width, height, color, position, rotation) => {
      const frameGeometry = new THREE.BoxGeometry(width, height, 0.15);
      const frameMaterial = new THREE.MeshStandardMaterial({ color: '#333333' });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.copy(position);
      frame.rotation.y = rotation;
      frame.castShadow = true;

      const canvasGeometry = new THREE.PlaneGeometry(width - 0.2, height - 0.2);
      const canvasMaterial = new THREE.MeshStandardMaterial({ color: color });
      const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
      canvas.position.copy(position);
      canvas.position.x += rotation === Math.PI / 2 ? 0.08 : -0.08;
      canvas.rotation.y = rotation;

      scene.add(frame);
      scene.add(canvas);
    };

    createSideWallArt(2, 1.5, '#FFB3AA', new THREE.Vector3(-14.9, 3.5, -6), Math.PI / 2);
    createSideWallArt(1.5, 1.2, '#AAD4FF', new THREE.Vector3(-14.9, 3.5, 6), Math.PI / 2);
    createSideWallArt(2, 1.5, '#FFDAA5', new THREE.Vector3(14.9, 3.5, 0), -Math.PI / 2);
    createSideWallArt(1.5, 1.2, '#C5FFA5', new THREE.Vector3(14.9, 3.5, 8), -Math.PI / 2);

    // ═══════════════════════════════════════════════════════════
    // PREMIUM WALL ELEMENTS
    // ═══════════════════════════════════════════════════════════

    // === 1. AGENT STATUS BOARD ===

    // Create canvas for dynamic text rendering
    const createStatusBoard = () => {
      const board = new THREE.Group();

      // Board background
      const boardGeometry = new THREE.BoxGeometry(3, 2, 0.15);
      const boardMaterial = new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        metalness: 0.6,
        roughness: 0.4,
        emissive: '#E53935',
        emissiveIntensity: 0.1
      });
      const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial);
      boardMesh.castShadow = true;
      board.add(boardMesh);

      // Screen/display area
      const screenGeometry = new THREE.PlaneGeometry(2.7, 1.7);
      const screenMaterial = new THREE.MeshStandardMaterial({
        color: '#2a2a2a',
        emissive: '#2a2a2a',
        emissiveIntensity: 0.2
      });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.z = 0.08;
      board.add(screen);

      // Create text using canvas texture
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // Update function to render current stats
      const updateStats = () => {
        const currentAgents = useGameStore.getState().agents;
        const agentsOnline = currentAgents.length;
        const tasksRunning = currentAgents.filter(a =>
          a.state === 'working' || a.state === 'active' || a.state === 'thinking'
        ).length;
        const errors = currentAgents.filter(a => a.state === 'error').length;

        // Clear canvas
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, 1024, 1024);

        // Title
        ctx.font = 'bold 80px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('AGENT STATUS', 512, 150);

        // Stats
        const stats = [
          { label: 'AGENTS ONLINE', value: agentsOnline, y: 350 },
          { label: 'TASKS RUNNING', value: tasksRunning, y: 550 },
          { label: 'ERRORS', value: errors, y: 750 }
        ];

        stats.forEach(stat => {
          // Label
          ctx.font = '50px Arial';
          ctx.fillStyle = '#999999';
          ctx.fillText(stat.label, 512, stat.y);

          // Value
          ctx.font = 'bold 120px Arial';
          ctx.fillStyle = stat.label === 'ERRORS' ? '#E53935' : '#ffffff';
          ctx.fillText(stat.value.toString(), 512, stat.y + 100);
        });

        texture.needsUpdate = true;
      };

      const texture = new THREE.CanvasTexture(canvas);
      const textMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
      });

      const textPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 1.6),
        textMaterial
      );
      textPlane.position.z = 0.09;
      board.add(textPlane);

      // Initial update
      updateStats();

      // Update every 2 seconds
      setInterval(updateStats, 2000);

      // Glow effect corners
      for (let i = 0; i < 4; i++) {
        const cornerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const cornerMaterial = new THREE.MeshStandardMaterial({
          color: '#E53935',
          emissive: '#E53935',
          emissiveIntensity: 0.8
        });
        const corner = new THREE.Mesh(cornerGeometry, cornerMaterial);
        corner.position.set(
          i % 2 === 0 ? -1.35 : 1.35,
          i < 2 ? 0.85 : -0.85,
          0.08
        );
        board.add(corner);
      }

      return board;
    };

    const statusBoard = createStatusBoard();
    statusBoard.position.set(-5, 3.5, -14.9);
    scene.add(statusBoard);

    // === 2. TAGLINE TEXT ON WALLS ===

    // Helper to create text on wall
    const createWallText = (text, position, rotation, size = 0.8) => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, 2048, 512);

      ctx.font = 'bold 120px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 1024, 256);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9
      });

      const geometry = new THREE.PlaneGeometry(8 * size, 2 * size);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.rotation.y = rotation;

      return mesh;
    };

    // Tagline 1: "WHERE AI AGENTS WORK"
    const tagline1 = createWallText(
      'WHERE AI AGENTS WORK',
      new THREE.Vector3(8, 4.5, -14.9),
      0,
      0.6
    );
    scene.add(tagline1);

    // Tagline 2: "INTELLIGENCE IN MOTION"
    const tagline2 = createWallText(
      'INTELLIGENCE IN MOTION',
      new THREE.Vector3(-14.9, 4.5, 0),
      Math.PI / 2,
      0.6
    );
    scene.add(tagline2);

    // === 3. NEON ACCENT LINES ===

    // Helper to create glowing line
    const createNeonLine = (start, end, color = '#E53935') => {
      const points = [start, end];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 3
      });
      const line = new THREE.Line(geometry, material);

      // Add glow effect with tube geometry
      const curve = new THREE.LineCurve3(start, end);
      const tubeGeometry = new THREE.TubeGeometry(curve, 1, 0.03, 8, false);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);

      // Add outer glow
      const glowGeometry = new THREE.TubeGeometry(curve, 1, 0.08, 8, false);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.2
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);

      const group = new THREE.Group();
      group.add(tube);
      group.add(glow);

      return group;
    };

    // Top edge accent lines (back wall)
    const topLine1 = createNeonLine(
      new THREE.Vector3(-10, 5.5, -14.8),
      new THREE.Vector3(-2, 5.5, -14.8)
    );
    scene.add(topLine1);

    const topLine2 = createNeonLine(
      new THREE.Vector3(2, 5.5, -14.8),
      new THREE.Vector3(10, 5.5, -14.8)
    );
    scene.add(topLine2);

    // Corner accent lines (left wall)
    const cornerLine1 = createNeonLine(
      new THREE.Vector3(-14.8, 4, -12),
      new THREE.Vector3(-14.8, 4, -8)
    );
    scene.add(cornerLine1);

    const cornerLine2 = createNeonLine(
      new THREE.Vector3(-14.8, 4, 8),
      new THREE.Vector3(-14.8, 4, 12)
    );
    scene.add(cornerLine2);

    // Right wall accent
    const rightLine = createNeonLine(
      new THREE.Vector3(14.8, 4.5, -4),
      new THREE.Vector3(14.8, 4.5, 4)
    );
    scene.add(rightLine);

    // Vertical accent near status board
    const verticalAccent = createNeonLine(
      new THREE.Vector3(-7.5, 2.5, -14.8),
      new THREE.Vector3(-7.5, 4.5, -14.8)
    );
    scene.add(verticalAccent);

    // ═══════════════════════════════════════════════════════════
    // END OF PREMIUM WALL ELEMENTS
    // ═══════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════
    // AI AGENT FUNCTIONAL ROOMS
    // ═══════════════════════════════════════════════════════════

    // === 1. SERVER ROOM (Back Left Corner) ===

    // Server room floor zone
    const serverFloorGeometry = new THREE.BoxGeometry(4.5, 0.12, 4.5);
    const serverFloorMaterial = new THREE.MeshStandardMaterial({
      color: '#2A3F5F',
      metalness: 0.3,
      roughness: 0.7
    });
    const serverFloor = new THREE.Mesh(serverFloorGeometry, serverFloorMaterial);
    serverFloor.position.set(-11, 0.06, 11);
    serverFloor.receiveShadow = true;
    scene.add(serverFloor);

    // Server racks (3 racks)
    const createServerRack = () => {
      const rack = new THREE.Group();

      // Main frame
      const frameGeometry = new THREE.BoxGeometry(0.8, 2.2, 0.6);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        metalness: 0.6,
        roughness: 0.4
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.castShadow = true;
      rack.add(frame);

      // Server panels (5 levels)
      for (let i = 0; i < 5; i++) {
        const panelGeometry = new THREE.BoxGeometry(0.75, 0.35, 0.55);
        const panelMaterial = new THREE.MeshStandardMaterial({
          color: '#2d2d2d',
          metalness: 0.5,
          roughness: 0.6
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.y = -0.9 + i * 0.45;
        panel.castShadow = true;
        rack.add(panel);

        // Glowing indicator lights (3 per panel)
        for (let j = 0; j < 3; j++) {
          const lightGeometry = new THREE.SphereGeometry(0.02, 8, 8);
          const lightColor = Math.random() > 0.3 ? '#00FF88' : '#FF4444';
          const lightMaterial = new THREE.MeshStandardMaterial({
            color: lightColor,
            emissive: lightColor,
            emissiveIntensity: 0.8,
            metalness: 0.3,
            roughness: 0.5
          });
          const light = new THREE.Mesh(lightGeometry, lightMaterial);
          light.position.set(-0.3 + j * 0.15, -0.9 + i * 0.45, 0.28);
          rack.add(light);
        }
      }

      return rack;
    };

    // Add server racks
    const serverRack1 = createServerRack();
    serverRack1.position.set(-12.5, 1.1, 10);
    scene.add(serverRack1);

    const serverRack2 = createServerRack();
    serverRack2.position.set(-11, 1.1, 10);
    scene.add(serverRack2);

    const serverRack3 = createServerRack();
    serverRack3.position.set(-9.5, 1.1, 10);
    scene.add(serverRack3);

    // Server room sign
    const serverSignGeometry = new THREE.BoxGeometry(1.5, 0.4, 0.1);
    const serverSignMaterial = new THREE.MeshStandardMaterial({
      color: '#2A3F5F',
      emissive: '#4A7FA5',
      emissiveIntensity: 0.3
    });
    const serverSign = new THREE.Mesh(serverSignGeometry, serverSignMaterial);
    serverSign.position.set(-11, 3.2, 8.5);
    serverSign.castShadow = true;
    scene.add(serverSign);

    // === 2. CHARGING STATION (Right Side) ===

    // Charging station floor zone
    const chargeFloorGeometry = new THREE.BoxGeometry(4, 0.12, 4);
    const chargeFloorMaterial = new THREE.MeshStandardMaterial({
      color: '#4A5F7F',
      metalness: 0.2,
      roughness: 0.8
    });
    const chargeFloor = new THREE.Mesh(chargeFloorGeometry, chargeFloorMaterial);
    chargeFloor.position.set(11, 0.06, -10);
    chargeFloor.receiveShadow = true;
    scene.add(chargeFloor);

    // Charging pads (3 circular platforms)
    const createChargingPad = () => {
      const pad = new THREE.Group();

      // Base platform
      const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 24);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: '#5A8FB0',
        metalness: 0.4,
        roughness: 0.6
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.castShadow = true;
      pad.add(base);

      // Glowing ring
      const ringGeometry = new THREE.TorusGeometry(0.45, 0.05, 16, 32);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: '#00FFFF',
        emissive: '#00FFFF',
        emissiveIntensity: 0.6,
        metalness: 0.3,
        roughness: 0.5
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.y = 0.08;
      ring.rotation.x = Math.PI / 2;
      pad.add(ring);

      // Energy particles (small spheres)
      for (let i = 0; i < 4; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const particleMaterial = new THREE.MeshStandardMaterial({
          color: '#88FFFF',
          emissive: '#88FFFF',
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.7
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        const angle = (i / 4) * Math.PI * 2;
        particle.position.set(
          Math.cos(angle) * 0.3,
          0.12,
          Math.sin(angle) * 0.3
        );
        pad.add(particle);
      }

      return pad;
    };

    // Add charging pads
    const chargePad1 = createChargingPad();
    chargePad1.position.set(10, 0.08, -11);
    scene.add(chargePad1);

    const chargePad2 = createChargingPad();
    chargePad2.position.set(11, 0.08, -9);
    scene.add(chargePad2);

    const chargePad3 = createChargingPad();
    chargePad3.position.set(12, 0.08, -11);
    scene.add(chargePad3);

    // Charging station sign
    const chargeSignGeometry = new THREE.BoxGeometry(1.8, 0.4, 0.1);
    const chargeSignMaterial = new THREE.MeshStandardMaterial({
      color: '#5A8FB0',
      emissive: '#7AB8D0',
      emissiveIntensity: 0.3
    });
    const chargeSign = new THREE.Mesh(chargeSignGeometry, chargeSignMaterial);
    chargeSign.position.set(11, 3.2, -8);
    chargeSign.rotation.y = Math.PI;
    chargeSign.castShadow = true;
    scene.add(chargeSign);

    // === 3. TRAINING ZONE (Front Right) ===

    // Training zone floor
    const trainFloorGeometry = new THREE.BoxGeometry(5, 0.12, 4);
    const trainFloorMaterial = new THREE.MeshStandardMaterial({
      color: '#5F4A7F',
      metalness: 0.2,
      roughness: 0.8
    });
    const trainFloor = new THREE.Mesh(trainFloorGeometry, trainFloorMaterial);
    trainFloor.position.set(11, 0.06, 10);
    trainFloor.receiveShadow = true;
    scene.add(trainFloor);

    // Training screens (2 large screens)
    const createTrainingScreen = () => {
      const screen = new THREE.Group();

      // Screen frame
      const frameGeometry = new THREE.BoxGeometry(2, 1.5, 0.15);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: '#2a2a2a',
        metalness: 0.5,
        roughness: 0.5
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.castShadow = true;
      screen.add(frame);

      // Screen display
      const displayGeometry = new THREE.PlaneGeometry(1.9, 1.4);
      const displayMaterial = new THREE.MeshStandardMaterial({
        color: '#6A5ACD',
        emissive: '#6A5ACD',
        emissiveIntensity: 0.4,
        metalness: 0.2,
        roughness: 0.7
      });
      const display = new THREE.Mesh(displayGeometry, displayMaterial);
      display.position.z = 0.08;
      screen.add(display);

      // Data visualization (small cubes)
      for (let i = 0; i < 6; i++) {
        const cubeGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.02);
        const cubeMaterial = new THREE.MeshStandardMaterial({
          color: '#00FF88',
          emissive: '#00FF88',
          emissiveIntensity: 0.6,
          transparent: true,
          opacity: 0.8
        });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(
          -0.7 + (i % 3) * 0.7,
          -0.3 + Math.floor(i / 3) * 0.6,
          0.09
        );
        screen.add(cube);
      }

      return screen;
    };

    // Add training screens
    const trainScreen1 = createTrainingScreen();
    trainScreen1.position.set(13.85, 2, 9);
    trainScreen1.rotation.y = -Math.PI / 2;
    scene.add(trainScreen1);

    const trainScreen2 = createTrainingScreen();
    trainScreen2.position.set(13.85, 2, 11);
    trainScreen2.rotation.y = -Math.PI / 2;
    scene.add(trainScreen2);

    // Training podium
    const podiumGeometry = new THREE.CylinderGeometry(0.6, 0.7, 0.5, 16);
    const podiumMaterial = new THREE.MeshStandardMaterial({
      color: '#7A6A9F',
      metalness: 0.3,
      roughness: 0.7
    });
    const podium = new THREE.Mesh(podiumGeometry, podiumMaterial);
    podium.position.set(11, 0.25, 10);
    podium.castShadow = true;
    scene.add(podium);

    // Holographic data cubes floating above podium
    for (let i = 0; i < 3; i++) {
      const holoGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const holoMaterial = new THREE.MeshStandardMaterial({
        color: '#FF88FF',
        emissive: '#FF88FF',
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.6
      });
      const holoCube = new THREE.Mesh(holoGeometry, holoMaterial);
      holoCube.position.set(
        11 + (i - 1) * 0.4,
        1.2 + i * 0.3,
        10
      );
      holoCube.rotation.set(
        Math.PI / 4,
        Math.PI / 4,
        0
      );
      scene.add(holoCube);
    }

    // Training zone sign
    const trainSignGeometry = new THREE.BoxGeometry(1.8, 0.4, 0.1);
    const trainSignMaterial = new THREE.MeshStandardMaterial({
      color: '#7A6A9F',
      emissive: '#9A8ABF',
      emissiveIntensity: 0.3
    });
    const trainSign = new THREE.Mesh(trainSignGeometry, trainSignMaterial);
    trainSign.position.set(13.85, 3.2, 10);
    trainSign.rotation.y = -Math.PI / 2;
    trainSign.castShadow = true;
    scene.add(trainSign);

    // === 4. REPAIR / DEBUG ZONE (Left Side) ===

    // Debug zone floor
    const debugFloorGeometry = new THREE.BoxGeometry(4, 0.15, 4);
    const debugFloorMaterial = new THREE.MeshStandardMaterial({
      color: '#7F5A3F',
      metalness: 0.3,
      roughness: 0.7
    });
    const debugFloor = new THREE.Mesh(debugFloorGeometry, debugFloorMaterial);
    debugFloor.position.set(-11, 0.08, -10);
    debugFloor.receiveShadow = true;
    scene.add(debugFloor);

    // Repair platform (elevated)
    const platformGeometry = new THREE.CylinderGeometry(1, 1, 0.3, 24);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: '#8B7355',
      metalness: 0.4,
      roughness: 0.6
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(-11, 0.3, -10);
    platform.castShadow = true;
    scene.add(platform);

    // Warning lights around platform
    const warningPositions = [
      [1.2, 0],
      [0, 1.2],
      [-1.2, 0],
      [0, -1.2]
    ];

    warningPositions.forEach((pos, idx) => {
      const warningGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12);
      const warningColor = idx % 2 === 0 ? '#FF4444' : '#FFAA00';
      const warningMaterial = new THREE.MeshStandardMaterial({
        color: warningColor,
        emissive: warningColor,
        emissiveIntensity: 0.7,
        metalness: 0.3,
        roughness: 0.5
      });
      const warningLight = new THREE.Mesh(warningGeometry, warningMaterial);
      warningLight.position.set(-11 + pos[0], 0.53, -10 + pos[1]);
      scene.add(warningLight);
    });

    // Tool rack
    const toolRackGeometry = new THREE.BoxGeometry(0.3, 1.5, 2);
    const toolRackMaterial = new THREE.MeshStandardMaterial({
      color: '#6B5A4A',
      metalness: 0.2,
      roughness: 0.8
    });
    const toolRack = new THREE.Mesh(toolRackGeometry, toolRackMaterial);
    toolRack.position.set(-13, 0.75, -10);
    toolRack.castShadow = true;
    scene.add(toolRack);

    // Tools on rack (simple shapes)
    for (let i = 0; i < 5; i++) {
      const toolGeometry = new THREE.BoxGeometry(0.08, 0.25, 0.08);
      const toolMaterial = new THREE.MeshStandardMaterial({
        color: '#888888',
        metalness: 0.6,
        roughness: 0.4
      });
      const tool = new THREE.Mesh(toolGeometry, toolMaterial);
      tool.position.set(-12.85, 0.4 + i * 0.25, -11 + i * 0.4);
      tool.castShadow = true;
      scene.add(tool);
    }

    // Diagnostic panel
    const diagPanelGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.15);
    const diagPanelMaterial = new THREE.MeshStandardMaterial({
      color: '#3a3a3a',
      metalness: 0.5,
      roughness: 0.6
    });
    const diagPanel = new THREE.Mesh(diagPanelGeometry, diagPanelMaterial);
    diagPanel.position.set(-9, 1.5, -10);
    diagPanel.rotation.y = Math.PI / 2;
    diagPanel.castShadow = true;
    scene.add(diagPanel);

    // Diagnostic screen
    const diagScreenGeometry = new THREE.PlaneGeometry(0.75, 1.1);
    const diagScreenMaterial = new THREE.MeshStandardMaterial({
      color: '#FF6B35',
      emissive: '#FF6B35',
      emissiveIntensity: 0.3
    });
    const diagScreen = new THREE.Mesh(diagScreenGeometry, diagScreenMaterial);
    diagScreen.position.set(-9.08, 1.5, -10);
    diagScreen.rotation.y = Math.PI / 2;
    scene.add(diagScreen);

    // Debug zone sign
    const debugSignGeometry = new THREE.BoxGeometry(1.5, 0.4, 0.1);
    const debugSignMaterial = new THREE.MeshStandardMaterial({
      color: '#8B7355',
      emissive: '#AB9375',
      emissiveIntensity: 0.3
    });
    const debugSign = new THREE.Mesh(debugSignGeometry, debugSignMaterial);
    debugSign.position.set(-11, 3.2, -8);
    debugSign.castShadow = true;
    scene.add(debugSign);

    // Add connecting pathways/visual separators
    const pathwayMaterial = new THREE.MeshStandardMaterial({
      color: '#D4BD9A',
      metalness: 0.1,
      roughness: 0.9
    });

    // Pathway to server room
    const pathway1 = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.05, 1.5),
      pathwayMaterial
    );
    pathway1.position.set(-11, 0.03, 8);
    pathway1.receiveShadow = true;
    scene.add(pathway1);

    // Pathway to charging station
    const pathway2 = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.05, 2),
      pathwayMaterial
    );
    pathway2.position.set(9, 0.03, -10);
    pathway2.receiveShadow = true;
    scene.add(pathway2);

    // ═══════════════════════════════════════════════════════════
    // END OF AI AGENT FUNCTIONAL ROOMS
    // ═══════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════
    // END OF ENHANCED OFFICE ENVIRONMENT
    // ═══════════════════════════════════════════════════════════

    // Helper function to create a cute robot
    const createCuteRobot = (agent, targetScene = scene) => {
      const robot = new THREE.Group();
      robot.userData = { agentId: agent.id, agent: agent };

      // Define color scheme based on agent
      let mainColor, accentColor, eyeStyle;
      if (agent.name === 'Sleepy') {
        mainColor = '#A8D8F0';  // Soft blue
        accentColor = '#6BA8CC';
        eyeStyle = 'sleepy';
      } else if (agent.name === 'Joy') {
        mainColor = '#B8E6A8';  // Soft green
        accentColor = '#88C878';
        eyeStyle = 'happy';
      } else { // Glitch
        mainColor = '#FFB8C8';  // Soft pink/red
        accentColor = '#FF8FA8';
        eyeStyle = 'glitch';
      }

      // === BODY (small and compact) ===
      const bodyGeometry = new THREE.CapsuleGeometry(0.18, 0.25, 16, 32);
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.1,
        roughness: 0.8
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.15;
      body.castShadow = true;
      robot.add(body);

      // Body accent dot
      const dotGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const dotMaterial = new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: 0.2,
        roughness: 0.7
      });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.set(0, 0.15, 0.17);
      robot.add(dot);

      // === HEAD (large and rounded) ===
      const headGeometry = new THREE.SphereGeometry(0.35, 32, 32);
      const headMaterial = new THREE.MeshStandardMaterial({
        color: mainColor,
        metalness: 0.15,
        roughness: 0.75
      });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.y = 0.65;
      head.scale.set(1, 0.95, 0.95); // Slightly squashed for cuteness
      head.castShadow = true;
      robot.add(head);

      // === FACE FEATURES ===

      // White face area
      const faceGeometry = new THREE.CircleGeometry(0.28, 32);
      const faceMaterial = new THREE.MeshBasicMaterial({
        color: '#FFFFFF'
      });
      const face = new THREE.Mesh(faceGeometry, faceMaterial);
      face.position.set(0, 0.65, 0.34);
      robot.add(face);

      // === EYES (large and expressive) ===

      if (eyeStyle === 'sleepy') {
        // Half-closed sleepy eyes
        const eyeOutlineGeometry = new THREE.RingGeometry(0.08, 0.1, 32, 1, 0, Math.PI);
        const eyeOutlineMaterial = new THREE.MeshBasicMaterial({
          color: '#000000',
          side: THREE.DoubleSide
        });

        const leftEyeOutline = new THREE.Mesh(eyeOutlineGeometry, eyeOutlineMaterial);
        leftEyeOutline.position.set(-0.12, 0.67, 0.35);
        leftEyeOutline.rotation.z = Math.PI;
        robot.add(leftEyeOutline);

        const rightEyeOutline = new THREE.Mesh(eyeOutlineGeometry, eyeOutlineMaterial);
        rightEyeOutline.position.set(0.12, 0.67, 0.35);
        rightEyeOutline.rotation.z = Math.PI;
        robot.add(rightEyeOutline);

        // Small pupils
        const pupilGeometry = new THREE.CircleGeometry(0.04, 16);
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: '#000000' });

        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.12, 0.63, 0.351);
        robot.add(leftPupil);

        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.12, 0.63, 0.351);
        robot.add(rightPupil);

      } else if (eyeStyle === 'happy') {
        // Wide open smiling eyes
        const eyeWhiteGeometry = new THREE.CircleGeometry(0.09, 32);
        const eyeWhiteMaterial = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });

        const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        leftEyeWhite.position.set(-0.12, 0.68, 0.348);
        robot.add(leftEyeWhite);

        const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        rightEyeWhite.position.set(0.12, 0.68, 0.348);
        robot.add(rightEyeWhite);

        // Eye outlines
        const eyeOutlineGeometry = new THREE.RingGeometry(0.09, 0.11, 32);
        const eyeOutlineMaterial = new THREE.MeshBasicMaterial({ color: '#000000' });

        const leftEyeOutline = new THREE.Mesh(eyeOutlineGeometry, eyeOutlineMaterial);
        leftEyeOutline.position.set(-0.12, 0.68, 0.35);
        robot.add(leftEyeOutline);

        const rightEyeOutline = new THREE.Mesh(eyeOutlineGeometry, eyeOutlineMaterial);
        rightEyeOutline.position.set(0.12, 0.68, 0.35);
        robot.add(rightEyeOutline);

        // Pupils
        const pupilGeometry = new THREE.CircleGeometry(0.055, 16);
        const pupilMaterial = new THREE.MeshBasicMaterial({
          color: '#000000'
        });

        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.12, 0.68, 0.351);
        robot.add(leftPupil);

        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.12, 0.68, 0.351);
        robot.add(rightPupil);

        // Eye highlights
        const highlightGeometry = new THREE.CircleGeometry(0.02, 16);
        const highlightMaterial = new THREE.MeshStandardMaterial({
          color: '#FFFFFF',
          emissive: '#FFFFFF',
          emissiveIntensity: 0.8,
          metalness: 0.3,
          roughness: 0.4
        });

        const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        leftHighlight.position.set(-0.1, 0.72, 0.352);
        robot.add(leftHighlight);

        const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        rightHighlight.position.set(0.14, 0.72, 0.352);
        robot.add(rightHighlight);

        // Winking effect - one eye closed
        const winkGeometry = new THREE.PlaneGeometry(0.18, 0.02);
        const winkMaterial = new THREE.MeshBasicMaterial({ color: '#000000' });
        const wink = new THREE.Mesh(winkGeometry, winkMaterial);
        wink.position.set(0.12, 0.68, 0.352);
        // Commented out so both eyes are open, uncomment to add wink
        // robot.add(wink);

      } else { // glitch
        // Uneven quirky eyes
        const eyeWhiteGeometry = new THREE.CircleGeometry(0.09, 32);
        const eyeWhiteMaterial = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });

        // Left eye - normal
        const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        leftEyeWhite.position.set(-0.12, 0.68, 0.348);
        robot.add(leftEyeWhite);

        const leftEyeOutlineGeometry = new THREE.RingGeometry(0.09, 0.11, 32);
        const leftEyeOutline = new THREE.Mesh(leftEyeOutlineGeometry, new THREE.MeshBasicMaterial({ color: '#000000' }));
        leftEyeOutline.position.set(-0.12, 0.68, 0.35);
        robot.add(leftEyeOutline);

        const leftPupilGeometry = new THREE.CircleGeometry(0.055, 16);
        const leftPupil = new THREE.Mesh(leftPupilGeometry, new THREE.MeshBasicMaterial({ color: '#000000' }));
        leftPupil.position.set(-0.12, 0.68, 0.351);
        robot.add(leftPupil);

        // Right eye - tilted and different size (glitchy)
        const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        rightEyeWhite.position.set(0.12, 0.65, 0.348);
        rightEyeWhite.scale.set(0.8, 1.2, 1);
        rightEyeWhite.rotation.z = 0.3;
        robot.add(rightEyeWhite);

        const rightEyeOutline = new THREE.Mesh(leftEyeOutlineGeometry, new THREE.MeshBasicMaterial({ color: '#000000' }));
        rightEyeOutline.position.set(0.12, 0.65, 0.35);
        rightEyeOutline.scale.set(0.8, 1.2, 1);
        rightEyeOutline.rotation.z = 0.3;
        robot.add(rightEyeOutline);

        const rightPupil = new THREE.Mesh(leftPupilGeometry, new THREE.MeshBasicMaterial({ color: '#000000' }));
        rightPupil.position.set(0.13, 0.63, 0.351);
        rightPupil.scale.set(1.2, 0.8, 1);
        robot.add(rightPupil);
      }

      // === MOUTH ===
      const mouthGeometry = new THREE.PlaneGeometry(0.12, 0.02);
      const mouthMaterial = new THREE.MeshBasicMaterial({ color: '#000000' });
      const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
      mouth.position.set(0, 0.55, 0.351);

      if (eyeStyle === 'happy') {
        // Curved smile for Joy
        const smileCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(-0.08, 0.55, 0.351),
          new THREE.Vector3(0, 0.52, 0.351),
          new THREE.Vector3(0.08, 0.55, 0.351)
        );
        const smileGeometry = new THREE.TubeGeometry(smileCurve, 20, 0.01, 8, false);
        const smile = new THREE.Mesh(smileGeometry, mouthMaterial);
        robot.add(smile);
      } else if (eyeStyle === 'glitch') {
        // Wavy quirky mouth
        const wavyCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(-0.08, 0.55, 0.351),
          new THREE.Vector3(-0.02, 0.52, 0.351),
          new THREE.Vector3(0.08, 0.56, 0.351)
        );
        const wavyGeometry = new THREE.TubeGeometry(wavyCurve, 20, 0.01, 8, false);
        const wavyMouth = new THREE.Mesh(wavyGeometry, mouthMaterial);
        robot.add(wavyMouth);
      } else {
        // Simple line for Sleepy
        robot.add(mouth);
      }

      // === ROSY CHEEKS ===
      const cheekGeometry = new THREE.CircleGeometry(0.04, 16);
      const cheekMaterial = new THREE.MeshBasicMaterial({
        color: '#FFB8C8',
        transparent: true,
        opacity: 0.6
      });

      const leftCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
      leftCheek.position.set(-0.22, 0.6, 0.34);
      robot.add(leftCheek);

      const rightCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
      rightCheek.position.set(0.22, 0.6, 0.34);
      robot.add(rightCheek);

      // === ARMS (small and rounded) ===
      const armGeometry = new THREE.CapsuleGeometry(0.06, 0.2, 12, 16);
      const armMaterial = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.1,
        roughness: 0.8
      });

      const leftArm = new THREE.Mesh(armGeometry, armMaterial);
      leftArm.position.set(-0.23, 0.2, 0);
      leftArm.rotation.z = Math.PI / 7;
      leftArm.castShadow = true;
      robot.add(leftArm);

      const rightArm = new THREE.Mesh(armGeometry, armMaterial);
      rightArm.position.set(0.23, 0.2, 0);
      rightArm.rotation.z = -Math.PI / 7;
      rightArm.castShadow = true;
      robot.add(rightArm);

      // === LEGS (short and stubby) ===
      const legGeometry = new THREE.CapsuleGeometry(0.06, 0.15, 12, 16);
      const legMaterial = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.1,
        roughness: 0.8
      });

      const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
      leftLeg.position.set(-0.1, -0.05, 0);
      leftLeg.castShadow = true;
      robot.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
      rightLeg.position.set(0.1, -0.05, 0);
      rightLeg.castShadow = true;
      robot.add(rightLeg);

      // === DECORATIVE ACCENTS ===

      // Top accent (antenna or decoration)
      if (agent.name === 'Joy') {
        // Leaf-like ears for Joy
        const leafGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        const leafMaterial = new THREE.MeshStandardMaterial({
          color: accentColor,
          metalness: 0.2,
          roughness: 0.7
        });

        const leftLeaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leftLeaf.position.set(-0.15, 0.92, -0.05);
        leftLeaf.scale.set(0.6, 1, 0.3);
        leftLeaf.rotation.z = -0.3;
        leftLeaf.castShadow = true;
        robot.add(leftLeaf);

        const rightLeaf = new THREE.Mesh(leafGeometry, leafMaterial);
        rightLeaf.position.set(0.15, 0.92, -0.05);
        rightLeaf.scale.set(0.6, 1, 0.3);
        rightLeaf.rotation.z = 0.3;
        rightLeaf.castShadow = true;
        robot.add(rightLeaf);
      } else {
        // Small antenna for others
        const antennaGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 12);
        const antennaMaterial = new THREE.MeshStandardMaterial({
          color: accentColor,
          metalness: 0.3,
          roughness: 0.6
        });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.y = 0.96;
        antenna.castShadow = true;
        robot.add(antenna);

        const antennaTipGeometry = new THREE.SphereGeometry(0.04, 12, 12);
        const antennaTipMaterial = new THREE.MeshStandardMaterial({
          color: accentColor,
          emissive: accentColor,
          emissiveIntensity: 0.6,
          metalness: 0.4,
          roughness: 0.5
        });
        const antennaTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
        antennaTip.position.y = 1.06;
        antennaTip.castShadow = true;
        robot.add(antennaTip);
      }

      // Position the robot
      robot.position.set(agent.position[0], 1.3, agent.position[2]);

      // === ENHANCED VISUAL EFFECTS ===

      // Store initial position for movement calculations
      robot.userData.initialPosition = {
        x: agent.position[0],
        y: 1.3,
        z: agent.position[2]
      };
      robot.userData.movementOffset = { x: 0, y: 0, z: 0 };
      robot.userData.rotationOffset = { x: 0, y: 0, z: 0 };
      robot.userData.animationTime = Math.random() * Math.PI * 2; // Random start offset

      // Thought cloud for "thinking" state (hidden by default)
      const thoughtCloud = new THREE.Group();
      thoughtCloud.name = 'thoughtCloud';
      thoughtCloud.visible = false;

      const cloudGeometry = new THREE.SphereGeometry(0.15, 12, 12);
      const cloudMaterial = new THREE.MeshStandardMaterial({
        color: '#FFFACD',
        transparent: true,
        opacity: 0.8,
        metalness: 0.1,
        roughness: 0.9
      });

      const mainCloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
      mainCloud.scale.set(1, 0.8, 1);
      thoughtCloud.add(mainCloud);

      // Small cloud bubbles
      const smallCloud1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 10, 10),
        cloudMaterial
      );
      smallCloud1.position.set(-0.12, -0.1, 0);
      smallCloud1.scale.set(1, 0.7, 1);
      thoughtCloud.add(smallCloud1);

      const smallCloud2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        cloudMaterial
      );
      smallCloud2.position.set(-0.18, -0.18, 0);
      smallCloud2.scale.set(1, 0.6, 1);
      thoughtCloud.add(smallCloud2);

      thoughtCloud.position.set(0, 1.5, 0);
      robot.add(thoughtCloud);

      // Glow effect for "working" state (hidden by default)
      const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.name = 'glowEffect';
      glowMesh.position.y = 0.5;
      glowMesh.visible = false;
      robot.add(glowMesh);

      // Add invisible bounding box for easier hover detection
      const hoverBoxGeometry = new THREE.BoxGeometry(1, 2, 1);
      const hoverBoxMaterial = new THREE.MeshBasicMaterial({ visible: false });
      const hoverBox = new THREE.Mesh(hoverBoxGeometry, hoverBoxMaterial);
      hoverBox.position.y = 0.4;
      hoverBox.userData = { agentId: agent.id, agent: agent, isHoverBox: true };
      robot.add(hoverBox);

      return robot;
    };

    // Store the function in ref so it can be used by other effects
    createCuteRobotRef.current = createCuteRobot;

    const initialAgents = useGameStore.getState().agents;
    initialAgents.forEach(agent => {
      const robot = createCuteRobot(agent, scene);
      robotMeshesRef.current.push(robot);
      scene.add(robot);
    });

    // === CLICK & HOVER DETECTION ===
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let mouseDownPos = null;
    let mouseUpPos = null;

    const onMouseDown = (event) => {
      mouseDownPos = { x: event.clientX, y: event.clientY };
      console.log('Mouse down at:', mouseDownPos);
    };

    const onMouseUp = (event) => {
      mouseUpPos = { x: event.clientX, y: event.clientY };
      console.log('Mouse up at:', mouseUpPos);

      // Check if it's a click (not a drag)
      if (mouseDownPos && mouseUpPos) {
        const dx = mouseUpPos.x - mouseDownPos.x;
        const dy = mouseUpPos.y - mouseDownPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        console.log('Movement distance:', distance);

        // If mouse moved less than 5 pixels, consider it a click
        if (distance < 5) {
          console.log('Detected as click, calling handleClick');
          handleClick(event);
        } else {
          console.log('Detected as drag, ignoring');
        }
      }

      mouseDownPos = null;
      mouseUpPos = null;
    };

    const handleClick = (event) => {
      console.log('handleClick called');
      const rect = renderer.domElement.getBoundingClientRect();
      console.log('Renderer rect:', { left: rect.left, top: rect.top, width: rect.width, height: rect.height });
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      console.log('Normalized mouse coords:', { x: mouse.x, y: mouse.y });
      console.log('RobotMeshes count:', robotMeshesRef.current.length);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(robotMeshesRef.current, true);

      console.log('Intersects found:', intersects.length);

      if (intersects.length > 0) {
        let intersectedRobot = null;
        for (const intersect of intersects) {
          let obj = intersect.object;
          while (obj.parent) {
            if (obj.userData && obj.userData.agentId) {
              intersectedRobot = obj;
              break;
            }
            obj = obj.parent;
          }
          if (intersectedRobot) break;
        }

        if (intersectedRobot) {
          const agentId = intersectedRobot.userData.agentId;
          console.log('Clicked agent:', agentId);
          useGameStore.getState().selectAgent(agentId);
        } else {
          console.log('No agent found in intersects');
        }
      } else {
        console.log('No intersects at all');
      }
    };

    const onPointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(robotMeshesRef.current, true);

      if (intersects.length > 0) {
        let intersectedRobot = null;
        for (const intersect of intersects) {
          let obj = intersect.object;
          while (obj.parent) {
            if (obj.userData && obj.userData.agentId) {
              intersectedRobot = obj;
              break;
            }
            obj = obj.parent;
          }
          if (intersectedRobot) break;
        }

        if (intersectedRobot) {
          const agent = intersectedRobot.userData.agent;

          // Update hover state
          setHoveredAgent(agent.name);
          setHoverPosition({ x: event.clientX, y: event.clientY });

          // Change cursor
          renderer.domElement.style.cursor = 'pointer';
        }
      } else {
        setHoveredAgent(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    const clock = new THREE.Clock();

    // Helper function for smooth interpolation (lerp)
    const lerp = (start, end, factor) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const deltaTime = clock.getDelta();
      const currentAgents = useGameStore.getState().agents;

      robotMeshesRef.current.forEach((robot, index) => {
        // Find matching agent from store
        const agentData = currentAgents.find(a => a.id === robot.userData.agentId);
        if (!agentData) return;

        // Update userData with latest agent state
        robot.userData.agent = agentData;
        robot.userData.animationTime += deltaTime;

        const animTime = robot.userData.animationTime;
        const initialPos = robot.userData.initialPosition;

        // Find visual effect meshes
        const thoughtCloud = robot.children.find(child => child.name === 'thoughtCloud');
        const glowEffect = robot.children.find(child => child.name === 'glowEffect');

        // === STATE-BASED ANIMATIONS ===

        if (agentData.state === 'sleeping') {
          // Very slow gentle floating
          const floatY = Math.sin(time * 0.8 + index * 1.2) * 0.04;
          robot.position.y = lerp(robot.position.y, initialPos.y + floatY, 0.05);

          // Minimal rotation
          const targetRotY = Math.sin(time * 0.5) * 0.05;
          robot.rotation.y = lerp(robot.rotation.y, targetRotY, 0.05);
          robot.rotation.z = lerp(robot.rotation.z, 0, 0.1);
          robot.rotation.x = lerp(robot.rotation.x, 0, 0.1);

          // Reset position offsets
          robot.userData.movementOffset.x = lerp(robot.userData.movementOffset.x, 0, 0.05);
          robot.userData.movementOffset.z = lerp(robot.userData.movementOffset.z, 0, 0.05);

          // Hide effects
          if (thoughtCloud) thoughtCloud.visible = false;
          if (glowEffect) glowEffect.visible = false;

        } else if (agentData.state === 'active') {
          // Normal floating
          const floatY = Math.sin(time * 1.5 + index * 1.2) * 0.06;
          robot.position.y = lerp(robot.position.y, initialPos.y + floatY, 0.08);

          // Small random movement within cabin bounds
          const moveRadius = 0.5; // Stay within cabin
          const moveSpeed = 0.3;
          const targetX = Math.sin(animTime * moveSpeed) * moveRadius;
          const targetZ = Math.cos(animTime * moveSpeed * 0.7) * moveRadius;

          robot.userData.movementOffset.x = lerp(robot.userData.movementOffset.x, targetX, 0.02);
          robot.userData.movementOffset.z = lerp(robot.userData.movementOffset.z, targetZ, 0.02);

          robot.position.x = initialPos.x + robot.userData.movementOffset.x;
          robot.position.z = initialPos.z + robot.userData.movementOffset.z;

          // Gentle rotation as it moves
          const targetRotY = Math.sin(time * 0.8) * 0.3;
          robot.rotation.y = lerp(robot.rotation.y, targetRotY, 0.05);
          robot.rotation.z = lerp(robot.rotation.z, 0, 0.1);
          robot.rotation.x = lerp(robot.rotation.x, 0, 0.1);

          // Hide effects
          if (thoughtCloud) thoughtCloud.visible = false;
          if (glowEffect) glowEffect.visible = false;

        } else if (agentData.state === 'thinking') {
          // Stays mostly in place
          const floatY = Math.sin(time * 1.2 + index * 1.2) * 0.05;
          robot.position.y = lerp(robot.position.y, initialPos.y + floatY, 0.06);

          // Reset position offsets
          robot.userData.movementOffset.x = lerp(robot.userData.movementOffset.x, 0, 0.08);
          robot.userData.movementOffset.z = lerp(robot.userData.movementOffset.z, 0, 0.08);
          robot.position.x = lerp(robot.position.x, initialPos.x, 0.08);
          robot.position.z = lerp(robot.position.z, initialPos.z, 0.08);

          // Slight head tilt
          const tiltZ = Math.sin(time * 1.5) * 0.12;
          const tiltX = Math.sin(time * 1.2) * 0.06;
          robot.rotation.z = lerp(robot.rotation.z, tiltZ, 0.08);
          robot.rotation.x = lerp(robot.rotation.x, tiltX, 0.08);
          robot.rotation.y = lerp(robot.rotation.y, 0, 0.1);

          // Show thought cloud
          if (thoughtCloud) {
            thoughtCloud.visible = true;
            thoughtCloud.position.y = 1.5 + Math.sin(time * 2) * 0.08;
            thoughtCloud.rotation.y = time * 0.5;
            thoughtCloud.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
          }
          if (glowEffect) glowEffect.visible = false;

        } else if (agentData.state === 'working') {
          // Energetic faster floating
          const floatY = Math.sin(time * 3 + index * 1.2) * 0.1;
          const bounceY = Math.abs(Math.sin(time * 4)) * 0.05;
          robot.position.y = lerp(robot.position.y, initialPos.y + floatY + bounceY, 0.12);

          // Slight movement for energy
          const moveRadius = 0.3;
          const moveSpeed = 0.8;
          const targetX = Math.sin(animTime * moveSpeed) * moveRadius;
          const targetZ = Math.cos(animTime * moveSpeed * 1.2) * moveRadius;

          robot.userData.movementOffset.x = lerp(robot.userData.movementOffset.x, targetX, 0.06);
          robot.userData.movementOffset.z = lerp(robot.userData.movementOffset.z, targetZ, 0.06);

          robot.position.x = initialPos.x + robot.userData.movementOffset.x;
          robot.position.z = initialPos.z + robot.userData.movementOffset.z;

          // Faster rotation
          robot.rotation.y += 0.025;
          robot.rotation.z = lerp(robot.rotation.z, 0, 0.1);
          robot.rotation.x = lerp(robot.rotation.x, 0, 0.1);

          // Show glow effect
          if (glowEffect) {
            glowEffect.visible = true;
            const glowIntensity = 0.3 + Math.sin(time * 6) * 0.2;
            glowEffect.material.opacity = glowIntensity;
            glowEffect.scale.setScalar(1 + Math.sin(time * 4) * 0.15);
          }
          if (thoughtCloud) thoughtCloud.visible = false;

        } else if (agentData.state === 'error') {
          // Jittery shaking animation
          const shakeAmount = 0.03;
          const shakeX = (Math.random() - 0.5) * shakeAmount;
          const shakeZ = (Math.random() - 0.5) * shakeAmount;
          const shakeY = Math.sin(time * 8) * 0.04;

          robot.position.x = initialPos.x + shakeX;
          robot.position.y = initialPos.y + shakeY;
          robot.position.z = initialPos.z + shakeZ;

          // Unstable rotation
          const jitterRotY = Math.sin(time * 6) * 0.3 + (Math.random() - 0.5) * 0.1;
          const jitterRotZ = (Math.random() - 0.5) * 0.15;
          robot.rotation.y = lerp(robot.rotation.y, jitterRotY, 0.2);
          robot.rotation.z = lerp(robot.rotation.z, jitterRotZ, 0.3);
          robot.rotation.x = lerp(robot.rotation.x, 0, 0.1);

          // Flicker effect on head
          const head = robot.children.find(child => child.geometry && child.geometry.type === 'SphereGeometry');
          if (head && Math.random() > 0.9) {
            head.material.emissive = new THREE.Color('#FF0000');
            head.material.emissiveIntensity = Math.random() * 0.8;
          }

          // Reset movement offsets
          robot.userData.movementOffset.x = 0;
          robot.userData.movementOffset.z = 0;

          // Hide effects
          if (thoughtCloud) thoughtCloud.visible = false;
          if (glowEffect) glowEffect.visible = false;
        }

        // === HEAD GLOW EFFECTS (for thinking and working) ===
        const head = robot.children.find(child => child.geometry && child.geometry.type === 'SphereGeometry');
        if (head) {
          if (agentData.state === 'thinking') {
            // Soft yellow glow
            head.material.emissive = new THREE.Color('#FFD700');
            head.material.emissiveIntensity = 0.3 + Math.sin(time * 2) * 0.1;
          } else if (agentData.state === 'working') {
            // Brighter agent-color glow
            head.material.emissive = new THREE.Color(agentData.color);
            head.material.emissiveIntensity = 0.5 + Math.sin(time * 4) * 0.2;
          } else if (agentData.state !== 'error') {
            // Reset for other states
            head.material.emissive = new THREE.Color('#000000');
            head.material.emissiveIntensity = 0;
          }
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('mouseup', onMouseUp);
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      controls.dispose();
      renderer.dispose();
      if (mountNode && renderer.domElement) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
      <AgentHoverMessage
        agentName={hoveredAgent}
        position={hoverPosition}
        isHovered={!!hoveredAgent}
      />
    </>
  );
};
