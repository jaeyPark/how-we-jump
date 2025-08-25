// 게임 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const highScoreElement = document.getElementById('highScore');

// 게임 오버 UI
const gameOverUI = document.getElementById('gameOverUI');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverScore = document.getElementById('gameOverScore');
const restartButton = document.getElementById('restartButton');
const shareButton = document.getElementById('shareButton');

// 이미지 로딩
const wallBackground = new Image();
wallBackground.src = 'assets/brickwall.png';

const graffiti1 = new Image();
graffiti1.src = 'assets/graffiti1.png';

const graffiti2 = new Image();
graffiti2.src = 'assets/graffiti2.png';

// 그래피티 배열
const graffitiImages = [graffiti1, graffiti2];

// 그래피티 객체 배열
let graffitiObjects = [];

// 이미지 로딩 완료 확인
let imagesLoaded = 0;
const totalImages = 3;

wallBackground.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        console.log('모든 이미지 로딩 완료!');
    }
};

wallBackground.onerror = () => {
    console.error('벽돌벽 이미지 로딩 실패');
};

graffiti1.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        console.log('모든 이미지 로딩 완료!');
    }
};

graffiti1.onerror = () => {
    console.error('그래피티1 이미지 로딩 실패');
};

graffiti2.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        console.log('모든 이미지 로딩 완료!');
    }
};

graffiti2.onerror = () => {
    console.error('그래피티2 이미지 로딩 실패');
};

// 게임 상태
let gameRunning = false; // 초기에는 게임이 실행되지 않음
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let gameTime = 60; // 60초 제한시간
let timeLeft = gameTime;
let highScore = localStorage.getItem('doodleJumpHighScore') || 0;
highScoreElement.textContent = highScore;

// 게임 속도 설정
let gameSpeed = 0.3; // 초기 속도 (1에서 0.3으로 감소)
const maxSpeed = 2.5; // 최대 속도 (3에서 2.5로 감소)
const speedIncreaseRate = 0.002; // 속도 증가율 (0.005에서 0.002로 감소)

// 선택된 캐릭터
let selectedCharacter = 'koala'; // 기본값

// 캐릭터 색상 정의
const characterColors = {
    koala: {
        body: '#9FA4A9',      // Soft Gray
        face: '#6B6E70',      // Dark Gray
        ear: '#F4A7C3',       // Ear Pink
        highlight: '#E8E8E8'  // Light highlight
    },
    dog: {
        body: '#F9F9F9',      // White
        face: '#D9D9D9',      // Shadow Gray
        ear: '#6CCFFF',       // Accent Sky Blue
        highlight: '#FFFFFF'  // Pure white
    },
    bear: {
        body: '#C68958',      // Light Brown
        face: '#8B5A2B',      // Dark Brown
        ear: '#EBC8A0',       // Highlight Beige
        highlight: '#D4A574'  // Lighter brown
    }
};

// 플레이어 설정
const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 40,
    height: 40,
    velocityY: 0,
    velocityX: 0,
    gravity: 0.3, // 중력 감소 (0.8에서 0.6으로)
    jumpPower: -10, // 점프력 감소 (-15에서 -12로)
    speed: 3, // 이동 속도 감소 (5에서 3으로)
    onPlatform: false // 플랫폼 착지 상태
};

// 플랫폼 배열
let platforms = [];

// 아이템 배열
let items = [];

// 장애물 배열
let obstacles = [];

// 콤보 시스템
let combo = 0;
let comboMultiplier = 1;

// 목표지점 시스템
let goalPosition = {
    y: -2000,  // 게임 시작점에서 2000픽셀 위
    height: 100,
    reached: false
};

// 초기 플랫폼 생성
function createInitialPlatforms() {
    platforms = [];
    items = [];
    obstacles = [];
    graffitiObjects = [];
    
    // 목표지점 상태 초기화
    goalPosition.reached = false;

    // 시작 플랫폼
    platforms.push({
        x: canvas.width / 2 - 50,
        y: canvas.height - 50,
        width: 100,
        height: 20
    });

    // 초기 플랫폼들 생성
    for (let i = 0; i < 8; i++) {
        const newPlatform = {
            x: Math.random() * (canvas.width - 100),
            y: canvas.height - 150 - i * 80,
            width: 100,
            height: 20
        };

        platforms.push(newPlatform);

        // 초기 플랫폼에도 60% 확률로 아이템 생성
        if (Math.random() < 0.6) {
            const rand = Math.random();
            let itemType;

            if (rand < 0.1) {
                itemType = 'clover';
            } else if (rand < 0.55) {
                itemType = 'star';
            } else {
                itemType = 'music';
            }

            items.push({
                x: newPlatform.x + Math.random() * (newPlatform.width - 30),
                y: newPlatform.y - 30,
                width: 30,
                height: 30,
                type: itemType
            });
        }
    }

    // 초기 그래피티 생성
    createInitialGraffiti();
}

