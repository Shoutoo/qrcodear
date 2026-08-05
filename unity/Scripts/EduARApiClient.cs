using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

namespace EduAR.Core
{
    [Serializable]
    public class UserData
    {
        public string id;
        public string name;
        public string email;
        public string role;
    }

    [Serializable]
    public class LoginResponse
    {
        public bool success;
        public string accessToken;
        public string refreshToken;
        public UserData user;
    }

    [Serializable]
    public class SceneObjectData
    {
        public string id;
        public string sceneId;
        public string assetId;
        public string type; // MODEL_3D, TEXT, IMAGE, VIDEO, ANNOTATION_POINT, ANNOTATION_LINE
        public string textContent;
        public string color;
        public float positionX;
        public float positionY;
        public float positionZ;
        public float rotationX;
        public float rotationY;
        public float rotationZ;
        public float scaleX;
        public float scaleY;
        public float scaleZ;
    }

    [Serializable]
    public class InteractivityData
    {
        public string id;
        public string sceneId;
        public string name;
        public string triggerObjectId;
        public string targetObjectId;
        public string actionType; // MOVE, ROTATE, SCALE, PLAY_ANIMATION, HIDE, SHOW, JUMP_SCENE, OPEN_URL, VIDEO_CONTROL, SOUND_EFFECT
        public string paramsJson;
        public float startTime;
        public float duration;
        public string easing;
        public bool autoTrigger;
    }

    [Serializable]
    public class StructuredSceneData
    {
        public string id;
        public string projectId;
        public string format; // LEGACY_BLOB or STRUCTURED
        public int order;
        public List<SceneObjectData> objects;
        public List<InteractivityData> interactivities;
    }

    [Serializable]
    public class StructuredSceneResponse
    {
        public bool success;
        public StructuredSceneData scene;
    }

    [Serializable]
    public class PublishResponse
    {
        public bool success;
        public string publishedId;
        public string sceneId;
        public string directUrl;
        public string qrCodeDataUrl;
        public bool allow3DView;
        public bool allowMarkerAR;
        public bool allowMarkerlessAR;
    }

    /// <summary>
    /// EduAR Platform Unity C# API Client (Setara Assemblr EDU Engine)
    /// </summary>
    public class EduARApiClient : MonoBehaviour
    {
        [Header("Backend Configuration")]
        public string baseUrl = "http://localhost:3001";
        public string currentAccessToken = "";

        public static EduARApiClient Instance { get; private set; }

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        public IEnumerator Login(string email, string password, Action<LoginResponse> onSuccess, Action<string> onError)
        {
            string jsonBody = "{\"email\":\"" + email + "\",\"password\":\"" + password + "\",\"device\":\"unity-app\"}";
            using (UnityWebRequest req = new UnityWebRequest(baseUrl + "/api/auth/login", "POST"))
            {
                byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);
                req.uploadHandler = new UploadHandlerRaw(bodyRaw);
                req.downloadHandler = new DownloadHandlerBuffer();
                req.SetRequestHeader("Content-Type", "application/json");

                yield return req.SendWebRequest();

                if (req.result == UnityWebRequest.Result.Success)
                {
                    LoginResponse res = JsonUtility.FromJson<LoginResponse>(req.downloadHandler.text);
                    if (res != null && res.success)
                    {
                        currentAccessToken = res.accessToken;
                        onSuccess?.Invoke(res);
                    }
                    else
                    {
                        onError?.Invoke("Gagal login: Respons server tidak valid");
                    }
                }
                else
                {
                    onError?.Invoke("HTTP Error: " + req.error + " - " + req.downloadHandler.text);
                }
            }
        }

        public IEnumerator GetStructuredScene(string sceneId, Action<StructuredSceneData> onSuccess, Action<string> onError)
        {
            using (UnityWebRequest req = UnityWebRequest.Get(baseUrl + "/api/unity/scenes/" + sceneId))
            {
                if (!string.IsNullOrEmpty(currentAccessToken))
                {
                    req.SetRequestHeader("Authorization", "Bearer " + currentAccessToken);
                }

                yield return req.SendWebRequest();

                if (req.result == UnityWebRequest.Result.Success)
                {
                    StructuredSceneResponse res = JsonUtility.FromJson<StructuredSceneResponse>(req.downloadHandler.text);
                    if (res != null && res.success)
                    {
                        onSuccess?.Invoke(res.scene);
                    }
                    else
                    {
                        onError?.Invoke("Gagal memuat scene");
                    }
                }
                else
                {
                    onError?.Invoke("HTTP Error: " + req.error);
                }
            }
        }

        public IEnumerator CreateStructuredScene(string projectId, Action<StructuredSceneData> onSuccess, Action<string> onError)
        {
            string jsonBody = "{\"projectId\":\"" + projectId + "\",\"order\":0}";
            using (UnityWebRequest req = new UnityWebRequest(baseUrl + "/api/unity/scenes", "POST"))
            {
                byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);
                req.uploadHandler = new UploadHandlerRaw(bodyRaw);
                req.downloadHandler = new DownloadHandlerBuffer();
                req.SetRequestHeader("Content-Type", "application/json");
                if (!string.IsNullOrEmpty(currentAccessToken))
                {
                    req.SetRequestHeader("Authorization", "Bearer " + currentAccessToken);
                }

                yield return req.SendWebRequest();

                if (req.result == UnityWebRequest.Result.Success)
                {
                    StructuredSceneResponse res = JsonUtility.FromJson<StructuredSceneResponse>(req.downloadHandler.text);
                    if (res != null && res.success)
                    {
                        onSuccess?.Invoke(res.scene);
                    }
                    else
                    {
                        onError?.Invoke("Gagal membuat scene baru");
                    }
                }
                else
                {
                    onError?.Invoke("HTTP Error: " + req.error);
                }
            }
        }
    }
}
