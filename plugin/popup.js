// popup.js

// Form ve checkbox elementlerini alalım
const extensionStatusEl = document.getElementById("extension-status");
const maxBidEl = document.getElementById("max-bid");
const bidIncrementEl = document.getElementById("bid-increment");
const endTimeEl = document.getElementById("end-time");
const lastMsEl = document.getElementById("last-ms");
const startButton = document.getElementById("start-extension");
const stopButton = document.getElementById("stop-extension");

stopButton.addEventListener("click",
  () => {
    if(startButton.style.display == "none"){
      startButton.style.display = "inline";
      stopButton.style.display = "none";
    }
  }
);
// Sayfa her açıldığında, chrome.storage içinden verileri çekelim:
window.addEventListener("DOMContentLoaded", () => {
  
  chrome.storage.local.get(
    ["extensionActive", "maxBid", "bidIncrement", "endTime", "lastMs"],
    (result) => {
      // Değerleri form elemanlarına koyalım
      extensionStatusEl.checked = !!result.extensionActive;
      if (result.maxBid !== undefined) maxBidEl.value = result.maxBid;
      if (result.bidIncrement !== undefined) bidIncrementEl.value = result.bidIncrement;
      if (result.endTime !== undefined) {
        // endTime epoch cinsinden saklanmış olabilir
        const d = new Date(result.endTime);
        // datetime-local formatına (yyyy-MM-ddTHH:mm) çevirelim
        const isoString = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        endTimeEl.value = isoString;
      }
      if (result.lastMs !== undefined) lastMsEl.value = result.lastMs;
    }
  );
});

// Her input/checkbox değiştiğinde, verileri kaydedelim
[extensionStatusEl, maxBidEl, bidIncrementEl, endTimeEl, lastMsEl].forEach((el) => {
  el.addEventListener("change", () => {
    saveFormData();
  });
});

function saveFormData() {
  chrome.storage.local.set({
    extensionActive: extensionStatusEl.checked,
    maxBid: maxBidEl.value ? parseFloat(maxBidEl.value) : 0,
    bidIncrement: bidIncrementEl.value ? parseFloat(bidIncrementEl.value) : 0,
    endTime: endTimeEl.value ? new Date(endTimeEl.value).getTime() : 0,
    lastMs: lastMsEl.value ? parseInt(lastMsEl.value, 10) : 0,
  });
}

// Log alanı


// Log ekleme fonksiyonu


// "Başlat" butonuna tıklanınca
startButton.addEventListener("click", () => {
  const isActive = true;


  // Verileri alalım (tekrar):
  const maxBid = parseFloat(maxBidEl.value);
  const bidIncrement = parseFloat(bidIncrementEl.value);
  const endTime = new Date(endTimeEl.value).getTime();
  const lastMs = parseInt(lastMsEl.value, 10);

  // Basit validasyon
  if (isNaN(maxBid) || isNaN(bidIncrement) || isNaN(lastMs) || !endTime) {
    alert("Lütfen tüm alanları eksiksiz doldurun (sayı veya tarih).");
    return;
  }
  
  console.log("Eklenti çalışmaya başladı!");
  console.log(`Maksimum Teklif: ${maxBid}`);
  console.log(`Teklif Artırma Fiyatı: ${bidIncrement}`);
  console.log(`İhale Bitiş Saati: ${new Date(endTime).toLocaleString()}`);
  console.log(`Son Milisaniye Ayarı: ${lastMs}`);

  // Aktif sekmeye "START_AUCTION" mesajı gönderelim
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "START_AUCTION",
      maxBid,
      bidIncrement,
      endTime,
      lastMs
    });
  });
  if (isActive) {
    stopButton.style.display = "inline";
    startButton.style.display = "none";
    stopButton.disabled = false;
    chrome.browserAction.setBadgeText({ text: "Eklenti Çalışıyor" });
  }
});

// "Durdur" butonuna tıklanınca
stopButton.addEventListener("click", () => {
  console.log("Eklenti durduruldu!");
  // Content script'e durdurma mesajı yolla
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "STOP_AUCTION" });
    
  });
});