// 초기 그래피티 생성
function createInitialGraffiti() {
    graffitiObjects = [];
    const numGraffiti = 4; // 초기 그래피티 개수 줄임

    for (let i = 0; i < numGraffiti; i++) {
        const randomGraffiti = graffitiImages[Math.floor(Math.random() * graffitiImages.length)];
        const graffitiWidth = randomGraffiti.naturalWidth * 0.15; // 15% 크기로 축소
        const graffitiHeight = randomGraffiti.naturalHeight * 0.15; // 15% 크기로 축소

        // 겹치지 않는 위치 찾기
        let x, y;
        let attempts = 0;
        const maxAttempts = 50;

        do {
            x = Math.random() * (canvas.width - graffitiWidth);
            y = Math.random() * canvas.height;
            attempts++;
        } while ((isGraffitiOverlapping(x, y, graffitiWidth, graffitiHeight) || isNearPlatform(x, y, graffitiWidth, graffitiHeight)) && attempts < maxAttempts);

        graffitiObjects.push({
            x: x,
            y: y,
            width: graffitiWidth,
            height: graffitiHeight,
            image: randomGraffiti
        });
    }
}

// 새 그래피티 생성
function createNewGraffiti() {
    const randomGraffiti = graffitiImages[Math.floor(Math.random() * graffitiImages.length)];
    const graffitiWidth = randomGraffiti.naturalWidth * 0.15; // 15% 크기로 축소
    const graffitiHeight = randomGraffiti.naturalHeight * 0.15; // 15% 크기로 축소

    // 겹치지 않는 위치 찾기
    let x;
    let attempts = 0;
    const maxAttempts = 50;

    do {
        x = Math.random() * (canvas.width - graffitiWidth);
        attempts++;
    } while ((isGraffitiOverlapping(x, -graffitiHeight, graffitiWidth, graffitiHeight) || isNearPlatform(x, -graffitiHeight, graffitiWidth, graffitiHeight)) && attempts < maxAttempts);

    graffitiObjects.push({
        x: x,
        y: -graffitiHeight, // 화면 위에서 시작
        width: graffitiWidth,
        height: graffitiHeight,
        image: randomGraffiti
    });
}

// 그래피티 겹침 확인 함수
function isGraffitiOverlapping(x, y, width, height) {
    const margin = 30; // 그래피티 간 최소 거리 증가

    for (let graffiti of graffitiObjects) {
        const distanceX = Math.abs(x - graffiti.x);
        const distanceY = Math.abs(y - graffiti.y);

        if (distanceX < (width + graffiti.width) / 2 + margin &&
            distanceY < (height + graffiti.height) / 2 + margin) {
            return true; // 겹침
        }
    }
    return false; // 겹치지 않음
}

// 플랫폼 근처 확인 함수
function isNearPlatform(x, y, width, height) {
    const margin = 50; // 플랫폼과의 최소 거리

    for (let platform of platforms) {
        const distanceX = Math.abs(x - platform.x);
        const distanceY = Math.abs(y - platform.y);

        if (distanceX < (width + platform.width) / 2 + margin &&
            distanceY < (height + platform.height) / 2 + margin) {
            return true; // 플랫폼 근처
        }
    }
    return false; // 플랫폼과 충분히 떨어짐
}

// 새 플랫폼 생성
function createNewPlatform() {
    const newPlatform = {
        x: Math.random() * (canvas.width - 100),
        y: -20,
        width: 100,
        height: 20
    };

    platforms.push(newPlatform);

    // 플랫폼 생성 시 60% 확률로 아이템도 생성
    if (Math.random() < 0.6) {
        // 기존 아이템들과의 거리 확인
        const minDistance = 60; // 최소 거리
        let canPlaceItem = true;

        for (let item of items) {
            const distance = Math.abs(item.y - newPlatform.y);
            if (distance < minDistance) {
                canPlaceItem = false;
                break;
            }
        }

        if (canPlaceItem) {
            // 클로버는 10% 확률, 나머지는 45%씩
            const rand = Math.random();
            let itemType;

            if (rand < 0.1) {
                itemType = 'clover'; // 10% 확률
            } else if (rand < 0.55) {
                itemType = 'star'; // 45% 확률
            } else {
                itemType = 'music'; // 45% 확률
            }

            // 플랫폼 위에 아이템 배치
            items.push({
                x: newPlatform.x + Math.random() * (newPlatform.width - 30),
                y: newPlatform.y - 30, // 플랫폼 바로 위
                width: 30,
                height: 30,
                type: itemType
            });
        }
    }
}

