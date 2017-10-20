const dom = {};

window.onload = function () {
    dom.key = document.getElementById("key");
    dom.keycard = document.getElementById("keycardData");
};

function toHex(n) {
    if (n < 16) return '0' + n.toString(16);
    return n.toString(16);
}

function arrayToHex(arr) {
    let tmp = '';
    for (let i = 0; i < arr.length; i++) {
        tmp += toHex(arr[i]);
    }
    return tmp;
}

function arrayFromHex(str) {
    let buf = new Uint8Array(str.length / 2);
    for (let i = 0; i < str.length; i++) {
        buf[i] = parseInt(str.substr(i * 2, 2), 16);
    }
    return buf;
}

/**
 * @param {Uint8Array} keycardKey
 * @return {Uint8Array}
 */
function getKeycardData(keycardKey) {
    let tmp = '', i;
    for (i = 0; i < 0x50; i++) {
        tmp += toHex(i);
    }
    const cipher = new JSUCrypt.cipher.DES(JSUCrypt.padder.None, JSUCrypt.cipher.MODE_CBC);
    cipher.init(new JSUCrypt.key.DESKey(Array.from(keycardKey)), JSUCrypt.cipher.MODE_ENCRYPT);
    let keycardData = cipher.finalize(tmp);
    tmp = new Uint8Array(0x50);
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
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);

    dom.key.value = arrayToHex(array);

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

    key = arrayFromHex(key);

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