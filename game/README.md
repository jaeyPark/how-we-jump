# IN A MINUTE - BGM: HOW WE RISE - PLAY

IN A MINUTE의 첫 번째 EP 앨범을 홍보하기 위한 인터랙티브 팬 경험 게임입니다.

## 🎮 게임 소개

- **장르**: 수직 픽셀 아트 웹 미니게임
- **플랫폼**: 모바일 및 PC 웹 브라우저
- **게임 시간**: 평균 1분
- **컨트롤**: 좌우 이동만 (자동 점프)

## 🎯 게임 목표

Doodle Jump에서 영감을 받은 간단한 수직 점프 게임으로, 캐릭터가 자동으로 점프하며 플랫폼을 타고 올라가는 게임입니다.

## 🎨 게임 특징

- **3가지 캐릭터**: JT (코알라), HY (말티즈), JJ (곰)
- **픽셀 아트 스타일**: 레트로 게임 미학
- **반응형 디자인**: 모바일과 PC 모두 지원
- **공유 기능**: 점수를 소셜 미디어에 공유 가능

## 🚀 설치 및 실행

### 필수 요구사항
- Node.js v20 이상
- npm 또는 yarn

### 설치
```bash
# Node.js 버전 설정
nvm use 20

# 의존성 설치
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### 미리보기
```bash
npm run preview
```

## 🌐 배포

### Render 배포
이 프로젝트는 Render를 통해 배포됩니다.

1. Render 계정 생성 및 로그인
2. GitHub 저장소 연결
3. 새 Static Site 서비스 생성
4. 다음 설정 사용:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Node.js Version**: 20

### 로컬 배포 테스트
```bash
npm run build
npm run preview
```

## 🎮 게임 플레이

1. **시작 화면**: PLAY 버튼 클릭
2. **캐릭터 선택**: 3명 중 1명 선택
3. **게임 플레이**: 
   - 좌우 화살표로 이동
   - 플랫폼을 타고 올라가기
   - 높이에 따른 점수 획득
4. **게임 종료**: 
   - 60초 경과 또는 화면 밖으로 떨어짐
   - 점수 공유 가능

## 🎨 컬러 팔레트

### 그래피티 컬러
- Neon Lime Green: #9FFF5B
- Vivid Purple: #B66DFF
- Sky Cyan: #3CCEFF
- Bright Orange: #FF6F3C
- Hot Pink: #FF5CA2

### 캐릭터 컬러
- **코알라 (JT)**: Soft Gray (#9FA4A9)
- **말티즈 (HY)**: White (#F9F9F9)
- **곰 (JJ)**: Light Brown (#C68958)

## ⚙️ 환경 변수 설정

게임의 난이도와 목표 위치를 조정하려면 프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정할 수 있습니다:

```bash
# 속도 증가율 (기본값: 0.05)
VITE_SPEED_INCREASE_RATE=0.05

# 목표 위치 Y 좌표 (기본값: -2000)
VITE_GOAL_POSITION_Y=-2000

# 목표 위치 너비 (기본값: 360)
VITE_GOAL_POSITION_WIDTH=360

# 목표 위치 높이 (기본값: 100)
VITE_GOAL_POSITION_HEIGHT=100
```

### 환경 변수 설명
- **VITE_SPEED_INCREASE_RATE**: 게임 진행에 따라 속도가 증가하는 비율입니다. 값이 클수록 게임이 더 빨리 어려워집니다.
- **VITE_GOAL_POSITION_Y**: 목표 지점의 Y 좌표입니다. 값이 작을수록 목표가 더 높은 위치에 있습니다.
- **VITE_GOAL_POSITION_WIDTH**: 목표 지점의 너비입니다.
- **VITE_GOAL_POSITION_HEIGHT**: 목표 지점의 높이입니다.

## 📱 기술 스택

- **프론트엔드**: Vue.js 3
- **빌드 도구**: Vite
- **스타일링**: CSS3 (CSS Variables)
- **폰트**: DNFBitBitv2

## 🎵 음악

- **BGM**: HOW WE RISE
- **아티스트**: IN A MINUTE

## 👨‍💻 개발자

- **제작**: INNING
- **기획**: PRD.md 참조

## 📄 라이선스

ISC License

---

**IN A MINUTE - HOW WE RISE** 🎵
