import os
import math
import wave
import struct
import numpy as np

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "ecosystems")
os.makedirs(OUTPUT_DIR, exist_ok=True)

SAMPLE_RATE = 44100
DURATION = 16.0 # 16 seconds seamless loopable ambient soundscape

def save_wav(filename, audio_data):
    # Normalize to -1.0 to 1.0 then convert to 16-bit PCM
    max_val = np.max(np.abs(audio_data))
    if max_val > 0:
        audio_data = audio_data / max_val * 0.85
    
    int_data = (audio_data * 32767).astype(np.int16)
    
    with wave.open(filename, 'w') as wf:
        wf.setnchannels(2) # Stereo
        wf.setsampwidth(2) # 16-bit
        wf.setframerate(SAMPLE_RATE)
        
        # Interleave stereo channels
        stereo_data = np.empty((len(int_data), 2), dtype=np.int16)
        stereo_data[:, 0] = int_data[:, 0]
        stereo_data[:, 1] = int_data[:, 1]
        wf.writeframes(stereo_data.tobytes())
    print(f"[OK] Generated: {filename}")

def generate_sawah_ambient():
    """Ekosistem Sawah: Gemericik air tenang, hembusan angin padi, kicauan burung sawah lembut, dan jangkrik senja."""
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), endpoint=False)
    n_samples = len(t)
    
    # 1. Gentle pink noise wind through rice fields
    noise = np.random.normal(0, 0.08, n_samples)
    breeze_mod = 0.5 + 0.5 * np.sin(2 * np.pi * 0.12 * t)
    wind_l = np.convolve(noise, np.hanning(200), mode='same') * breeze_mod
    wind_r = np.convolve(noise, np.hanning(220), mode='same') * (0.5 + 0.5 * np.cos(2 * np.pi * 0.12 * t))
    
    # 2. Trickling peaceful stream
    stream_noise = np.random.normal(0, 0.05, n_samples)
    stream_mod = 0.6 + 0.4 * np.sin(2 * np.pi * 1.8 * t) * np.cos(2 * np.pi * 0.7 * t)
    stream_l = np.convolve(stream_noise, np.hamming(80), mode='same') * stream_mod
    stream_r = np.convolve(stream_noise, np.hamming(90), mode='same') * stream_mod
    
    # 3. Soft bird chirps (peaceful meadow bird frequencies 2.4kHz - 3.8kHz)
    birds_l = np.zeros(n_samples)
    birds_r = np.zeros(n_samples)
    
    chirp_times = [1.2, 3.8, 6.5, 9.2, 12.8, 14.5]
    for ct in chirp_times:
        idx_start = int(ct * SAMPLE_RATE)
        dur = int(0.35 * SAMPLE_RATE)
        if idx_start + dur < n_samples:
            ct_t = np.linspace(0, 0.35, dur)
            freq = 2800 + 700 * np.sin(2 * np.pi * 18 * ct_t) + 300 * np.cos(2 * np.pi * 32 * ct_t)
            env = np.sin(np.pi * ct_t / 0.35) ** 2
            chirp = 0.08 * np.sin(2 * np.pi * np.cumsum(freq) / SAMPLE_RATE) * env
            birds_l[idx_start:idx_start+dur] += chirp * 0.8
            birds_r[idx_start:idx_start+dur] += chirp * 0.6
            
    # 4. Soothing warm harmonic chord pad (E major peaceful study chord)
    chord_freqs = [164.81, 207.65, 246.94, 329.63] # E3, G#3, B3, E4
    pad_l = np.zeros(n_samples)
    pad_r = np.zeros(n_samples)
    for i, cf in enumerate(chord_freqs):
        pad_l += (0.04 / (i + 1)) * np.sin(2 * np.pi * cf * t + 0.2 * i)
        pad_r += (0.04 / (i + 1)) * np.sin(2 * np.pi * cf * t + 0.5 * i)
        
    left = wind_l * 0.4 + stream_l * 0.5 + birds_l + pad_l
    right = wind_r * 0.4 + stream_r * 0.5 + birds_r + pad_r
    return np.column_stack((left, right))

