const video = document.getElementById('qr-scanner');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const statusMessage = document.getElementById('status-message');
const stampDron = document.getElementById('stamp-dron');
const stampVr = document.getElementById('stamp-vr');

let isProcessing = false;

// ����� ������ ���� �ҷ�����
function loadStamps() {
    if (localStorage.getItem('dronStamp') === 'true') {
        stampDron.classList.add('active');
        stampDron.querySelector('.stamp-status').innerText = 'ȹ�� �Ϸ�';
    }
    if (localStorage.getItem('vrStamp') === 'true') {
        stampVr.classList.add('active');
        stampVr.querySelector('.stamp-status').innerText = 'ȹ�� �Ϸ�';
    }
}

// QR ��ĳ�� �ʱ�ȭ
async function startScanner() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.setAttribute('playsinline', true);
        video.play();
        loadingMessage.style.display = 'none';
        errorMessage.classList.add('hidden');
        tick();
    } catch (err) {
        console.error("ī�޶� ���� ����: ", err);
        loadingMessage.style.display = 'none';
        errorMessage.classList.remove('hidden');
        statusMessage.innerText = "ī�޶� ����� �� �����ϴ�. ������ ������ Ȯ�����ּ���.";
    }
}

// ��ĵ ó�� ����
function tick() {
    if (isProcessing || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(tick);
        return;
    }

    isProcessing = true;
    const canvasElement = document.createElement('canvas');
    const canvas = canvasElement.getContext('2d');
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    
    const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
    });

    if (code) {
        handleQrCode(code.data);
    }

    isProcessing = false;
    requestAnimationFrame(tick);
}

// QR �ڵ� ������ ó��
function handleQrCode(data) {
    if (data === 'dalseo-dron-stamp') {
        if (localStorage.getItem('dronStamp') !== 'true') {
            localStorage.setItem('dronStamp', 'true');
            statusMessage.innerText = "�˵�� �������� ȹ���߽��ϴ�! ??";
            stampDron.classList.add('active');
            stampDron.querySelector('.stamp-status').innerText = 'ȹ�� �Ϸ�';
            checkCompletion();
        } else {
            statusMessage.innerText = "�̹� �˵�� �������� ȹ���߽��ϴ�.";
        }
    } else if (data === 'dalseo-vr-stamp') {
        if (localStorage.getItem('vrStamp') !== 'true') {
            localStorage.setItem('vrStamp', 'true');
            statusMessage.innerText = "VR ���̽� �������� ȹ���߽��ϴ�! ??";
            stampVr.classList.add('active');
            stampVr.querySelector('.stamp-status').innerText = 'ȹ�� �Ϸ�';
            checkCompletion();
        } else {
            statusMessage.innerText = "�̹� VR ���̽� �������� ȹ���߽��ϴ�.";
        }
    } else {
        statusMessage.innerText = "��ȿ���� ���� QR �ڵ��Դϴ�.";
    }
}

// ��� ������ ȹ�� Ȯ��
function checkCompletion() {
    if (localStorage.getItem('dronStamp') === 'true' && localStorage.getItem('vrStamp') === 'true') {
        setTimeout(() => {
            alert('�����մϴ�! ��� �������� �� ��ҽ��ϴ�! ??');
        }, 500);
    }
}

// ���� ����
window.onload = () => {
    loadStamps();
    startScanner();
};