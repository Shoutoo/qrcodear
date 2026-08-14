import os
import asyncio
import edge_tts

# Directory for output MP3 files
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "ecosystems")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Indonesian Voice: id-ID-GadisNeural (cheerful, friendly, clear female educator voice)
VOICE = "id-ID-GadisNeural"
RATE = "+6%"
PITCH = "+3Hz"

ECOSYSTEMS = {
    "sawah": "Halo adik-adik pintar! Selamat datang di Ekosistem Sawah. Di sawah yang subur ini, padi bertindak sebagai produsen pembuat makanan. Belalang memakan padi, lalu dimakan oleh katak, katak dimakan ular, dan ular diburu oleh burung elang sebagai predator puncak. Saat elang mati, jamur pengurai mengembalikan nutrisinya ke tanah! Yuk, sentuh hewan-hewan 3D di layar untuk belajar peran mereka!",
    "laut": "Halo teman-teman hebat! Selamat datang di Ekosistem Laut yang luas dan indah. Di sini, rumput laut dan fitoplankton menghasilkan makanan dengan fotosintesis. Ikan kecil memakan rumput laut, lalu ikan kecil dimakan ikan besar, dan ikan besar dimangsa oleh hiu yang gagah! Saat organisme laut mati, bakteri pengurai membersihkan lautan dan menyuburkan air. Sentuh hewan laut di layar untuk melihat aksinya!",
    "hutan": "Halo sahabat alam! Selamat datang di Ekosistem Hutan yang rimbun dan asri. Pohon dan tumbuhan hijau menjadi produsen utama. Rusa dan ulat memakan dedaunan, kemudian dimangsa oleh serigala dan harimau sebagai konsumen puncak. Jamur tanah bekerja tanpa henti menguraikan dedaunan gugur menjadi pupuk alami. Sentuh hewan di layar untuk menjelajahi rimba!",
    "padang_rumput": "Halo penjelajah cilik! Selamat datang di Ekosistem Padang Rumput yang membentang luas. Rumput hijau menjadi sumber energi bagi zebra dan hewan herbivora. Mereka kemudian diburu oleh singa sebagai raja pemangsa. Pengurai tanah menjaga siklus kehidupan padang rumput tetap seimbang. Sentuh hewan-hewan 3D di layar untuk mendengarkan faktanya!",
    "gurun": "Halo petualang cilik! Selamat datang di Ekosistem Gurun pasir yang unik dan menantang. Kaktus yang tahan kering menjadi produsen. Kadal dan serangga memakan tumbuhan gurun, lalu dimangsa oleh ular derik dan burung elang gurun. Jamur dan bakteri gurun menguraikan materi organik kembali ke pasir. Sentuh hewan di layar untuk mulai belajar!",
    "kutub": "Halo adik-adik hebat! Selamat datang di Ekosistem Kutub yang dingin bersalju. Lumut kutub dan alga es menjadi produsen pertama. Ikan kutub dan krill dimakan oleh anjing laut dan penguin, yang kemudian menjadi mangsa beruang kutub. Bakteri pengurai khusus menjaga ekosistem es tetap bersih. Sentuh objek di layar untuk menjelajah!",
    "sungai": "Halo kawan-kawan! Selamat datang di Ekosistem Sungai yang jernih dan mengalir. Lumut air dan ganggang menjadi produsen segar. Udang dan kecebong memakan alga, lalu dimakan oleh ikan nila, dan ikan nila dimangsa oleh burung bangau. Pengurai dasar sungai menyuburkan sedimen air. Sentuh objek 3D di layar untuk belajar bersama!"
}

async def generate_all():
    print(f"Generating cheerful AI voice audio using {VOICE}...")
    for key, text in ECOSYSTEMS.items():
        output_file = os.path.join(OUTPUT_DIR, f"{key}.mp3")
        communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
        await communicate.save(output_file)
        print(f"[OK] Generated: {output_file} ({len(text)} chars)")
    print("All ecosystem audio narrations generated successfully!")

if __name__ == "__main__":
    asyncio.run(generate_all())
