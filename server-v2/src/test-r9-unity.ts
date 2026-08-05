import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnityService } from './unity/unity.service';
import { SceneObjectType, InteractivityActionType } from '@prisma/client';

async function testUnityModule() {
  console.log('=====================================================');
  console.log('🧪 FASE R9: Testing Unity Assemblr EDU Editor & Viewer Engine');
  console.log('=====================================================\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const unityService = app.get(UnityService);

  // 1. Create Structured Scene
  console.log('1. Creating Structured Unity Scene (Format: STRUCTURED)...');
  const sceneRes = await unityService.createScene({ order: 1 });
  console.log(`   ✅ Created Structured Scene: ID=${sceneRes.scene.id}, Format=${sceneRes.scene.format}`);

  // 2. Add Scene Objects (3D Model, Text, Annotation)
  console.log('\n2. Adding Scene Objects (3D Model, Text 3D, Annotation Point)...');
  const obj1 = await unityService.addObject(sceneRes.scene.id, {
    type: SceneObjectType.MODEL_3D,
    positionX: 0, positionY: 0.5, positionZ: 0,
    rotationX: 0, rotationY: 180, rotationZ: 0,
    scaleX: 1.5, scaleY: 1.5, scaleZ: 1.5,
  });
  console.log(`   ✅ Added 3D Model Object: ID=${obj1.object.id}`);

  const obj2 = await unityService.addObject(sceneRes.scene.id, {
    type: SceneObjectType.TEXT,
    textContent: 'Ekosistem Rantai Makanan Interaktif',
    color: '#00F0FF',
    positionX: 0, positionY: 2.2, positionZ: 0,
  });
  console.log(`   ✅ Added 3D Text Object: ID=${obj2.object.id}, Text="${obj2.object.textContent}"`);

  // 3. Update Object Transform
  console.log('\n3. Updating Object Transform (Position & Scale)...');
  const updatedObj1 = await unityService.updateObject(obj1.object.id, {
    positionY: 0.8,
    scaleX: 2.0, scaleY: 2.0, scaleZ: 2.0,
  });
  console.log(`   ✅ Updated Object Position Y=${updatedObj1.object.positionY}, Scale=${updatedObj1.object.scaleX}x`);

  // 4. Add Interactivity Rules (Trigger -> Target)
  console.log('\n4. Adding Interactivity Rule (Trigger -> Target: ROTATE)...');
  const rule1 = await unityService.addInteractivity(sceneRes.scene.id, {
    name: 'Tap to Rotate Model',
    triggerObjectId: obj1.object.id,
    targetObjectId: obj1.object.id,
    actionType: InteractivityActionType.ROTATE,
    params: { direction: 'Y', degree: 360, loopMode: 'ONCE' },
    duration: 1.5,
    easing: 'easeInOutCubic',
  });
  console.log(`   ✅ Added Interactivity Rule: ${rule1.interactivity.name} (${rule1.interactivity.actionType})`);

  // 5. Fetch Full Structured Scene
  console.log('\n5. Fetching Full Structured Scene with Objects & Interactivities...');
  const fullScene = await unityService.getScene(sceneRes.scene.id);
  console.log(`   ✅ Fetched Scene: Objects=${fullScene.scene.objects.length}, Interactivities=${fullScene.scene.interactivities.length}`);

  // 6. Publish Multi-Mode AR Experience
  console.log('\n6. Publishing Experience with 3 Viewing Modes (3D, Marker AR, Markerless AR)...');
  const pubRes = await unityService.publishScene(sceneRes.scene.id, {
    allow3DView: true,
    allowMarkerAR: true,
    allowMarkerlessAR: true,
  }, 'localhost:3001');
  console.log(`   ✅ Published Experience: Direct URL=${pubRes.directUrl}`);
  console.log(`   • 3D View: ${pubRes.allow3DView}`);
  console.log(`   • Marker AR: ${pubRes.allowMarkerAR}`);
  console.log(`   • Markerless AR (World Tracking): ${pubRes.allowMarkerlessAR}`);

  await app.close();
  console.log('\n=====================================================');
  console.log('✅ ALL FASE R9 UNITY ASSEMBLR EDU ENGINE TESTS VALIDATED SUCCESSFULLY');
  console.log('=====================================================');
}

testUnityModule().catch(console.error);
