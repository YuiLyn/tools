import requests
from bs4 import BeautifulSoup
import json

# 定義目標網站和搜索關鍵字
search_keyword = "PS5"
urls = {
    "Mercari": f"https://www.mercari.com/jp/search/?keyword={search_keyword}",
    "駿河屋": f"https://www.suruga-ya.jp/search?search_word={search_keyword}",
    "Mandarake": f"https://order.mandarake.co.jp/order/listPage/list?keyword={search_keyword}"
}

prices_data = {}

for shop, url in urls.items():
    response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(response.text, "html.parser")

    # 解析價格數據（需根據不同網站調整選擇器）
    prices = [p.text for p in soup.find_all("span", class_="price")]
    stocks = [s.text for s in soup.find_all("span", class_="stock-status")]

    # 只取前5筆商品
    prices_data[shop] = [{"name": search_keyword, "price": prices[i], "stock": stocks[i]} for i in range(min(5, len(prices)))]

# 存入 JSON 文件
with open("prices.json", "w") as f:
    json.dump(prices_data, f, indent=4)
