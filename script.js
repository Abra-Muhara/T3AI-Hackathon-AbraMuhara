// Get elements
const video = document.getElementById('webcam');
const captureButton = document.getElementById('capture');
const API_KEY = 'K83070156588957'; // API anahtarınızı buraya koyun

// Set up webcam stream
navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: 'environment' // Arka kamera için 'environment' kullanın
    }
})
.then(stream => {
    video.srcObject = stream;
    video.onloadedmetadata = () => {
        video.play();
    };
})
.catch(error => {
    console.error('Error accessing webcam:', error);
});

// Capture image from video
function captureImage() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0);
    
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Failed to create Blob'));
            }
        }, 'image/png');
    });
}

// Handle capture button click
captureButton.addEventListener('click', () => {
    console.log('Button clicked');
    captureImage().then(blob => {
        const formData = new FormData();
        formData.append('apikey', API_KEY);
        formData.append('file', blob, 'captured_image.png'); // Append the Blob as a file

        fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log(data); // API yanıtını kontrol edin

            if (data.IsErroredOnProcessing) {
                console.error('Error in processing:', data.ErrorMessage);
            } else {
                if (data.ParsedResults && data.ParsedResults.length > 0) {
                    const result = data.ParsedResults[0];
                    let resultText = result.ParsedText || 'No text detected.';
                    resultText = resultText.toLowerCase();
                    if (resultText != "no text detected."){
                      // Speech synthesis
                      const utterance = new SpeechSynthesisUtterance(resultText);
                      utterance.lang = 'tr'; // Set the language to Turkish
                      speechSynthesis.speak(utterance);
                    }else{
                      const utterance = new SpeechSynthesisUtterance("Metin bulunamadı.");
                      utterance.lang = 'tr'; // Set the language to Turkish
                      speechSynthesis.speak(utterance);
                    }
                } else {
                    console.log('No text detected or unexpected response format.');
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }).catch(error => {
        console.error('Error capturing image:', error);
    });
});
