const video = document.getElementById('qr-scanner');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const statusMessage = document.getElementById('status-message');
const stampDron = document.getElementById('stamp-dron');
const stampVr = document.getElementById('stamp-vr');

let isProcessing = false;

// 저장된 스탬프 상태 불러오기
function loadStamps() {
    if (localStorage.getItem('dronStamp') === 'true') {
        stampDron.classList.add('active');
        stampDron.querySelector('.stamp-status').innerText = '획득 완료';
    }
    if (localStorage.getItem('vrStamp') === 'true') {
        stampVr.classList.add('active');
        stampVr.querySelector('.stamp-status').innerText = '획득 완료';
    }
}

// QR 스캐너 초기화
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
        console.error("카메라 접근 오류: ", err);
        loadingMessage.style.display = 'none';
        errorMessage.classList.remove('hidden');
        statusMessage.innerText = "카메라를 사용할 수 없습니다. 브라우저 설정을 확인해주세요.";
    }
}

// 스캔 처리 로직
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

// QR 코드 데이터 처리
function handleQrCode(data) {
    if (data === 'dalseo-dron-stamp') {
        if (localStorage.getItem('dronStamp') !== 'true') {
            localStorage.setItem('dronStamp', 'true');
            statusMessage.innerText = "팝드론 스탬프를 획득했습니다! ??";
            stampDron.classList.add('active');
            stampDron.querySelector('.stamp-status').innerText = '획득 완료';
            checkCompletion();
        } else {
            statusMessage.innerText = "이미 팝드론 스탬프를 획득했습니다.";
        }
    } else if (data === 'dalseo-vr-stamp') {
        if (localStorage.getItem('vrStamp') !== 'true') {
            localStorage.setItem('vrStamp', 'true');
            statusMessage.innerText = "VR 레이싱 스탬프를 획득했습니다! ??";
            stampVr.classList.add('active');
            stampVr.querySelector('.stamp-status').innerText = '획득 완료';
            checkCompletion();
        } else {
            statusMessage.innerText = "이미 VR 레이싱 스탬프를 획득했습니다.";
        }
    } else {
        statusMessage.innerText = "유효하지 않은 QR 코드입니다.";
    }
}

// 모든 스탬프 획득 확인
function checkCompletion() {
    if (localStorage.getItem('dronStamp') === 'true' && localStorage.getItem('vrStamp') === 'true') {
        setTimeout(() => {
            alert('축하합니다! 모든 스탬프를 다 모았습니다! ??');
        }, 500);
    }
}

// 웹앱 시작
window.onload = () => {
    loadStamps();
    startScanner();
};