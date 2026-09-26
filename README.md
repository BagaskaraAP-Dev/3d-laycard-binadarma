# 3D Laycard Universitas Bina Darma 🎓

[![Deploy to GitHub Pages](https://github.com/BagaskaraAP-Dev/3d-laycard-binadarma/actions/workflows/deploy.yml/badge.svg)](https://github.com/BagaskaraAP-Dev/3d-laycard-binadarma/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=flat&logo=github)](https://bagaskaraap-dev.github.io/3d-laycard-binadarma/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Lencana Identitas Digital 3D Interaktif (3D Physics Event Badge)** resmi Universitas Bina Darma dengan simulasi fisika tali dinamis, efek pegas lenting (*slingshot jump*), dan kartu bolak-balik (*double-sided*).

---

## 🌟 Fitur Utama

- **🪪 Lanyard & Card 3D Fisika Nyata**:
  - Ditenagai oleh **React Three Fiber** & **Rapier Physics** (`@react-three/rapier`).
  - Sendi tali rantai fisika terkondisi stabil dan anggun tanpa getaran (*anti-jitter*).
  - Tali pita lanyard biru tua khas UBD bertekstur rajut dengan sablon resmi `UNIVERSITAS BINA DARMA • BINA DARMA BERMUTU`.

- **🚀 Slingshot Jump (Lenting Lompat Tinggi)**:
  - Tarik kartu ke bawah dan lepaskan kursor mouse untuk melontarkan kartu melompat tinggi layaknya ketapel pegas elastis.
  - Memperhitungkan kecepatan lemparan mouse (*velocity fling*) dan ketinggian tarikan secara presisi.

- **🔄 Interaksi Bolak-Balik (Double-Sided Flip)**:
  - **Klik biasa**: Membalikkan kartu 180° secara instan (Sisi Depan ⟷ Sisi Belakang).
  - **Geser kursor (Drag horizontal)**: Memutar kartu di tangan mengikuti arah gerakan mouse.
  - **Scroll wheel**: Memberikan momentum putaran (*torque impulse*).
  - Sistem stabilisasi otomatis yang membuat kartu selalu condong menghadap ke sisi terdekat yang aktif.

- **🏛️ Identitas Resmi Universitas Bina Darma**:
  - **Sisi Depan**:
    - Logo resmi Universitas Bina Darma transparan resolusi tinggi.
    - Garis pembatas aksen elegan.
    - **Fakultas**: `FAKULTAS SAINTEK`
    - **Nama**: `BAGASKARA AMUKTI PALAPA`
    - **Program Studi**: `Teknik Informatika`
    - **Badge Status**: `MAHASISWA` (desain kapsul/pill melengkung modern dan tajam).
    - **Slogan**: `BINA DARMA BERMUTU`
  - **Sisi Belakang**:
    - Pita magnetik kartu ID hitam.
    - Logo watermark halus Universitas Bina Darma.
    - Judul `KARTU MAHASISWA`.
    - Ketentuan resmi penggunaan tanda pengenal akademik.
    - Alamat resmi kampus: `Jl. Jenderal Ahmad Yani No. 3, Palembang, Sumatera Selatan`.
    - Website resmi: `www.binadarma.ac.id`.

- **✨ High-Clarity Acrylic Holder**:
  - Selongsong akrilik bening kristal dengan pantulan cahaya halus (*clearcoat*) yang melindungi kartu.
  - Ring gantungan stainless steel dan klip penjepit baja tahan karat.

---

## 🛠️ Teknologi yang Digunakan

- **React 19**
- **Three.js**
- **@react-three/fiber**
- **@react-three/drei**
- **@react-three/rapier** (Rapier 3D Physics Engine)
- **meshline** (Simulasi pita kain 3D)
- **Vite 6**

---

## 🚀 Menjalankan Secara Lokal

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/BagaskaraAP-Dev/3d-laycard-binadarma.git
   cd 3d-laycard-binadarma
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:5173` di browser Anda.

4. **Build untuk produksi:**
   ```bash
   npm run build
   ```

---

## 🌐 Live Demo

Aplikasi ini dapat diakses secara langsung di:
👉 **[https://bagaskaraap-dev.github.io/3d-laycard-binadarma/](https://bagaskaraap-dev.github.io/3d-laycard-binadarma/)**

---

## 📄 Hak Cipta & Lisensi

Dibuat & Dikembangkan oleh:
**Bagaskara Amukti Palapa**  
Fakultas Sains dan Teknologi (Saintek) - Teknik Informatika  
Universitas Bina Darma

Proyek ini dilisensikan di bawah lisensi MIT - lihat berkas [LICENSE](LICENSE) untuk detail lengkap.

```
Copyright (c) 2026 Bagaskara Amukti Palapa. All rights reserved.
```
