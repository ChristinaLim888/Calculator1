/* Pakai JS Calculator dari Coach Dicky */

"use strict"; // supaya JavaScript lebih ketat

// Ambil elemen screen (tempat tampil angka & hasil)
const screen = document.querySelector(".screen");

// Variabel untuk menyimpan ekspresi (angka + operator)
let currentInput = "";

// Fungsi update layar kalkulator
function updateScreen(value) {
  screen.textContent = value || "0"; // kalau kosong, tampilkan 0
}

// Fungsi handle tombol angka/operator
function handleButton(value) {
  if (value === "C") {
    // reset input
    currentInput = "";
  } else if (value === "←") {
    // hapus 1 karakter terakhir
    currentInput = currentInput.slice(0, -1);
  } else if (value === "=") {
    try {
      // evaluasi ekspresi matematika
      // ganti simbol ÷ × − + ke format JS
      const expression = currentInput
        .replace(/÷/g, "/")
        .replace(/×/g, "*")
        .replace(/−/g, "-")
        .replace(/&plus;/g, "+");

      const result = eval(expression); // hati-hati: eval hanya untuk latihan
      currentInput = result.toString();
    } catch (err) {
      currentInput = "Error";
    }
  } else {
    // tambahkan angka/operator ke ekspresi
    currentInput += value;
  }

  updateScreen(currentInput);
}

// Tambahkan event listener ke semua tombol
document.querySelectorAll(".calc-button").forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.textContent.trim(); // ambil teks tombol
    handleButton(value);
  });
});

// Inisialisasi tampilan
updateScreen(currentInput);


