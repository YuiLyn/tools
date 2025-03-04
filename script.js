function convert() {
    const miles = parseFloat(document.getElementById('miles').value);
    const resultDiv = document.getElementById('result');
    
    if (isNaN(miles)) {
        resultDiv.innerHTML = "請輸入有效的數字！";
        return;
    }
    
    const kilometers = miles * 1.60934;
    resultDiv.innerHTML = `${miles} 英里 = ${kilometers.toFixed(2)} 公里`;
}

let icsContent = '';
let exchangeRates = null;

async function loadExchangeRates() {
    try {
        const response = await fetch('exchange-rates.json');
        const data = await response.json();
        return data.rates;
    } catch (error) {
        console.error('無法加載匯率數據:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    exchangeRates = await loadExchangeRates();
});

function generateCalendar() {
    const eventName = document.getElementById('eventName').value.trim();
    const eventDate = document.getElementById('eventDate').value;
    const startHour = document.getElementById('startHour').value;
    const startMinute = document.getElementById('startMinute').value;
    const endHour = document.getElementById('endHour').value;
    const endMinute = document.getElementById('endMinute').value;
    const location = document.getElementById('location').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!eventName || !eventDate || !startHour || !startMinute || !endHour || !endMinute) {
        alert('請填寫必填欄位（事件名稱、日期、開始時間和結束時間）！');
        return;
    }

    // 格式化日期和時間（UTC）
    const date = new Date(eventDate);
    const startTime = `${eventDate}T${startHour.padStart(2, '0')}:${startMinute.padStart(2, '0')}:00Z`;
    const endTime = `${eventDate}T${endHour.padStart(2, '0')}:${endMinute.padStart(2, '0')}:00Z`;

    // 生成 iCalendar (.ics) 格式
    icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${eventName}\nDTSTART:${startTime}\nDTEND:${endTime}\n${location ? `LOCATION:${location}\n` : ''}${description ? `DESCRIPTION:${description}\n` : ''}END:VEVENT\nEND:VCALENDAR`;

    document.getElementById('downloadBtn').style.display = 'block';
}

function downloadICS() {
    if (icsContent) {
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'event.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}

function updateCurrencyForLocation(location) {
    if (!exchangeRates || !location) return;

    const currencyMap = {
        '東京': 'JPY',
        '倫敦': 'GBP',
        '紐約': 'USD',
        '巴黎': 'EUR',
        '香港': 'HKD',
        '上海': 'CNY'
    };

    const currency = currencyMap[location] || 'TWD';
    const twdRate = exchangeRates.TWD?.USD || 0.03036; // 假設 TWD 對 USD 的匯率
    const targetRate = exchangeRates[currency]?.USD || 1.0;

    if (twdRate && targetRate) {
        const exchangeRate = (1 / twdRate) * targetRate; // 1 TWD 換算成目標貨幣
        const resultDiv = document.createElement('div');
        resultDiv.textContent = `1 TWD ≈ ${exchangeRate.toFixed(4)} ${currency}`;
        resultDiv.style.color = '#666';
        resultDiv.style.marginTop = '10px';
        document.getElementById('location').parentNode.appendChild(resultDiv);
    }
