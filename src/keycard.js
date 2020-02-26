const dom = {};

window.addEventListener('load', () => {
  dom.key = document.getElementById("key");
  dom.keycard = document.getElementById("keycardData");
});

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

/**
 * @param {Uint8Array} keycardKey
 * @return {Uint8Array}
 */
function getKeycardData(keycardKey) {
  const iv = new node.Buffer(8);
  let tmp = new node.Buffer(0x50), i;
  for (i = 0; i < 0x50; i++) tmp[i] = i;

  // const cipher = new JSUCrypt.cipher.DES(JSUCrypt.padder.None, JSUCrypt.cipher.MODE_CBC);
  const cipher = node.crypto.createCipheriv('des-ede-cbc', keycardKey, iv);

  // cipher.init(new JSUCrypt.key.DESKey(Array.from(keycardKey)), JSUCrypt.cipher.MODE_ENCRYPT);
  // let keycardData = cipher.finalize(tmp);
  let keycardData = cipher.update(tmp);

  for (i = 0; i < 0x50; i++) {
    tmp[i] = ((keycardData[i] >> 4) & 0x0f) ^ (keycardData[i] & 0x0f);
  }

  return tmp;
}

function genKey() {
  if (typeof window.crypto === "undefined") {
    alert("Secure random API not available");
    return;
  }

  const array = new node.Buffer(16);
  window.crypto.getRandomValues(array);
  dom.key.value = array.toString('hex');
  genKeycard();
}

function genKeycard() {
  const KEYCARD_CONTENT = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '0123456789'];
  const KEYCARD_TILTES = ['uppercase letters', 'lowercase letters', 'digits'];
  const keyPattern = /^[0-9a-f]{32}$/i;

  let key = dom.key.value;

  if (!keyPattern.test(key)) {
    alert("Invalid key");
    return;
  }

  if (drawQRCode) {
    drawQRCode(key);
  }

  key = node.Buffer.from(key, 'hex');

  const touch = (e) => document.createElement(e);
  const keycardData = getKeycardData(key);

  let i, j;

  function makeTable(i) {
    const table = touch('div');
    let tr = touch('div');

    for (j = 0; j < KEYCARD_CONTENT[i].length; j++) {
      const th = touch('span');
      th.innerText = KEYCARD_CONTENT[i].charAt(j);
      tr.appendChild(th);
    }

    table.appendChild(tr);
    tr = touch('div');

    for (j = 0; j < KEYCARD_CONTENT[i].length; j++) {
      const td = touch('span');
      td.innerText = toHex(keycardData[KEYCARD_CONTENT[i].charCodeAt(j) - 0x30]).substring(1);
      tr.appendChild(td);
    }

    table.appendChild(tr);
    return table;
  }

  dom.keycard.innerHTML = '';

  for (i = 0; i < KEYCARD_CONTENT.length; i++) {
    const res = touch('div');
    let caption = touch('span');
    caption.innerText = KEYCARD_TILTES[i];
    res.appendChild(caption);
    res.appendChild(makeTable(i, i + ''));
    dom.keycard.appendChild(res);
  }
}
