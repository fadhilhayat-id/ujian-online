const API_URL = "https://script.google.com/macros/s/AKfycbwX9MFa3mcGDbKDQIsQWl0V6F-QlMFcOMOSyvOp7C2wOvr03pO0hxKG6X-BTG5f-NQcZg/exec
";
let dataUjian = [];
let jumlahPelanggaran = 0;

// 1. FITUR ANTI-CURANG: Deteksi Pindah Tab / Buka Aplikasi Lain
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    jumlahPelanggaran++;
    alert(`Peringatan! Anda meninggalkan halaman ujian. Pelanggaran: ${jumlahPelanggaran} kali. Aktivitas ini dicatat oleh sistem!`);
  }
});

// 2. FITUR ANTI-CURANG: Blokir Klik Kanan, Copy, dan Paste
document.addEventListener("contextmenu", e => e.preventDefault()); // Blokir klik kanan
document.addEventListener("keydown", e => {
  // Blokir Ctrl+C, Ctrl+V, Ctrl+U (View Source), dan F12 (Inspect Element)
  if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u') || e.key === 'F12') {
    e.preventDefault();
    alert("Fitur ini dinonaktifkan demi keamanan ujian.");
  }
});

// 3. Ambil Soal yang Sudah Diacak dari Server
async function muatUjian() {
  const response = await fetch(API_URL);
  dataUjian = await response.json();
  tampilkanSoal();
}

// 4. Render ke HTML dengan 5 Opsi Jawaban
function tampilkanSoal() {
  const container = document.getElementById("box-soal");
  container.innerHTML = "";
  
  dataUjian.forEach((soal, index) => {
    let opsiHTML = "";
    soal.pilihan.forEach((opsi) => {
      opsiHTML += `
        <label style="display:block; margin: 5px 0;">
          <input type="radio" name="soal_${soal.id}" value="${opsi}"> ${opsi}
        </label>
      `;
    });
    
    container.innerHTML += `
      <div class="soal-item" style="margin-bottom: 20px; padding: 10px; border-bottom: 1px solid #ccc;">
        <p><strong>${index + 1}. ${soal.pertanyaan}</strong></p>
        ${opsiHTML}
      </div>
    `;
  });
}

// 5. Kirim Jawaban dan Data Kecurangan ke Server
async function submitUjian() {
  const nama = document.getElementById("input-nama").value;
  const email = document.getElementById("input-email").value;
  
  let jawabanPeserta = {};
  
  dataUjian.forEach(soal => {
    const terpilih = document.querySelector(`input[name="soal_${soal.id}"]:checked`);
    jawabanPeserta[soal.id] = terpilih ? terpilih.value : ""; // Kirim teks jawabannya
  });
  
  // Kirim data ke Google Apps Script
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      nama: nama,
      email: email,
      jawaban: jawabanPeserta,
      pelanggaran: jumlahPelanggaran // Jumlah berapa kali dia ganti tab
    })
  });
  
  const hasil = await response.json();
  if (hasil.status === "success") {
    alert(`Ujian selesai! Nilai Anda: ${hasil.nilai}`);
    window.location.reload(); // Reset halaman
  }
}
