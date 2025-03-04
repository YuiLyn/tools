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

async function loadExchangeRates() {
    try {
        const response = await fetch('exchange-rates.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.rates;
    } catch (error) {
        console.error('無法加載匯率數據:', error);
        // 提供預設值，避免程式崩潰
        return {
            TWD: { USD: 0.03036 },
            USD: { TWD: 32.936906 },
            JPY: { USD: 0.006717 },
            EUR: { USD: 0.952908 },
            GBP: { USD: 0.787115 },
            CNY: { USD: 7.286114 },
            HKD: { USD: 7.776851 }
        };
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

    console.log('生成日曆事件:', { eventName, eventDate, startHour, startMinute, endHour, endMinute, location, description });

    if (!eventName || !eventDate || !startHour || !startMinute || !endHour || !endMinute) {
        alert('請填寫必填欄位（事件名稱、日期、開始時間和結束時間）！');
        return;
    }

    // 格式化日期和時間（UTC）
    const date = new Date(eventDate);
    const startTime = `${eventDate}T${startHour.padStart(2, '0')}:${startMinute.padStart(2, '0')}:00Z`;
    const endTime = `${eventDate}T${endHour.padStart(2, '0')}:${endMinute.padStart(2, '0')}:00Z`;

    // 生成 iCalendar (.ics) 格式
    icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${encodeURIComponent(eventName)}\nDTSTART:${startTime}\nDTEND:${endTime}\n${location ? `LOCATION:${encodeURIComponent(location)}\n` : ''}${description ? `DESCRIPTION:${encodeURIComponent(description)}\n` : ''}END:VEVENT\nEND:VCALENDAR`;

    document.getElementById('downloadBtn').style.display = 'block';
    generateQRForEvent(icsContent); // 調用 QR 碼生成函數
}

function downloadICS() {
    if (icsContent) {
        const decodedContent = decodeURIComponent(icsContent);
        const blob = new Blob([decodedContent], { type: 'text/calendar;charset=UTF-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'event.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('已下載 .ics 文件');
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
    const twdRate = exchangeRates.TWD?.USD || 0.03036;
    const targetRate = exchangeRates[currency]?.USD || 1.0;

    if (twdRate && targetRate) {
        const exchangeRate = (1 / twdRate) * targetRate; // 1 TWD 換算成目標貨幣
        const resultDiv = document.createElement('div');
        resultDiv.textContent = `1 TWD ≈ ${exchangeRate.toFixed(4)} ${currency}`;
        resultDiv.style.color = '#666';
        resultDiv.style.marginTop = '10px';
        document.getElementById('location').parentNode.appendChild(resultDiv);
    } else {
        console.warn('匯率數據不可用，使用預設值。');
    }
}

function generateQRForEvent(icsContent) {
    const qrCodeDiv = document.createElement('div');
    qrCodeDiv.id = 'eventQR';
    const qrCodeContainer = document.getElementById('qrCode');
    if (qrCodeContainer) {
        qrCodeContainer.innerHTML = ''; // 清空舊的 QR 碼
        qrCodeContainer.appendChild(qrCodeDiv);
    } else {
        console.error('找不到 #qrCode 元素');
        return;
    }

    new QRCode(qrCodeDiv, {
        text: URL.createObjectURL(new Blob([icsContent], { type: 'text/calendar' })),
        width: 150,
        height: 150,
        colorDark: '#000000',
        colorLight: '#ffffff'
    });

    // 添加下載 QR 碼的按鈕
    const downloadQRBtn = document.createElement('button');
    downloadQRBtn.textContent = '下載 QR 碼';
    downloadQRBtn.style.backgroundColor = '#32cd32';
    downloadQRBtn.style.color = 'white';
    downloadQRBtn.style.marginTop = '10px';
    downloadQRBtn.style.width = '100%';
    downloadQRBtn.style.padding = '8px';
    downloadQRBtn.style.border = 'none';
    downloadQRBtn.style.borderRadius = '4px';
    downloadQRBtn.style.cursor = 'pointer';
    downloadQRBtn.onclick = function() {
        const qrImg = qrCodeDiv.querySelector('img');
        if (qrImg) {
            const link = document.createElement('a');
            link.href = qrImg.src;
            link.download = 'calendar-event-qr.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    qrCodeContainer.appendChild(downloadQRBtn);
}
