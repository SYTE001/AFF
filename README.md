# 🛍️ PilihCerdas - Personal Affiliate Store

**PilihCerdas** adalah sebuah landing page bergaya katalog produk yang dirancang khusus sebagai web perantara Affiliate (khususnya Shopee). Project ini dibuat sebagai solusi praktis pengganti "Keranjang Kuning" TikTok atau link bio Instagram, di mana kreator bisa memamerkan produk-produk kurasi terbaik mereka dalam satu halaman yang rapi dan profesional.

## 🌟 Kenapa Web Ini Dibuat?
Seringkali menaruh banyak link affiliate di bio membuat audiens bingung. Dengan web ini, audiens bisa melihat gambar produk, harga, deskripsi singkat, serta kategori produk sebelum memutuskan untuk membeli. Ketika tombol diklik, mereka akan langsung diarahkan ke aplikasi Shopee melalui link affiliate milikmu!

## ✨ Fitur Utama
- **Manajemen Data via Google Sheets:** Tidak perlu repot coding untuk tambah produk! Kamu cukup perbarui data di Google Sheets, dan web akan otomatis ter-update.
- **Kategori & Filter Produk:** Memudahkan audiens mencari produk berdasarkan kategori (misal: Fashion, Skincare, Elektronik).
- **Call-to-Action "Cek di Shopee":** Tombol yang langsung mengarahkan audiens ke halaman produk Shopee menggunakan link affiliate-mu.
- **Dark Mode & Light Mode:** Tampilan antarmuka yang modern dan bisa menyesuaikan dengan preferensi tema audiens.
- **Responsive Design:** Tampil sempurna dan rapi saat dibuka lewat HP, tablet, maupun laptop.
- **Performa Cepat:** Dibuat tanpa framework berat, dilengkapi dengan *preloader* yang manis.

## 🚀 Cara Setup & Mengganti Link Affiliate

Ada dua cara untuk mengatur daftar produk dan link affiliate di web ini. Semuanya diatur di dalam file `script.js`.

### Opsi 1: Menggunakan Google Sheets (Sangat Direkomendasikan)
Cara ini paling mudah karena kamu bisa menambah atau menghapus produk langsung dari HP via Google Sheets.

1. Buat spreadsheet baru di Google Sheets.
2. Buat header pada baris pertama dengan format persis seperti ini (harus sama persis):
   `id` | `name` | `price` | `description` | `image` | `affiliateLink` | `category`
3. Isi baris berikutnya dengan data produk dan link affiliate Shopee milikmu.
4. Klik menu **File > Share > Publish to web**.
5. Pilih **Entire Document** dan ubah formatnya menjadi **Comma-separated values (.csv)**. Klik **Publish**.
6. Salin link yang muncul.
7. Buka file `script.js`, cari variabel `SHEET_CSV_URL` di bagian paling atas, dan tempel link tersebut:
   ```javascript
   const SHEET_CSV_URL = 'LINK_CSV_GOOGLE_SHEETS_KAMU_DI_SINI';