// 장애물 생성
function createObstacle() {
    const obstacleTypes = ['paint', 'trash', 'spray'];
    const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

    // 하늘에서 떨어지는 장애물
    obstacles.push({
        x: Math.random() * (canvas.width - 40),
        y: -40, // 화면 위에서 시작
        width: 40,
        height: 40,
        type: randomType,
        velocityY: 2 + Math.random() * 3 // 떨어지는 속도 (2-5)
    });
}

// 키보드 입력 처리
const keys = {};
document.addEventListener('keydown', (e) => {
    // 스페이스바 스크롤 방지
    if (e.code === 'Space') {
        e.preventDefault();
    }
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 터치/마우스 입력 처리
let touchStartX = 0;
let touchStartY = 0;
let isTouching = false;

// 터치 이벤트
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isTouching = true;

    // 점프 (화면 터치 시)
    if (player.onPlatform) {
        player.velocityY = player.jumpPower;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isTouching) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;

    // 좌우 이동 (터치 드래그)
    if (Math.abs(deltaX) > 10) {
        if (deltaX > 0) {
            player.velocityX = player.speed;
        } else {
            player.velocityX = -player.speed;
        }
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isTouching = false;
    player.velocityX *= 0.5; // 터치 종료 시 속도 감소
});

// 마우스 이벤트 (데스크톱에서도 터치처럼 사용 가능)
canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    touchStartX = e.clientX;
    touchStartY = e.clientY;
    isTouching = true;

    // 점프 (마우스 클릭 시)
    if (player.onPlatform) {
        player.velocityY = player.jumpPower;
    }
});

canvas.addEventListener('mousemove', (e) => {
    e.preventDefault();
    if (!isTouching) return;

    const deltaX = e.clientX - touchStartX;

    // 좌우 이동 (마우스 드래그)
    if (Math.abs(deltaX) > 10) {
        if (deltaX > 0) {
            player.velocityX = player.speed;
        } else {
            player.velocityX = -player.speed;
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    e.preventDefault();
    isTouching = false;
    player.velocityX *= 0.5; // 마우스 릴리즈 시 속도 감소
});

// 캐릭터 선택 이벤트 리스너
document.querySelectorAll('.character-option').forEach(option => {
    option.addEventListener('click', () => {
        // 기존 선택 해제
        document.querySelectorAll('.character-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // 새 선택 표시
        option.classList.add('selected');
        selectedCharacter = option.dataset.character;
    });
});



// 재시작 버튼 이벤트
restartButton.addEventListener('click', restartGame);

// 공유 버튼 이벤트
shareButton.addEventListener('click', shareScore);

// 캔버스 클릭 이벤트
canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('touchstart', handleCanvasClick);

console.log('캔버스 클릭 이벤트 등록됨');

// 캔버스 클릭 처리
function handleCanvasClick(e) {
    e.preventDefault(); // 기본 동작 방지

    const rect = canvas.getBoundingClientRect();
    let x, y;

    // 터치 이벤트와 마우스 이벤트 구분
    if (e.type === 'touchstart') {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }

    console.log('클릭 위치:', x, y, '게임 상태:', gameState);

    if (gameState === 'start') {
        // PLAY 버튼 클릭 확인 (영역을 더 크게)
        if (x >= canvas.width / 2 - 80 && x <= canvas.width / 2 + 80 &&
            y >= canvas.height / 2 + 20 && y <= canvas.height / 2 + 80) {
            console.log('PLAY 버튼 클릭됨!');
            gameState = 'characterSelect';
        }
    } else if (gameState === 'characterSelect') {
        // 캐릭터 선택 확인
        const characters = [
            { x: canvas.width / 2 - 80, character: 'koala' },
            { x: canvas.width / 2, character: 'dog' },
            { x: canvas.width / 2 + 80, character: 'bear' }
        ];

        characters.forEach(char => {
            if (x >= char.x - 30 && x <= char.x + 30 &&
                y >= 170 && y <= 250) {
                console.log('캐릭터 선택됨:', char.character);
                selectedCharacter = char.character;
            }
        });

        // 게임 시작 버튼 클릭 확인
        if (x >= canvas.width / 2 - 80 && x <= canvas.width / 2 + 80 &&
            y >= canvas.height - 100 && y <= canvas.height - 60) {
            console.log('게임 시작 버튼 클릭됨!');
            startGame();
        }
    }
}

// 게임 시작 함수
function startGame() {
    // 게임 상태 초기화
    score = 0;
    combo = 0;
    comboMultiplier = 1;
    timeLeft = gameTime;
    gameSpeed = 0.3; // 속도 초기화 (1에서 0.3으로)

    // 플레이어 위치 초기화
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.velocityY = 0;
    player.velocityX = 0;
    player.onPlatform = false;
    player.invincible = false;

    // 게임 요소들 초기화
    createInitialPlatforms();

    // 게임 상태 설정
    gameRunning = true;
    gameState = 'playing';

    console.log('게임 시작! 플레이어 위치:', player.x, player.y);

    gameLoop();
}

// 플레이어 업데이트
function updatePlayer() {
    // 좌우 이동 (더 부드러운 가속)
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.velocityX = Math.max(player.velocityX - 0.5, -player.speed);
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.velocityX = Math.min(player.velocityX + 0.5, player.speed);
    } else {
        player.velocityX *= 0.9; // 마찰력 증가 (0.8에서 0.9로)
    }

    // 점프 (플랫폼 위에서만)
    if ((keys[' '] || keys['ArrowUp'] || keys['w'] || keys['W']) && player.onPlatform) {
        player.velocityY = player.jumpPower;
    }

    // 중력 적용
    player.velocityY += player.gravity;

    // 위치 업데이트
    player.x += player.velocityX;
    player.y += player.velocityY;

    // 화면 경계 처리 (좌우 래핑)
    if (player.x < -player.width) {
        player.x = canvas.width;
    } else if (player.x > canvas.width) {
        player.x = -player.width;
    }

    // 플랫폼 충돌 검사
    player.onPlatform = false;
    for (let platform of platforms) {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + platform.height + 10 &&
            player.velocityY > 0) {

            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.onPlatform = true;
            break;
        }
    }

    // 게임 오버 체크
    if (player.y > canvas.height) {
        gameOver();
    }

    // 아이템 충돌 검사
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y) {

            // 아이템 효과 적용
            collectItem(item.type);
            items.splice(i, 1);
        }
    }

    // 장애물 충돌 검사
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {

            // 장애물 효과 적용
            hitObstacle(obstacle.type);
            // 장애물 제거
            obstacles.splice(i, 1);
        }
    }
}

