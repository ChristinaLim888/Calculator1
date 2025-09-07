Adanya perubahan, penambahan atau pengurangan fungsi pada JS dari Calculator coach Dicky

Rangkum **perubahan** yang terjadi ketika kamu mem-port kode dari **Node CLI (prompt-sync)** ke **Browser UI (HTML + JS)**.
Untuk tiap item aku tunjukkan **(1) cuplikan kode sebelum**, **(2) cuplikan kode sesudah**, dan **(3) alasan detail** mengapa harus diubah / dihapus / ditambahkan.

# Ringkasan cepat

* **Berubah** = fitur/logic yang masih ada tapi diimplementasikan berbeda.
* **Dihapus** = fitur/utility yang hilang (tidak relevan di browser).
* **Ditambahkan** = fitur/utility baru yang perlu ada di browser.

---

# A. Yang **BERUBAH** (implementasi berubah)

1. **Input: blocking prompt → event-driven button input**

Before (Node CLI):

```js
// membaca angka/operator secara sekuensial dari terminal
const num1 = getValidNumberInput("Enter the first number: ");
const operator = getValidOperatorInput("Enter operator: ");
const num2 = getValidNumberInput("Enter the second number: ");
```

After (Browser UI):

```js
// membangun ekspresi dari klik tombol; event-driven
document.querySelectorAll(".calc-button").forEach(btn =>
  btn.addEventListener("click", () => handleButton(btn.textContent.trim()))
);
// handleButton menambahkan angka/operator ke currentInput
```

**Kenapa:** Browser tidak menyediakan mekanisme input sinkron seperti `prompt()`/`prompt-sync` — UI bersifat *event-driven*. Pengguna klik tombol, bukan mengetik di terminal secara berurutan.

---

2. **Alur program: infinite loop `while(true)` → tidak ada loop, dikendalikan event**

Before:

```js
while (true) {
  // tampil menu, minta input, proses, repeat
}
```

After:

```js
// Tidak ada loop; semua aksi terjadi saat event (click)
function handleButton(value) { ... }
```

**Kenapa:** `while(true)` memblok UI dan tidak sesuai di browser; browser sudah punya event loop sendiri — kita merespon event klik.

---

3. **Output: `console.log` (terminal) → `screen.textContent` (DOM)**

Before:

```js
console.log(`Result: ${result}`);
```

After:

```js
// update tampilan layar kalkulator di HTML
const screen = document.querySelector(".screen");
screen.textContent = result.toString();
```

**Kenapa:** Hasil harus terlihat di halaman, bukan di console devtools (walau console masih berguna untuk debug).

---

4. **Operator symbols: keyboard-friendly (`*`,`/`) → visual symbols (`×`,`÷`) mapping**

Before:

```js
// Node CLI user ketik "*" atau "/"
```

After:

```js
// tombol di HTML menampilkan '×' dan '÷', jadi sebelum evaluasi:
const expression = currentInput.replace(/÷/g, "/").replace(/×/g, "*");
const result = eval(expression);
```

**Kenapa:** UI sering tampilkan simbol matematika visual; harus konversi ke simbol JavaScript sebelum evaluasi.

---

5. **Perhitungan: fungsi terpisah (`add`,`multiply`) → evaluasi ekspresi (`eval`)**

Before:

```js
function add(a,b){ return a + b; }
function multiply(a,b){ return a * b; }
result = add(num1, num2);
```

After:

```js
// kita bangun string "3+4*2" lalu eval
const result = eval(expression);
```

**Kenapa & catatan:** `eval` cepat untuk prototype UI, tapi berisiko (security, injection) — untuk produksi gunakan parser seperti `mathjs` atau implementasi evaluator yang aman.

---

# B. Yang **DIHAPUS** (tidak relevan di browser)

1. **`prompt-sync` dan semua fungsi input sinkron**

   * Dihapus: `require("prompt-sync")`, `getValidNumberInput`, `getValidOperatorInput`.
   * **Alasan:** browser tidak bisa menggunakan prompt-sync; input diambil dari DOM.

2. **Terminal loop & prompt messages**

   * Dihapus: `while(true) { ... }`, `console.log`-heavy menu.
   * **Alasan:** UI menggantikan menu tekstual.

3. **Node-only module checks / exports (opsional)**

   * Dihapus: `if (require.main === module)` atau `module.exports` / `export` jika hanya dipakai di browser.
   * **Alasan:** file akan dimuat lewat `<script>` di HTML, bukan `require`/`import` (kecuali bundler).

---

# C. Yang **DITAMBAHKAN** (wajib di browser)

1. **DOM selectors & state**

```js
const screen = document.querySelector(".screen");
let currentInput = "";
```

**Alasan:** perlu elemen untuk menampilkan angka, dan variabel untuk menyimpan ekspresi interaktif.

2. **Event listeners untuk tombol**

