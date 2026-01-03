import * as THREE from 'three';
import { ZOMBIE_VARIANTS } from './ZombieVariants.js';

/**
 * ZombieMesh - Creates 3D mesh for zombie variants
 * 
 * NOTE: This function requires zombieShirtMat to be passed in
 * as it's created elsewhere in the codebase
 */
export function createZombieMesh(variant = 'normal', zombieShirtMat) {
    const config = ZOMBIE_VARIANTS[variant] || ZOMBIE_VARIANTS.normal;
    const group = new THREE.Group();
    const baseScale = 2.0;
    const scale = baseScale * config.scale;

    // Create variant-specific materials
    const variantSkinMat = new THREE.MeshStandardMaterial({
        color: config.skinColor,
        roughness: 0.9
    });
    const variantSkinDarkMat = new THREE.MeshStandardMaterial({
        color: config.skinColorDark,
        roughness: 0.9
    });
    const variantShirtMat = config.shirtColor
        ? new THREE.MeshStandardMaterial({ color: config.shirtColor, roughness: 0.8 })
        : zombieShirtMat;
    const variantPantsMat = new THREE.MeshStandardMaterial({
        color: config.pantsColor,
        roughness: 0.8
    });

    // Head - variant colored zombie skin
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35 * scale, 12, 8), variantSkinMat);
    head.position.y = 1.85 * scale;
    head.castShadow = true;
    group.add(head);

    // Torso - variant shirt
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7 * scale, 0.9 * scale, 0.4 * scale), variantShirtMat);
    torso.position.y = 1.1 * scale;
    torso.castShadow = true;
    group.add(torso);

    // Arms - zombie skin, arms extended forward
    const armGeo = new THREE.BoxGeometry(0.2 * scale, 0.7 * scale, 0.2 * scale);
    const leftArm = new THREE.Mesh(armGeo, variantSkinMat);
    leftArm.position.set(-0.45 * scale, 1.3 * scale, 0.4 * scale);
    leftArm.rotation.x = -Math.PI / 3; // Arms reaching forward
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, variantSkinDarkMat);
    rightArm.position.set(0.45 * scale, 1.3 * scale, 0.4 * scale);
    rightArm.rotation.x = -Math.PI / 3;
    rightArm.castShadow = true;
    group.add(rightArm);

    // Legs - variant pants
    const legGeo = new THREE.BoxGeometry(0.25 * scale, 0.8 * scale, 0.25 * scale);
    const leftLeg = new THREE.Mesh(legGeo, variantPantsMat);
    leftLeg.position.set(-0.2 * scale, 0.4 * scale, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, variantPantsMat);
    rightLeg.position.set(0.2 * scale, 0.4 * scale, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Store variant info on group for reference
    group.userData.variant = variant;
    group.userData.variantScale = config.scale;

    return group;
}