// 아이템 수집 효과
function collectItem(type) {
    switch (type) {
        case 'star':
            score += 50 * comboMultiplier;
            combo += 1;
            break;
        case 'music':
            combo += 2;
            score += 30 * comboMultiplier;
            break;
        case 'clover':
            score += 100 * comboMultiplier;
            combo += 3;
            // 보너스 효과: 잠시 무적
            player.invincible = true;
            setTimeout(() => {
                player.invincible = false;
            }, 3000);
            break;
    }

    // 콤보 배수 업데이트
    comboMultiplier = Math.floor(combo / 5) + 1;
}

// 장애물 충돌 효과
function hitObstacle(type) {
    if (player.invincible) return; // 무적 상태면 무시

    switch (type) {
        case 'paint':
            score = Math.max(0, score - 20);
            combo = Math.max(0, combo - 1);
            break;
        case 'trash':
            score = Math.max(0, score - 30);
            combo = 0;
            break;
        case 'spray':
            score = Math.max(0, score - 50);
            combo = 0;
            // 일시적으로 속도 감소
            player.speed = Math.max(2, player.speed - 1);
            setTimeout(() => {
                player.speed = 5;
            }, 2000);
            break;
    }

    comboMultiplier = Math.floor(combo / 5) + 1;
}

// 플랫폼 업데이트
function updatePlatforms() {
    // 플랫폼들을 아래로 이동 (속도에 따라)
    for (let platform of platforms) {
        platform.y += gameSpeed;
    }

    // 화면 밖으로 나간 플랫폼 제거
    platforms = platforms.filter(platform => platform.y < canvas.height + 50);

    // 새 플랫폼 생성
    if (platforms.length < 8) {
        createNewPlatform();
    }
}

// 아이템 업데이트
function updateItems() {
    // 아이템들을 플랫폼과 함께 아래로 이동
    for (let item of items) {
        item.y += gameSpeed;
    }

    // 화면 밖으로 나간 아이템 제거
    items = items.filter(item => item.y < canvas.height + 50);
}

// 장애물 업데이트
function updateObstacles() {
    // 장애물들을 아래로 이동 (각각의 떨어지는 속도 적용)
    for (let obstacle of obstacles) {
        obstacle.y += obstacle.velocityY;
    }

    // 화면 밖으로 나간 장애물 제거
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height + 50);

    // 새 장애물 생성 (확률적으로) - 확률 대폭 감소
    if (Math.random() < 0.0005) { // 0.05% 확률 (0.3%에서 대폭 감소)
        createObstacle();
    }
}

// 그래피티 업데이트
function updateGraffiti() {
    // 그래피티들을 아래로 이동
    for (let graffiti of graffitiObjects) {
        graffiti.y += gameSpeed;
    }

    // 화면 밖으로 나간 그래피티 제거
    graffitiObjects = graffitiObjects.filter(graffiti => graffiti.y < canvas.height + graffiti.height);

    // 새 그래피티 생성 (확률적으로) - 빈도 대폭 감소
    if (Math.random() < 0.001) { // 0.1% 확률 (기존 0.5%에서 감소)
        createNewGraffiti();
    }
}

