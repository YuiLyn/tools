async function fetchData() {
    const searchKeyword = document.getElementById("search-input").value;
    if (!searchKeyword) {
        alert("請輸入商品關鍵詞！");
        return;
    }

    const response = await fetch("prices.json");
    const data = await response.json();

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ""; // 清空舊的結果

    for (const shop in data) {
        const filteredItems = data[shop].filter(item => item.name.includes(searchKeyword));
        if (filteredItems.length > 0) {
            const shopSection = document.createElement("div");
            shopSection.innerHTML = `<h2>${shop}</h2>`;
            filteredItems.forEach(item => {
                shopSection.innerHTML += `<p>${item.name} - ${item.price} 日元 - ${item.stock ? "有庫存" : "缺貨"}</p>`;
            });
            resultsDiv.appendChild(shopSection);
        }
    }
}
