using System;
using System.Collections.Generic;
using UnityEngine;

namespace EduAR.Core
{
    /// <summary>
    /// Unity Editor & Scene Hierarchy Manager (Sub-Fase R9.3)
    /// Handles object spawn, transform manipulation (Move, Rotate, Scale), and annotation points.
    /// </summary>
    public class EduARSceneManager : MonoBehaviour
    {
        [Header("Active Scene Hierarchy")]
        public StructuredSceneData currentScene;
        public Dictionary<string, GameObject> spawnedObjects = new Dictionary<string, GameObject>();

        public static EduARSceneManager Instance { get; private set; }

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        public void LoadStructuredScene(StructuredSceneData sceneData, Transform parentContainer)
        {
            currentScene = sceneData;
            ClearCurrentScene();

            if (sceneData == null || sceneData.objects == null) return;

            foreach (var objData in sceneData.objects)
            {
                SpawnObjectInScene(objData, parentContainer);
            }

            Debug.Log($"[EduARSceneManager] Loaded {sceneData.objects.Count} objects into Unity scene.");
        }

        public GameObject SpawnObjectInScene(SceneObjectData objData, Transform parentContainer)
        {
            GameObject go = new GameObject(string.IsNullOrEmpty(objData.textContent) ? objData.type : objData.textContent);
            go.transform.SetParent(parentContainer, false);

            go.transform.localPosition = new Vector3(objData.positionX, objData.positionY, objData.positionZ);
            go.transform.localEulerAngles = new Vector3(objData.rotationX, objData.rotationY, objData.rotationZ);
            go.transform.localScale = new Vector3(objData.scaleX, objData.scaleY, objData.scaleZ);

            if (!string.IsNullOrEmpty(objData.id))
            {
                spawnedObjects[objData.id] = go;
            }

            return go;
        }

        public void UpdateObjectTransform(string objectId, Vector3 pos, Vector3 rot, Vector3 scale)
        {
            if (spawnedObjects.TryGetValue(objectId, out GameObject go))
            {
                go.transform.localPosition = pos;
                go.transform.localEulerAngles = rot;
                go.transform.localScale = scale;
            }
        }

        public void ClearCurrentScene()
        {
            foreach (var kvp in spawnedObjects)
            {
                if (kvp.Value != null) Destroy(kvp.Value);
            }
            spawnedObjects.Clear();
        }
    }
}