// 그래피티 그리기
function drawGraffiti() {
    for (let graffiti of graffitiObjects) {
        ctx.drawImage(graffiti.image, graffiti.x, graffiti.y, graffiti.width, graffiti.height);
    }
}

// 게임 오버 처리
function gameOver() {
    gameRunning = false;
    gameState = 'gameOver';

    // 최고점수 업데이트
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('doodleJumpHighScore', highScore);
        highScoreElement.textContent = highScore;
    }

    // 게임 오버 UI 표시
    gameOverUI.classList.remove('hidden');
    gameOverTitle.textContent = '게임 오버!';
    gameOverScore.textContent = `점수: ${score}`;
}

// 목표지점 도달 확인
function checkGoalReached() {
    if (!goalPosition.reached && player.y <= goalPosition.y + goalPosition.height) {
        goalPosition.reached = true;
        gameSuccess();
    }
}

// 게임 성공 처리
function gameSuccess() {
    gameRunning = false;
    gameState = 'gameOver';

    // 최고점수 업데이트
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('doodleJumpHighScore', highScore);
        highScoreElement.textContent = highScore;
    }

    // 성공 UI 표시
    gameOverUI.classList.remove('hidden');
    gameOverTitle.textContent = '목표 달성!';
    gameOverScore.textContent = `성공! 점수: ${score}`;
}

// 시간 초과 처리
function timeUp() {
    gameRunning = false;
    gameState = 'gameOver';

    // 최고점수 업데이트
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('doodleJumpHighScore', highScore);
        highScoreElement.textContent = highScore;
    }

    // 시간 초과 UI 표시
    gameOverUI.classList.remove('hidden');
    gameOverTitle.textContent = '시간 초과!';
    gameOverScore.textContent = `최종 점수: ${score}`;
}

// 게임 재시작 (처음으로)
function restartGame() {
    score = 0;
    combo = 0;
    comboMultiplier = 1;
    timeLeft = gameTime;
    gameSpeed = 0.3; // 속도 초기화 (1에서 0.3으로)
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.velocityY = 0;
    player.velocityX = 0;
    player.onPlatform = false;
    player.invincible = false;
    goalPosition.reached = false; // 목표지점 상태 초기화
    createInitialPlatforms();
    items = [];
    obstacles = [];
    graffitiObjects = []; // 그래피티 초기화
    gameRunning = false; // 게임 중지
    gameState = 'start'; // 시작 화면으로

    // UI 숨김
    gameOverUI.classList.add('hidden');
}

