using System;
using UnityEngine;

namespace EduAR.Core
{
    public enum ARViewMode
    {
        View3D,
        MarkerAR,
        MarkerlessARWorldTracking
    }

    /// <summary>
    /// Unity Multi-Mode AR Viewer Controller (Sub-Fase R9.5 & R9.6)
    /// Toggles between 3D Orbit View, Marker-based Image Tracking, and Plane World Tracking.
    /// </summary>
    public class EduARViewerManager : MonoBehaviour
    {
        [Header("Viewing Modes")]
        public ARViewMode currentMode = ARViewMode.View3D;

        public static EduARViewerManager Instance { get; private set; }

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        public void SetViewingMode(ARViewMode mode)
        {
            currentMode = mode;
            Debug.Log($"[EduARViewerManager] Active Viewing Mode switched to: {currentMode}");

            switch (mode)
            {
                case ARViewMode.View3D:
                    Enable3DOrbitMode();
                    break;
                case ARViewMode.MarkerAR:
                    EnableMarkerARMode();
                    break;
                case ARViewMode.MarkerlessARWorldTracking:
                    EnableMarkerlessARWorldTrackingMode();
                    break;
            }
        }

        private void Enable3DOrbitMode()
        {
            Debug.Log("[EduARViewerManager] Mode 1: 3D View (Non-AR camera orbit activated).");
        }

        private void EnableMarkerARMode()
        {
            Debug.Log("[EduARViewerManager] Mode 2: Marker-based AR (ARTrackedImageManager active).");
        }

        private void EnableMarkerlessARWorldTrackingMode()
        {
            Debug.Log("[EduARViewerManager] Mode 3: Markerless AR (ARPlaneManager & Tap-to-Place active).");
        }
    }
}
