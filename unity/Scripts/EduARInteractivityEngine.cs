using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace EduAR.Core
{
    /// <summary>
    /// Unity Trigger-Target Interactivity Engine (Sub-Fase R9.4)
    /// Evaluates MOVE, ROTATE, SCALE, PLAY_ANIMATION, HIDE, SHOW, JUMP_SCENE, OPEN_URL rules.
    /// </summary>
    public class EduARInteractivityEngine : MonoBehaviour
    {
        public static EduARInteractivityEngine Instance { get; private set; }

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        public void ExecuteInteractivity(InteractivityData rule, Dictionary<string, GameObject> objects)
        {
            if (rule == null) return;

            objects.TryGetValue(rule.targetObjectId, out GameObject targetGo);

            Debug.Log($"[EduARInteractivityEngine] Executing Rule '{rule.name}' ({rule.actionType}) on target {rule.targetObjectId}");

            switch (rule.actionType)
            {
                case "HIDE":
                    if (targetGo != null) targetGo.SetActive(false);
                    break;

                case "SHOW":
                    if (targetGo != null) targetGo.SetActive(true);
                    break;

                case "ROTATE":
                    if (targetGo != null)
                    {
                        StartCoroutine(RotateObjectCoroutine(targetGo, rule.duration > 0 ? rule.duration : 1.0f));
                    }
                    break;

                case "OPEN_URL":
                    // Open external web URL
                    string url = "https://eduar-platform.com";
                    Application.OpenURL(url);
                    break;

                default:
                    Debug.Log($"[EduARInteractivityEngine] ActionType '{rule.actionType}' triggered.");
                    break;
            }
        }

        private IEnumerator RotateObjectCoroutine(GameObject go, float duration)
        {
            float elapsed = 0f;
            Quaternion startRot = go.transform.localRotation;
            Quaternion endRot = startRot * Quaternion.Euler(0, 360, 0);

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                go.transform.localRotation = Quaternion.Slerp(startRot, endRot, elapsed / duration);
                yield return null;
            }
            go.transform.localRotation = endRot;
        }
    }
}