```js
document.querySelectorAll(".calc-button").forEach(btn => {
  btn.addEventListener("click", () => handleButton(btn.textContent.trim()));
});
```

**Alasan:** deteksi klik tombol → update `currentInput`.

3. **Fungsi `handleButton` untuk logika tombol (C, backspace, =, angka/operator)**

```js
function handleButton(value) {
  if (value === "C") currentInput = "";
  else if (value === "←") currentInput = currentInput.slice(0, -1);
  else if (value === "=") compute();
  else currentInput += value;
  updateScreen(currentInput);
}
```

**Alasan:** centralize UI behavior.

4. **Symbol mapping & safe evaluation**

```js
const expression = currentInput.replace(/÷/g,"/").replace(/×/g,"*");
try { result = eval(expression); } catch(e) { currentInput="Error"; }
```

**Alasan:** konversi simbol visual lalu evaluasi. Perlu try/catch untuk error sintaks.

5. **Optional: area analisis hasil**

```html
<section class="analysis"></section>
```

```js
function showAnalysis(result){
  // positive/negative, integer/float, even/odd
}
```

**Alasan:** jika kamu ingin menampilkan hal yang sebelumnya diprint di terminal (positif/negatif, integer, even/odd), butuh area DOM.

---

# D. Contoh perubahan berdampingan (potongan singkat)

### 1) Input/Flow

**TS/Node (sekuensial):**

```js
const num1 = getValidNumberInput("Enter the first number: ");
const operator = getValidOperatorInput("Enter operator: ");
const num2 = getValidNumberInput("Enter the second number: ");
```

**Browser (event-driven):**

```js
// user klik tombol → handleButton menambahkan ke currentInput
// saat tekan '=' → compute() membaca seluruh expression
```

### 2) Hasil & analisis

**Node:**

```js
console.log(`Result: ${result}`);
if (result > 0) console.log("It is a positive number.");
```

**Browser:**

```js
updateScreen(result.toString());
showAnalysis(result); // menampilkan di elemen .analysis
```

---

# E. Contoh tambahan: menambahkan analisis hasil di UI (paste ke `script.js`)

Tambahkan HTML (di bawah `.screen`) supaya analisis muncul:

```html
<section class="analysis" aria-live="polite"></section>
```

Tambahkan fungsi JS:

```js
function showAnalysis(result) {
  const analysisEl = document.querySelector(".analysis") || createAnalysisEl();
  if (typeof result !== "number" || !Number.isFinite(result)) {
    analysisEl.textContent = `Error or not a finite number: ${result}`;
    return;
  }
  const parts = [];
  parts.push(result > 0 ? "Positive" : result < 0 ? "Negative" : "Zero");
  parts.push(Number.isInteger(result) ? `Integer (${result % 2 === 0 ? "Even" : "Odd"})` : "Floating-point");
  analysisEl.textContent = `Analysis: ${parts.join(" · ")}`;
}
function createAnalysisEl(){
  const el = document.createElement("section");
  el.className = "analysis";
  document.querySelector(".wrapper").appendChild(el);
  return el;
}
```

**Penjelasan:** `showAnalysis` mereplikasi logika analisa dari terminal (positif/negatif/zero, integer/float, even/odd) dan menulis hasil ke halaman.

---

# F. Safety / best-practice notes (penting)

* **Jangan gunakan `eval`** di production kalau input bisa dimanipulasi. Gunakan library yang khusus (mis. `mathjs`) atau buat parser/evaluator sederhana.
* **Validasi**: sebelum `eval`, pastikan `currentInput` hanya berisi angka, titik, dan operator yang diizinkan (regex filter).
* **Keyboard support**: kamu bisa tambahkan `keydown` listener agar kalkulator mendukung keyboard input.
* **Accessibility**: tambahkan `aria-label` dan fokus manajemen untuk pengguna screen reader.

---

# G. Ringkasan tindakan yang perlu kamu lakukan sekarang (practical)

1. **Hapus** semua kode `prompt-sync` dan fungsi input sinkron.
2. **Tambahkan** DOM elements (`.screen`, `.analysis`) saat belum ada.
3. **Tambahkan** event listeners untuk `.calc-button`.
4. **Implemen** `handleButton`, `compute`, `updateScreen`, `showAnalysis`.
5. **Ganti** pemakaian fungsi `add/subtract/...` berurutan dengan evaluasi ekspresi (sementara) atau gunakan math parser untuk aman.

---

Kalau kamu mau, aku bisa **langsung**:

* a) kirim file `script.js` lengkap (dengan analisis hasil) yang cocok untuk HTML-mu, atau
* b) modifikasi HTML agar muncul panel analisis & keyboard support.

Mana yang mau kamu terima sekarang? Aku akan langsung kirimkan file `script.js` penuh yang sudah terintegrasi dengan analisis dan validasi aman sederhana.
