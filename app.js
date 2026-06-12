const API_URL = "https://script.google.com/macros/s/AKfycbwX9MFa3mcGDbKDQIsQWl0V6F-QlMFcOMOSyvOp7C2wOvr03pO0hxKG6X-BTG5f-NQcZg/exec";
let dataUjian = [];
let jumlahPelanggaran = 0;

// 1. ANTI-CURANG: Deteksi Pindah Tab
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    jumlahPelanggaran++;
    const badge = document.getElementById("badge-pelanggaran");
    if (badge) badge.innerText = `Pindah Tab: ${jumlahPelanggaran}x`;
    alert(`Peringatan! Anda meninggalkan halaman ujian. Pelanggaran: ${jumlahPelanggaran} kali.`);
  }
});

// 2. ANTI-CURANG: Blokir Klik Kanan & Copy-Paste
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("keydown", e => {
  if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u') || e.key === 'F12') {
    e.preventDefault();
    alert("Fitur ini dinonaktifkan demi keamanan ujian.");
  }
});

// 3. Fungsi Utama Memuat Ujian (Dipanggil dari index.html)
async function muatUjian() {
  const container = document.getElementById("box-soal");
  
  try {
    // Ambil data dari Google Apps Script
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    dataUjian = await response.json();
    
    // Validasi jika data kosong
    if (dataUjian.length === 0) {
      container.innerHTML = `<div class="alert alert-warning">Bank soal di Google Sheets masih kosong atau belum diisi.</div>`;
      return;
    }

    // Tampilkan soal ke HTML jika sukses
    tampilkanSoal();

  } catch (error) {
    console.error("Gagal mengambil data:", error);
    container.innerHTML = `
      <div class="alert alert-danger">
        <h5>Gagal Memuat Soal!</h5>
        <p class="small">${error.message}</p>
        <p class="mb-0 small">Pastikan Apps Script sudah di-deploy ulang sebagai <strong>"Anyone"</strong> dan Sheet "Soal" tidak kosong.</p>
      </div>
    `;
  }
}

// 4. Render Soal dan 5 Opsi ke HTML
function tampilkanSoal() {
  const container = document.getElementById("box-soal");
  container.innerHTML = ""; // Bersihkan spinner loading
  
  dataUjian.forEach((soal, index) => {
    let opsiHTML = "";
    
    soal.pilihan.forEach((opsi, i) => {
      const opsiId = `soal_${soal.id}_opsi_${i}`;
      opsiHTML += `
        <div class="form-check my-2 p-2 border rounded bg-light">
          <input class="form-check-input ms-1" type="radio" name="soal_${soal.id}" id="${opsiId}" value="${opsi}">
          <label class="form-check-label ms-2 w-100" for="${opsiId}">
            ${opsi}
          </label>
        </div>
      `;
    });
    
    container.innerHTML += `
      <div class="card card-soal shadow-sm mb-4">
        <div class="card-body p-4">
          <h5 class="card-title mb-3 fw-semibold">${index + 1}. ${soal.pertanyaan}</h5>
          <div class="opsi-container">
            ${opsiHTML}
          </div>
        </div>
      </div>
    `;
  });
}

// 5. Kirim Jawaban ke Server
async function submitUjian() {
  const nama = document.getElementById("input-nama").value;
  const email = document.getElementById("input-email").value;
  
  let jawabanPeserta = {};
  dataUjian.forEach(soal => {
    const terpilih = document.querySelector(`input[name="soal_${soal.id}"]:checked`);
    jawabanPeserta[soal.id] = terpilih ? terpilih.value : "";
  });
  
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        nama: nama,
        email: email,
        jawaban: jawabanPeserta,
        pelanggaran: jumlahPelanggaran
      })
    });
    
    const hasil = await response.json();
    if (hasil.status === "success") {
      alert(`Ujian selesai! Nilai Anda: ${hasil.nilai}`);
      window.location.reload();
    }
  } catch (error) {
    alert("Gagal mengirim jawaban. Silakan coba lagi.");
    console.error(error);
  }
}