// SNS 공유 기능
function shareScore() {
    const shareText = `나의 점수: ${score}! 두들레이저에서 더 높은 점수를 달성해보세요!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
        navigator.share({
            title: '두들레이저 점수 공유',
            text: shareText,
            url: shareUrl
        })
            .then(() => {
                alert('점수가 공유되었습니다!');
            })
            .catch(error => {
                console.error('공유 실패:', error);
            });
    } else {
        alert('공유 기능을 지원하지 않는 브라우저입니다.');
        // 대신 복사 기능 추가 가능
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('URL이 복사되었습니다!');
    }
}

// 게임 시작
gameLoop();

// 렌더링 함수들
function drawPlayer() {
    const colors = characterColors[selectedCharacter];

    // 무적 상태일 때 반짝이는 효과
    if (player.invincible && Math.floor(Date.now() / 100) % 2) {
        ctx.fillStyle = '#FFD700';
    } else {
        ctx.fillStyle = colors.body;
    }

    // 플레이어 몸체
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 캐릭터별 특별한 특징 그리기
    switch (selectedCharacter) {
        case 'koala':
            // 코알라 귀
            ctx.fillStyle = colors.ear;
            ctx.fillRect(player.x + 5, player.y - 8, 8, 8);
            ctx.fillRect(player.x + 27, player.y - 8, 8, 8);

            // 코알라 얼굴
            ctx.fillStyle = colors.face;
            ctx.fillRect(player.x + 8, player.y + 8, 24, 20);

            // 코알라 코
            ctx.fillStyle = '#333';
            ctx.fillRect(player.x + 18, player.y + 15, 4, 3);

            // 코알라 눈
            ctx.fillStyle = '#333';
            ctx.fillRect(player.x + 12, player.y + 12, 3, 3);
            ctx.fillRect(player.x + 25, player.y + 12, 3, 3);
            break;

        case 'dog':
            // 강아지 귀
            ctx.fillStyle = colors.ear;
            ctx.fillRect(player.x + 3, player.y - 6, 10, 6);
            ctx.fillRect(player.x + 27, player.y - 6, 10, 6);

            // 강아지 얼굴
            ctx.fillStyle = colors.face;
            ctx.fillRect(player.x + 8, player.y + 5, 24, 25);

            // 강아지 코
            ctx.fillStyle = '#333';
            ctx.fillRect(player.x + 18, player.y + 12, 4, 3);

            // 강아지 눈
            ctx.fillStyle = colors.ear;
            ctx.fillRect(player.x + 12, player.y + 10, 4, 4);
            ctx.fillRect(player.x + 24, player.y + 10, 4, 4);

            // 강아지 눈동자
            ctx.fillStyle = '#333';
            ctx.fillRect(player.x + 13, player.y + 11, 2, 2);
            ctx.fillRect(player.x + 25, player.y + 11, 2, 2);
            break;

        case 'bear':
            // 곰 귀
            ctx.fillStyle = colors.ear;
            ctx.fillRect(player.x + 5, player.y - 5, 8, 8);
            ctx.fillRect(player.x + 27, player.y - 5, 8, 8);

            // 곰 얼굴
            ctx.fillStyle = colors.face;
            ctx.fillRect(player.x + 8, player.y + 8, 24, 22);

            // 곰 코
            ctx.fillStyle = '#333';
            ctx.fillRect(player.x + 18, player.y + 15, 4, 3);

            // 곰 눈
            ctx.fillStyle = '#333';
            ctx.fillRect(player.x + 12, player.y + 12, 3, 3);
            ctx.fillRect(player.x + 25, player.y + 12, 3, 3);

            // 곰 입
            ctx.fillStyle = '#333';
            ctx.fillRect(player.x + 16, player.y + 20, 8, 2);
            break;
    }
}

function drawPlatforms() {
    // 벽돌 플랫폼
    for (let platform of platforms) {
        // 플랫폼 기본 색상
        ctx.fillStyle = '#A04D3D'; // Brick Base
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // 플랫폼 하이라이트
        ctx.fillStyle = '#D87B6E'; // Highlight
        ctx.fillRect(platform.x, platform.y, platform.width, 5);

        // 플랫폼 그림자
        ctx.fillStyle = '#5C2A24'; // Edge Shadow
        ctx.fillRect(platform.x, platform.y + platform.height - 3, platform.width, 3);
    }
}

function drawItems() {
    for (let item of items) {
        switch (item.type) {
            case 'star':
                ctx.fillStyle = '#FFD700';
                break;
            case 'music':
                ctx.fillStyle = '#FF69B4';
                break;
            case 'clover':
                ctx.fillStyle = '#32CD32';
                break;
        }

        // 아이템 그리기 (임시로 원형)
        ctx.beginPath();
        ctx.arc(item.x + item.width / 2, item.y + item.height / 2, item.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // 아이템 텍스트
        ctx.fillStyle = 'white';
        ctx.font = '16px DNFBitBitv2';
        ctx.textAlign = 'center';
        switch (item.type) {
            case 'star':
                ctx.fillText('⭐', item.x + item.width / 2, item.y + item.height / 2 + 5);
                break;
            case 'music':
                ctx.fillText('🎵', item.x + item.width / 2, item.y + item.height / 2 + 5);
                break;
            case 'clover':
                ctx.fillText('🍀', item.x + item.width / 2, item.y + item.height / 2 + 5);
                break;
        }
    }
}

function drawObstacles() {
    for (let obstacle of obstacles) {
        switch (obstacle.type) {
            case 'paint':
                ctx.fillStyle = '#FF4500';
                break;
            case 'trash':
                ctx.fillStyle = '#8B4513';
                break;
            case 'spray':
                ctx.fillStyle = '#FF1493';
                break;
        }

        // 장애물 그리기 (임시로 사각형)
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // 장애물 텍스트
        ctx.fillStyle = 'white';
        ctx.font = '16px DNFBitBitv2';
        ctx.textAlign = 'center';
        switch (obstacle.type) {
            case 'paint':
                ctx.fillText('🎨', obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2 + 5);
                break;
            case 'trash':
                ctx.fillText('🗑️', obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2 + 5);
                break;
            case 'spray':
                ctx.fillText('💨', obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2 + 5);
                break;
        }
    }
}

function drawBackground() {
    // 벽돌벽 배경 그리기
    if (wallBackground.complete && wallBackground.naturalWidth > 0) {
        ctx.drawImage(wallBackground, 0, 0, canvas.width, canvas.height);
    } else {
        // 이미지 로딩 실패 시 기존 벽돌 패턴 사용
        ctx.fillStyle = '#7A3B35'; // Deep Brick Red
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 벽돌 패턴 그리기
        ctx.fillStyle = '#9B4842'; // Wine Red
        const brickWidth = 40;
        const brickHeight = 20;

        for (let y = 0; y < canvas.height; y += brickHeight) {
            for (let x = 0; x < canvas.width; x += brickWidth) {
                // 홀수 줄은 오프셋
                const offset = (Math.floor(y / brickHeight) % 2) * (brickWidth / 2);
                ctx.fillRect(x + offset, y, brickWidth - 2, brickHeight - 2);
            }
        }

        // 벽돌 틈 (어두운 부분)
        ctx.fillStyle = '#4A2A27'; // Shadow Brown
        for (let y = 0; y < canvas.height; y += brickHeight) {
            for (let x = 0; x < canvas.width; x += brickWidth) {
                const offset = (Math.floor(y / brickHeight) % 2) * (brickWidth / 2);
                // 세로 틈
                ctx.fillRect(x + offset + brickWidth - 2, y, 2, brickHeight - 2);
                // 가로 틈
                ctx.fillRect(x + offset, y + brickHeight - 2, brickWidth - 2, 2);
            }
        }
    }
}

// 목표지점 그리기
function drawGoal() {
    // 플레이어의 y 위치와 목표지점의 상대적 위치 계산
    const relativeY = goalPosition.y - (canvas.height - 100 - player.y);
    
    // 목표지점이 화면 범위 내에 있을 때만 그리기
    if (relativeY >= -goalPosition.height && relativeY <= canvas.height) {
        // 목표지점 배경 (밝은 금색)
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.fillRect(0, relativeY, canvas.width, goalPosition.height);
        
        // 목표지점 테두리
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, relativeY, canvas.width, goalPosition.height);
        
        // 목표지점 텍스트
        ctx.fillStyle = '#B8860B';
        ctx.font = 'bold 24px DNFBitBitv2';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 목표지점 🎯', canvas.width / 2, relativeY + goalPosition.height / 2 + 8);
        
        // 목표까지 남은 거리 표시
        const distanceToGoal = Math.max(0, Math.ceil((player.y - goalPosition.y) / 100));
        if (distanceToGoal > 0) {
            ctx.fillStyle = 'white';
            ctx.font = '14px DNFBitBitv2';
            ctx.fillText(`목표까지 ${distanceToGoal}m`, canvas.width / 2, relativeY - 10);
        }
    }
}

// 게임 화면 내 점수 표시
function drawGameUI() {
    ctx.font = '16px DNFBitBitv2';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;

    // 점수
    ctx.strokeText(`점수: ${score}`, 10, 30);
    ctx.fillText(`점수: ${score}`, 10, 30);

    // 콤보
    ctx.strokeText(`콤보: ${combo} (x${comboMultiplier})`, 10, 55);
    ctx.fillText(`콤보: ${combo} (x${comboMultiplier})`, 10, 55);

    // 시간
    ctx.strokeText(`시간: ${timeLeft}초`, 10, 80);
    ctx.fillText(`시간: ${timeLeft}초`, 10, 80);
    
    // 목표까지의 거리
    const distanceToGoal = Math.max(0, Math.ceil((player.y - goalPosition.y) / 100));
    if (distanceToGoal > 0) {
        ctx.strokeText(`목표까지: ${distanceToGoal}m`, 10, 105);
        ctx.fillText(`목표까지: ${distanceToGoal}m`, 10, 105);
    } else {
        ctx.strokeText(`목표 도달!`, 10, 105);
        ctx.fillText(`목표 도달!`, 10, 105);
    }

    // 최고점수 (우상단)
    ctx.textAlign = 'right';
    ctx.strokeText(`최고: ${highScore}`, canvas.width - 10, 30);
    ctx.fillText(`최고: ${highScore}`, canvas.width - 10, 30);
    
    // 진행률 바 (우상단)
    const totalDistance = canvas.height - 100 - goalPosition.y; // 전체 거리
    const currentProgress = Math.max(0, Math.min(1, (canvas.height - 100 - player.y) / totalDistance));
    
    // 진행률 바 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(canvas.width - 30, 50, 20, 100);
    
    // 진행률 바 채우기
    ctx.fillStyle = currentProgress >= 1 ? '#00FF00' : '#FFD700';
    const progressHeight = 100 * currentProgress;
    ctx.fillRect(canvas.width - 30, 50 + (100 - progressHeight), 20, progressHeight);
    
    // 진행률 바 테두리
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width - 30, 50, 20, 100);
    
    // 진행률 텍스트
    ctx.font = '12px DNFBitBitv2';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    const progressPercent = Math.floor(currentProgress * 100);
    ctx.strokeText(`${progressPercent}%`, canvas.width - 20, 165);
    ctx.fillText(`${progressPercent}%`, canvas.width - 20, 165);
}

// 시작 화면 그리기
function drawStartScreen() {
    // 벽돌벽 배경
    drawBackground();

    // 반투명 오버레이
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 게임 제목
    ctx.fillStyle = '#FF69B4';
    ctx.font = 'bold 32px DNFBitBitv2';
    ctx.textAlign = 'center';
    ctx.fillText('IN A MINUTE', canvas.width / 2, canvas.height / 2 - 80);

    // BGM 정보
    ctx.fillStyle = '#FFA500';
    ctx.font = '16px DNFBitBitv2';
    ctx.fillText('BGM: HOW WE RISE', canvas.width / 2, canvas.height / 2 - 40);
    
    // 게임 목표 설명
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px DNFBitBitv2';
    ctx.fillText('🎯 1분 안에 목표지점 도달! 🎯', canvas.width / 2, canvas.height / 2 - 15);

    // 깜빡이는 안내 메시지
    const blink = Math.floor(Date.now() / 750) % 2;
    if (blink) {
        ctx.fillStyle = 'white';
        ctx.font = '20px DNFBitBitv2';
        ctx.fillText('PRESS PLAY', canvas.width / 2, canvas.height / 2 + 10);
    }

    // PLAY 버튼
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 30, 120, 40);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px DNFBitBitv2';
    ctx.fillText('PLAY', canvas.width / 2, canvas.height / 2 + 55);

    // 크레딧
    ctx.fillStyle = '#888';
    ctx.font = '12px DNFBitBitv2';
    ctx.fillText('MADE BY INNING', canvas.width / 2, canvas.height - 30);
}

// 캐릭터 선택 화면 그리기
function drawCharacterSelect() {
    // 벽돌벽 배경
    drawBackground();

    // 반투명 오버레이
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 제목
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px DNFBitBitv2';
    ctx.textAlign = 'center';
    ctx.fillText('캐릭터를 선택하세요!', canvas.width / 2, 100);

    // 캐릭터 옵션들
    const characters = [
        { emoji: '🐨', name: '코알라', x: canvas.width / 2 - 80 },
        { emoji: '🐶', name: '강아지', x: canvas.width / 2 },
        { emoji: '🐻', name: '곰', x: canvas.width / 2 + 80 }
    ];

    characters.forEach((char, index) => {
        const isSelected = selectedCharacter === ['koala', 'dog', 'bear'][index];
        const y = 200;

        // 선택된 캐릭터 하이라이트
        if (isSelected) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.fillRect(char.x - 30, y - 30, 60, 80);
        }

        // 캐릭터 이모지
        ctx.font = '40px Arial';
        ctx.fillText(char.emoji, char.x, y);

        // 캐릭터 이름
        ctx.fillStyle = isSelected ? '#FFD700' : 'white';
        ctx.font = '14px DNFBitBitv2';
        ctx.fillText(char.name, char.x, y + 20);
    });

    // 게임 시작 버튼
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(canvas.width / 2 - 80, canvas.height - 100, 160, 40);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px DNFBitBitv2';
    ctx.fillText('게임 시작!', canvas.width / 2, canvas.height - 75);
}

// 메인 게임 루프
function gameLoop() {
    // 게임 상태에 따라 다른 화면 그리기
    if (gameState === 'start') {
        drawStartScreen();
        requestAnimationFrame(gameLoop);
        return;
    } else if (gameState === 'characterSelect') {
        drawCharacterSelect();
        requestAnimationFrame(gameLoop);
        return;
    } else if (gameState === 'gameOver') {
        // 게임 오버 시에도 게임 화면은 계속 그리기
        drawBackground();
        drawPlatforms();
        drawGraffiti();
        drawItems();
        drawObstacles();
        drawGoal(); // 목표지점도 표시
        drawPlayer();
        drawGameUI();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (!gameRunning) return;

    // 화면 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 그리기
    drawBackground();

    // 게임 요소들 업데이트
    updatePlayer();
    updatePlatforms();
    updateItems();
    updateObstacles();
    updateGraffiti();
    
    // 목표지점 도달 확인
    checkGoalReached();

    // 점수 업데이트
    score += 1;

    // 시간 업데이트 (1초마다)
    if (score % 60 === 0) {
        timeLeft--;

        // 시간 초과 체크
        if (timeLeft <= 0) {
            timeUp();
            return;
        }

        // 속도 증가 (10초마다)
        if (timeLeft % 10 === 0 && gameSpeed < maxSpeed) {
            gameSpeed += speedIncreaseRate;
            console.log('속도 증가:', gameSpeed);
        }
    }

    // 렌더링
    drawPlatforms();
    drawGraffiti();
    drawItems();
    drawObstacles();
    drawGoal(); // 목표지점 그리기 추가
    drawPlayer();
    drawGameUI();

    // 다음 프레임 요청
    requestAnimationFrame(gameLoop);
} 