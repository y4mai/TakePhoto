async function main() {
    try {
        const video = document.querySelector('#video')
        const button = document.querySelector('#button')
        const image = document.querySelector('#image')
        const countdownDisplay = document.querySelector('#countdown')
        const photoCountDisplay = document.querySelector('#photoCount')

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 640,
                facingMode: "environment",
                whiteBalanceMode: 'incandescent',  // 一部ブラウザでは無効
                exposureMode: 'none',
            },
            audio: false,
        })

        video.srcObject = stream

        const [track] = stream.getVideoTracks()
        const settings = track.getSettings()
        const {width, height} = settings

        let photoCount = 1
        let intervalId = null
        let countdownId = null
        let isRunning = false
        let secondsRemaining = 0

        // 撮影処理を関数化
        function capturePhoto() {
            const canvas = document.createElement('canvas')
            canvas.setAttribute('width', width)
            canvas.setAttribute('height', height)

            const context = canvas.getContext('2d')
            context.drawImage(video, 0, 0, width, height)

            const dataUrl = canvas.toDataURL('image/jpeg')
            image.setAttribute('src', dataUrl)

            // 日時の取得とフォーマット
            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0')
            const day = String(now.getDate()).padStart(2, '0')

            const dateTime = `${year}${month}${day}`
            const number = String(photoCount).padStart(2, '0')
            
            // ダウンロード
            const link = document.createElement('a')
            link.download = `${dateTime}_No${number}.jpg`
            link.href = dataUrl
            link.click()

            photoCount++
            photoCountDisplay.textContent = photoCount - 1
        }

        // カウントダウン表示更新
        function updateCountdown() {
            if (secondsRemaining > 0) {
                countdownDisplay.textContent = `次の撮影まで: ${secondsRemaining}秒`
                secondsRemaining--
            } else {
                countdownDisplay.textContent = '撮影中...'
            }
        }

        // 自動撮影開始
        function startAutoCapture() {
            isRunning = true
            button.textContent = '撮影停止'
            button.classList.add('active')

            // 最初の撮影を即座に実行
            capturePhoto()
            secondsRemaining = 10

            // 10秒ごとに撮影
            intervalId = setInterval(() => {
                capturePhoto()
                secondsRemaining = 10
            }, 10000)

            // 1秒ごとにカウントダウン更新
            countdownId = setInterval(updateCountdown, 1000)
            updateCountdown()
        }

        // 自動撮影停止
        function stopAutoCapture() {
            isRunning = false
            button.textContent = '撮影開始'
            button.classList.remove('active')
            
            if (intervalId) {
                clearInterval(intervalId)
                intervalId = null
            }
            
            if (countdownId) {
                clearInterval(countdownId)
                countdownId = null
            }
            
            countdownDisplay.textContent = ''
        }

        // ボタンクリックイベント
        button.addEventListener('click', event => {
            if (isRunning) {
                stopAutoCapture()
            } else {
                startAutoCapture()
            }
        })

    } catch (err) {
        console.error(err)
        alert('カメラへのアクセスに失敗しました: ' + err.message)
    }
}

main()