window.addEventListener('load', () => {
  dom.qrcode = document.getElementById("qrcode");
  dom.qrdata = document.getElementById("qrdata");
});

function drawQRCode(data) {
  if (!data || !dom.qrcode) {
    return
  };

  dom.qrcode.innerHTML = '';

  new QRCode(dom.qrcode, {
    text: data,
    width: 128,
    height: 128,
    correctLevel: QRCode.CorrectLevel.H
  });

  dom.qrdata.innerText = data.slice(0, 16) + ' ' + data.slice(-16);
}
