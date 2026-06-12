const API_URL = "URL_WEB_APP_APPS_SCRIPT_ANDA";

// Ambil soal saat halaman dimuat
async function ambilSoal() {
  let response = await fetch(API_URL);
  let daftarSoal = await response.json();
  // Logika untuk menampilkan daftarSoal ke HTML
}

// Kirim hasil ujian
async function kirimHasil(nama, email, skor) {
  let response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ nama: nama, email: email, skor: skor })
  });
  let result = await response.json();
  if(result.status === "success") {
    alert("Ujian selesai dan nilai telah disimpan!");
  }
}
