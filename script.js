function generateQRCode() {
    var inputValue = document.getElementById('text-input').value;
    var colorValue = document.getElementById('color-picker').value;
		
    // Ensure there is a value to generate QR code
    if (inputValue.trim() === '') {
        alert('Please enter text or URL to generate QR code.');
        return;
    }

    // Clear existing QR code
    document.getElementById('qrcode').innerHTML = '';
	

    // Create QR code
    var qrcode = new QRCode(document.getElementById('qrcode'), {
        text: inputValue,
        width: 128,
        height: 128,
        colorDark: colorValue,
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}
