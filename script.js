let refreshInterval = null;

async function fetchData(type, tableId) {
  const payment = document.getElementById("payment").value;
  const amount = document.getElementById("amount").value;
  const payTimeLimit = document.getElementById("payTimeLimit").value;
  const onlyTradeable = document.getElementById("onlyTradeable").checked;
  const merchantCheck = document.getElementById("merchantCheck").checked;

  const body = {
    page: 1,
    rows: 10,
    asset: "USDT",
    fiat: "VND",
    tradeType: type,
    payTypes: payment ? [payment] : [],
    publisherType: merchantCheck ? "merchant" : null,
    transAmount: amount || null,
    payTimeLimit: payTimeLimit || null,
    shieldMerchant: onlyTradeable,
  };

  const response = await fetch('https://binance-proxy-3bgb.onrender.com/api/p2p', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  });

  const data = await response.json();
  const rows = data.data || [];

  const tbody = document.getElementById(tableId);
  tbody.innerHTML = "";

  rows.forEach(row => {
    const adv = row.adv;
    const info = row.advertiser;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${adv.price}</td>
      <td>${adv.minSingleTransAmount} - ${adv.maxSingleTransAmount}</td>
      <td>${info.nickName}</td>
      <td>${adv.tradeMethods.map(m => m.tradeMethodName).join(", ")}</td>
    `;
    tbody.appendChild(tr);
  });
}

function fetchBoth() {
  fetchData("BUY", "buyTable");
  fetchData("SELL", "sellTable");
}

function setAutoRefresh() {
  const interval = parseInt(document.getElementById("refreshRate").value);
  if (refreshInterval) clearInterval(refreshInterval);
  if (interval > 0) {
    refreshInterval = setInterval(fetchBoth, interval);
  }
}




const amountInput = document.getElementById("amount");

if (amountInput) {
  amountInput.addEventListener("input", function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      if (typeof fetchData === "function") {
        fetchData();
      }
    }, doneTypingInterval);
  });

  amountInput.addEventListener("keydown", function () {
    clearTimeout(typingTimer);
  });
}



// Xử lý tính toán và nút Send/Delete
function setupManualRowEvents(row) {
  const inputBuy = row.querySelector(".input-buy");
  const inputSell = row.querySelector(".input-sell");
  const inputPrice = row.querySelector(".input-price");
  const inputResult = row.querySelector(".input-result");
  const inputCustomer = row.querySelector(".input-customer");
  const sendBtn = row.querySelector(".send-btn");
  const deleteBtn = row.querySelector(".delete-btn");

  function calculate() {
    let buy = parseFloat(inputBuy.value);

    const sell = parseFloat(inputSell.value);
    const price = parseFloat(inputPrice.value);
    let result = "";

    if (!isNaN(price)) {
      if (!isNaN(buy)) result = buy * price;
      else if (!isNaN(sell)) result = sell * price;
    }

    inputResult.value = result ? result.toLocaleString("vi-VN") : "";
  }

  inputBuy.addEventListener("input", calculate);
  inputSell.addEventListener("input", calculate);
  inputPrice.addEventListener("input", calculate);

  sendBtn.addEventListener("click", async () => {
    const customer = inputCustomer.value;
    const buy = parseFloat(inputBuy.value) || "";
    const sell = parseFloat(inputSell.value) || "";
    const price = parseFloat(inputPrice.value) || "";
    const result = inputResult.value.replace(/[^\d.]/g, "");
  });

  deleteBtn.addEventListener("click", () => {
    row.querySelectorAll("input").forEach(input => input.value = "");
    row.querySelector(".input-price")?.dispatchEvent(new Event("input")); // gọi lại tính nếu cần
  });
}

document.querySelectorAll("#manualBody tr").forEach(setupManualRowEvents);



// Gợi ý giá đầu tiên từ bảng "Mua USDT" nếu chưa nhập
function getFirstBuyPrice() {
  const buyTable = document.querySelectorAll("table")[1]; // table Mua USDT là bảng thứ 2
  if (!buyTable) return null;

  const firstRow = buyTable.querySelector("tbody tr");
  if (!firstRow) return null;

  const priceCell = firstRow.querySelector("td");
  return priceCell?.textContent?.trim() || null;
}

// Khi người dùng nhập số lượng nhưng chưa nhập giá, thì tự gợi ý giá
document.querySelectorAll("#manualBody tr").forEach(row => {
  const inputBuy = row.querySelector(".input-buy");
  const inputSell = row.querySelector(".input-sell");
  const inputPrice = row.querySelector(".input-price");

  function autoFillPrice() {
    if (!inputPrice.value) {
      const firstPrice = getFirstBuyPrice();
      row.querySelector(".input-price").dispatchEvent(new Event("input")); // gọi lại tính toán
    }
  }

  inputBuy?.addEventListener("input", autoFillPrice);
  inputSell?.addEventListener("input", autoFillPrice);
});


window.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.querySelector('#amount');
    if (amountInput) {
        amountInput.value = '100000000';
    }
    fetchBoth();
});

document.querySelectorAll("#manualBody tr").forEach(row => {
  const inputBuy = row.querySelector(".input-buy");
  const inputSell = row.querySelector(".input-sell");
  const inputPrice = row.querySelector(".input-price");

  const amountInput = document.getElementById("amount");

  function autoFillPriceFromBuy() {
    if (!inputPrice.value && inputBuy.value) {
      const buyPrice = parseFloat(getFirstBuyPrice());
      if (!isNaN(buyPrice)) {
        inputPrice.dispatchEvent(new Event("input"));
      }
    }
  }

  function autoFillPriceFromSell() {
    const sellQty = parseFloat(inputSell.value);
    if (sellQty > 0 && !isNaN(sellQty)) {
      if (sellQty < 15000) {
        if (amountInput) amountInput.value = "100000000";
      } else if (sellQty >= 30000) {
        if (amountInput) amountInput.value = "700000000";
      }
      fetchBoth();  // Gọi cập nhật bảng

      setTimeout(() => {
        const sellPrice = parseFloat(getFirstSellPrice());
        if (!isNaN(sellPrice)) {
          const adjusted = roundPrice(sellPrice - 10);
          inputPrice.dispatchEvent(new Event("input"));
        }
      }, 500); // đợi bảng cập nhật xong
    }
  }

  inputBuy?.addEventListener("input", autoFillPriceFromBuy);
  inputSell?.addEventListener("input", autoFillPriceFromSell);
});


// Lấy giá đầu tiên từ bảng MUA USDT
function getFirstBuyPrice() {
  const buyTable = document.querySelectorAll("table")[1];
  if (!buyTable) return null;
  const firstRow = buyTable.querySelector("tbody tr");
  if (!firstRow) return null;
  const priceCell = firstRow.querySelector("td");
  return priceCell?.textContent?.replace(/[^\d.]/g, "") || null;
}

document.querySelectorAll("#manualBody tr").forEach(row => {
  const inputBuy = row.querySelector(".input-buy");
  const inputPrice = row.querySelector(".input-price");
  const amountInput = document.getElementById("amount");

  inputBuy?.addEventListener("input", () => {
    if (inputBuy.value) {
      if (amountInput) amountInput.value = "100000000";
      fetchBoth();

      setTimeout(() => {
        const rawPrice = parseFloat(getFirstBuyPrice());
        if (!isNaN(rawPrice)) {
          const rounded = roundPrice(rawPrice);
          inputPrice.dispatchEvent(new Event("input"));
        }
      }, 500);
    }
  });
});


document.querySelectorAll(".send-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const row = btn.closest("tr");
    const customer = row.querySelector(".input-customer")?.value || "";
    const buy = row.querySelector(".input-buy")?.value || "";
    const sell = row.querySelector(".input-sell")?.value || "";
    const price = row.querySelector(".input-price")?.value || "";
    const result = row.querySelector(".input-result")?.value || "";

    let textParts = [];
    if (customer) textParts.push(`Khách hàng: ${customer}`);
    if (buy) textParts.push(`Mua (USDT): ${buy}`);
    if (sell) textParts.push(`Bán (USDT): ${sell}`);
    if (price) textParts.push(`Giá: ${price}`);
    if (result) textParts.push(`Quy đổi: ${result}`);

    const text = textParts.join(" | ");

    navigator.clipboard.writeText(text)
      .then(() => {
        // ✅ Sau khi copy thành công → mở Zalo
        window.open("zalo://", "_blank");
      })
      .catch((err) => {
        alert("Không thể sao chép: " + err);
      });

    // Thực hiện thêm hành động gửi nếu có (API, v.v.)
  });
});


  const setAmountBtn = document.getElementById("setAmountBtn");
  let isToggled = false;
  setAmountBtn.addEventListener("click", () => {
    const amountInput = document.getElementById("amount");
    isToggled = !isToggled;
    amountInput.value = isToggled ? 700000000 : 100000000;
    fetchBoth();
  });

// Dark Mode toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("darkModeToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });
  }
});
