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