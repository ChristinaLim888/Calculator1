/* Dari Youtube tapi tidak berfungsi dengan benar */

// Ambil elemen layar kalkulator (tempat menampilkan input/output)
const screen = document.querySelector(".screen");

// Ambil semua tombol kalkulator
const buttons = document.querySelectorAll(".calc-button");

// Variabel untuk menyimpan input yang sedang ditulis user
let currentInput = "";

/**
 * Fungsi untuk update tampilan layar
 * Jika input kosong -> tampilkan "0"
 */
const updateScreen = (value) => {
  screen.textContent = value || "0";
};

/**
 * Fungsi untuk menghitung ekspresi aritmatika
 * Gunakan Function constructor (lebih aman daripada eval)
 */
const calculate = (expression) => {
  try {
    // Ganti simbol yang bukan standar JS menjadi operator valid
    const sanitized = expression
      .replace(/÷/g, "/")  // ubah ÷ menjadi /
      .replace(/×/g, "*")  // ubah × menjadi *
      .replace(/−/g, "-")  // ubah − menjadi -
      .replace(/–/g, "-")  // fallback untuk minus lain
      .replace(/\+/g, "+");

    // Hitung dengan Function constructor
    const result = Function(`"use strict"; return (${sanitized})`)();

    // Jika hasil undefined atau NaN, kembalikan "Error"
    if (isNaN(result) || result === undefined) return "Error";

    // Batasi panjang hasil jika terlalu panjang
    return result.toString().length > 12 ? result.toPrecision(12) : result;
  } catch (e) {
    return "Error";
  }
};

/**
 * Tambahkan event listener ke setiap tombol
 */
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const btnValue = button.textContent; // Ambil teks tombol yang ditekan

    if (btnValue === "C") {
      // Tombol Clear -> hapus semua input
      currentInput = "";
      updateScreen(currentInput);

    } else if (btnValue === "←") {
      // Tombol Backspace -> hapus 1 karakter terakhir
      currentInput = currentInput.slice(0, -1);
      updateScreen(currentInput);

    } else if (btnValue === "=") {
      // Tombol sama dengan -> hitung ekspresi
      const result = calculate(currentInput);
      updateScreen(result);
      currentInput = result.toString(); // simpan hasil agar bisa dipakai lanjut

    } else {
      // Jika tombol angka atau operator -> tambahkan ke input
      currentInput += btnValue;
      updateScreen(currentInput);
    }
  });
});