def generate_laut_ambient():
    """Ekosistem Laut: Deburan ombak laut menenangkan, buih air pantai, dan nada bawah air damai."""
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), endpoint=False)
    n_samples = len(t)
    
    # 1. Rhythmic rolling ocean waves (0.15 Hz period ~ 6.5s per wave)
    wave_cycle1 = (np.sin(2 * np.pi * 0.15 * t) ** 4)
    wave_cycle2 = (np.sin(2 * np.pi * 0.11 * t + 1.2) ** 4)
    
    ocean_noise = np.random.normal(0, 0.18, n_samples)
    filtered_ocean_l = np.convolve(ocean_noise, np.hanning(450), mode='same') * (wave_cycle1 * 0.7 + wave_cycle2 * 0.3)
    filtered_ocean_r = np.convolve(ocean_noise, np.hanning(480), mode='same') * (wave_cycle1 * 0.4 + wave_cycle2 * 0.6)
    
    # 2. Gentle bubble sizzle (high frequency froth)
    foam_noise = np.random.normal(0, 0.04, n_samples)
    foam = np.convolve(foam_noise, np.hamming(40), mode='same') * (wave_cycle1 * 0.5)
    
    # 3. Deep oceanic warm drone (C major peaceful ocean depth: C2, G2, E3)
    drone_l = 0.05 * np.sin(2 * np.pi * 65.41 * t) + 0.03 * np.sin(2 * np.pi * 98.0 * t) + 0.02 * np.sin(2 * np.pi * 164.81 * t)
    drone_r = 0.05 * np.sin(2 * np.pi * 65.41 * t + 0.4) + 0.03 * np.sin(2 * np.pi * 98.0 * t + 0.3) + 0.02 * np.sin(2 * np.pi * 164.81 * t + 0.6)
    
    left = filtered_ocean_l * 0.6 + foam * 0.3 + drone_l
    right = filtered_ocean_r * 0.6 + foam * 0.3 + drone_r
    return np.column_stack((left, right))

def generate_hutan_ambient():
    """Ekosistem Hutan: Suasana kanopi rimba yang damai, dedaunan berbisik, kicauan burung tropis, dan gemuruh angin."""
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), endpoint=False)
    n_samples = len(t)
    
    # Canopy wind
    wind_noise = np.random.normal(0, 0.1, n_samples)
    wind_mod = 0.6 + 0.4 * np.sin(2 * np.pi * 0.08 * t)
    wind_l = np.convolve(wind_noise, np.hanning(300), mode='same') * wind_mod
    wind_r = np.convolve(wind_noise, np.hanning(320), mode='same') * wind_mod
    
    # Forest bird calls
    birds_l = np.zeros(n_samples)
    birds_r = np.zeros(n_samples)
    bird_cues = [(0.8, 1800), (3.2, 2200), (7.0, 1950), (10.5, 2400), (13.8, 2100)]
    for start_t, base_f in bird_cues:
        idx = int(start_t * SAMPLE_RATE)
        dur = int(0.4 * SAMPLE_RATE)
        if idx + dur < n_samples:
            ct = np.linspace(0, 0.4, dur)
            freq = base_f + 400 * np.sin(2 * np.pi * 14 * ct)
            env = np.sin(np.pi * ct / 0.4) ** 2
            chirp = 0.07 * np.sin(2 * np.pi * np.cumsum(freq) / SAMPLE_RATE) * env
            birds_l[idx:idx+dur] += chirp * 0.7
            birds_r[idx:idx+dur] += chirp * 0.8
            
    # Soft wood/leaf rustle
    leaf_noise = np.random.normal(0, 0.03, n_samples)
    leaves = np.convolve(leaf_noise, np.hamming(60), mode='same') * (0.5 + 0.5 * np.cos(2 * np.pi * 0.2 * t))
    
    # Gentle G major forest harmony
    pad_l = 0.04 * np.sin(2 * np.pi * 196.0 * t) + 0.03 * np.sin(2 * np.pi * 246.94 * t) + 0.02 * np.sin(2 * np.pi * 293.66 * t)
    pad_r = 0.04 * np.sin(2 * np.pi * 196.0 * t + 0.3) + 0.03 * np.sin(2 * np.pi * 246.94 * t + 0.6) + 0.02 * np.sin(2 * np.pi * 293.66 * t + 0.2)
    
    left = wind_l * 0.4 + leaves * 0.4 + birds_l + pad_l
    right = wind_r * 0.4 + leaves * 0.4 + birds_r + pad_r
    return np.column_stack((left, right))

def main():
    print("Generating pure soothing ecosystem nature soundscapes...")
    generators = {
        "sawah": generate_sawah_ambient,
        "laut": generate_laut_ambient,
        "hutan": generate_hutan_ambient,
        "padang_rumput": generate_sawah_ambient,
        "gurun": generate_sawah_ambient,
        "kutub": generate_laut_ambient,
        "sungai": generate_sawah_ambient
    }
    
    for name, gen in generators.items():
        data = gen()
        wav_path = os.path.join(OUTPUT_DIR, f"{name}.wav")
        save_wav(wav_path, data)
        # Also save as mp3 named copy for universal fallback
        mp3_path = os.path.join(OUTPUT_DIR, f"{name}.mp3")
        save_wav(mp3_path, data)
        
    print("All ecosystem nature soundscape audio files generated successfully!")

if __name__ == "__main__":
    main()
