<template>
  <div class="game-container">
    <div class="brick-background"></div>
    
    <!-- Start Screen -->
    <div v-if="gameState === 'start'" class="start-screen">
      <div class="start-content">
        <h1 class="game-title">IN A MINUTE</h1>
        <h2 class="game-subtitle">BGM: HOW WE RISE</h2>
        <p class="game-text">- PLAY</p>
        <p class="game-text press-play">PRESS PLAY</p>
        <button class="game-button play-button" @click="startCharacterSelect">PLAY</button>
        <p class="game-text credits">MADE BY INNING</p>
      </div>
    </div>
    
    <!-- Character Select Screen -->
    <div v-if="gameState === 'characterSelect'" class="character-select-screen">
      <div class="character-select-content">
        <h2 class="character-select-title">캐릭터를 선택하세요!</h2>
        <div class="character-grid">
          <div 
            v-for="char in characters" 
            :key="char.id"
            class="character-option"
            :class="{ selected: selectedCharacter === char.id }"
            @click="selectCharacter(char.id)"
          >
            <div class="character-avatar" :style="{ background: char.color }">
              {{ char.emoji }}
            </div>
            <p class="character-name">{{ char.name }}</p>
          </div>
        </div>
        <button class="game-button start-button" @click="startGame">START</button>
      </div>
    </div>
    
    <!-- Game Screen -->
    <div v-if="gameState === 'playing'" class="game-screen">
      <!-- Score Display -->
      <div class="score-display">
        <div>점수: {{ score }}</div>
        <div>시간: {{ Math.floor(gameTime) }}s</div>
      </div>
      
      <!-- Character -->
      <div 
        class="character"
        :style="{
          left: character.x + 'px',
          top: character.y + 'px'
        }"
      >
        <img 
          :src="currentCharacterImage"
          :alt="selectedCharacterData.name"
          class="character-sprite"
        />
      </div>
      
      <!-- Platforms -->
      <div 
        v-for="platform in platforms" 
        :key="platform.id"
        class="platform"
        :style="{
          left: platform.x + 'px',
          top: platform.y + 'px',
          width: platform.width + 'px',
          height: platform.height + 'px'
        }"
      >
        <img 
          src="/img/brick.png"
          alt="brick platform"
          class="platform-sprite"
        />
      </div>
      
      <!-- Items -->
      <div 
        v-for="item in items" 
        :key="item.id"
        class="item"
        :style="{
          left: item.x + 'px',
          top: item.y + 'px',
          width: item.width + 'px',
          height: item.height + 'px'
        }"
      >
        <img 
          :src="item.type === 'inning' ? '/img/inning.png' : '/img/heart.png'"
          :alt="item.type"
          class="item-sprite"
        />
      </div>
      
      <!-- 5ive Effect -->
      <div 
        v-if="showFiveEffect"
        class="five-effect"
        :style="{
          left: fiveEffectPosition.x + 'px',
          top: fiveEffectPosition.y + 'px'
        }"
      >
        <img 
          src="/img/5ive.png"
          alt="5ive"
          class="five-effect-sprite"
        />
      </div>
      
      <!-- Goal -->
      <div 
        v-if="!goalReached"
        class="goal"
        :style="{
          left: goalPosition.x + 'px',
          top: goalPosition.y + 'px'
        }"
      >
        <div class="goal-label">GOAL</div>
        <div class="goal-text">R=VD</div>
      </div>
      
      <!-- Touch Controls (invisible) -->
      <div class="touch-controls">
        <div class="left-area" @touchstart="jumpLeft" @mousedown="jumpLeft"></div>
        <div class="right-area" @touchstart="jumpRight" @mousedown="jumpRight"></div>
      </div>
    </div>
    
    <!-- Game Over Screen -->
    <div v-if="gameState === 'gameOver'" class="game-over-overlay">
      <div class="game-over-panel">
        <h2 class="game-over-title">
          <span v-if="goalReached" class="this-is">THIS IS</span>
          <span v-if="goalReached" class="how-we-do">HOW WE DO!</span>
          <span v-else-if="gameTime >= 60" class="time-up">TIME UP!</span>
          <span v-else class="game-over">GAME OVER..</span>
        </h2>
        <p class="game-over-score">점수: {{ score }}</p>
        <p class="game-over-time">시간: {{ Math.floor(gameTime) }}s</p>
        <div class="game-over-buttons">
          <button class="game-button restart-button" @click="restartGame">처음으로</button>
          <button class="game-button share-button" @click="shareScore">공유하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'App',
  setup() {
    // Game State
    const gameState = ref('start')
    const selectedCharacter = ref('jt')
    const score = ref(0)
    const itemScore = ref(0) // 아이템으로 얻은 점수
    const gameTime = ref(0)
    const gameStartTime = ref(0)
    
    // Character Data
    const characters = ref([
      { 
        id: 'jt', 
        name: 'JT', 
        emoji: '🐨', 
        color: '#9FA4A9',
        image: '/img/koala.png',
        imageLeft: '/img/koala-left.png',
        imageRight: '/img/koala.png',
        sitImage: '/img/koala-sit.png'
      },
      { 
        id: 'hy', 
        name: 'HY', 
        emoji: '🐶', 
        color: '#F9F9F9',
        image: '/img/dog.png',
        imageLeft: '/img/dog-left.png',
        imageRight: '/img/dog.png',
        sitImage: '/img/dog-sit.png'
      },
      { 
        id: 'jj', 
        name: 'JJ', 
        emoji: '🐻', 
        color: '#C68958',
        image: '/img/bear.png',
        imageLeft: '/img/bear-left.png',
        imageRight: '/img/bear.png',
        sitImage: '/img/bear-sit.png'
      }
    ])
    
    // Game Physics
    const character = ref({
      x: 165,
      y: 500,
      velocityY: -10,
      velocityX: 0,
      onGround: false,
      direction: 'right' // 'left' 또는 'right'
    })
    
    const platforms = ref([])
    const gameLoop = ref(null)
    const keys = ref({})
    const gameSpeed = ref(0.3) // 게임 속도
    const maxSpeed = 3.0 // 최대 속도 증가
    const speedIncreaseRate = 0.1 // 속도 증가율 증가
    const lastSpeedIncrease = ref(0) // 마지막 속도 증가 시간
    
    // Items
    const items = ref([])
    const showFiveEffect = ref(false)
    const fiveEffectPosition = ref({ x: 0, y: 0 })
    const fiveEffectTimer = ref(0)
    
    // Goal
    const goalReached = ref(false)
    const goalPosition = ref({ x: 130, y: -1000, width: 100, height: 100 })
    
    // Computed
    const selectedCharacterData = computed(() => {
      return characters.value.find(char => char.id === selectedCharacter.value)
    })
    
    const currentCharacterImage = computed(() => {
      const charData = selectedCharacterData.value
      if (!charData) return ''
      
      if (character.value.direction === 'left') {
        return charData.imageLeft || charData.image
      } else {
        return charData.imageRight || charData.image
      }
    })
    
    const gameOverMessage = computed(() => {
      if (goalReached.value) {
        return 'THIS IS\nHOW WE DO!'
      } else if (gameTime.value >= 60) {
        return 'TIME UP!\nGAME OVER'
      } else {
        return 'GAME OVER..'
      }
    })
    
    // Methods
    const startCharacterSelect = () => {
      console.log('Starting character select...')
      gameState.value = 'characterSelect'
    }
    
    const selectCharacter = (charId) => {
      selectedCharacter.value = charId
    }
    
    const startGame = () => {
      console.log('Starting game...')
      gameState.value = 'playing'
      score.value = 0
      itemScore.value = 0 // 아이템 점수 초기화
      gameTime.value = 0
      gameStartTime.value = Date.now()
      gameSpeed.value = 0.3 // 게임 속도 초기화
      lastSpeedIncrease.value = 0 // 속도 증가 타이머 초기화
      
      // Reset character position
      character.value = {
        x: 165,
        y: 450,
        velocityY: 0,
        velocityX: 0,
        onGround: false,
        direction: 'right'
      }
      
      // Generate initial platforms
      generatePlatforms()
      
      // Reset items
      items.value = []
      showFiveEffect.value = false
      
      // Reset goal
      goalReached.value = false
      goalPosition.value = { x: 130, y: -1000, width: 100, height: 100 }
      
      // Start game loop
      startGameLoop()
    }
    
    const generatePlatforms = () => {
      platforms.value = []
      
      // 시작 플랫폼 (더 위쪽으로)
      platforms.value.push({
        id: 0,
        x: 165,
        y: 580,
        width: 100,
        height: 20
      })
      
      // 초기 플랫폼들 생성 (x축 간격을 넓게)
      for (let i = 0; i < 15; i++) {
        const newPlatform = generatePlatformWithSpacing(500 - i * 50)
        platforms.value.push(newPlatform)
      }
    }
    
    const generatePlatformWithSpacing = (y) => {
      // 화면을 3개 영역으로 나누어 플랫폼 배치
      const areaWidth = 120 // 각 영역의 너비
      const areaIndex = Math.floor(Math.random() * 3) // 0, 1, 2 중 하나
      const x = areaIndex * areaWidth + Math.random() * (areaWidth - 100) // 영역 내에서 랜덤 위치
      
      return {
        id: Date.now() + Math.random(),
        x: x,
        y: y,
        width: 100,
        height: 20
      }
    }
    
    const createNewPlatforms = () => {
      // 가장 위에 있는 플랫폼 찾기
      const topPlatform = platforms.value.reduce((top, platform) => 
        platform.y < top.y ? platform : top
      )
      
      // 여러 개의 플랫폼을 한 번에 생성 (x축 간격을 넓게)
      for (let i = 0; i < 3; i++) {
        const newPlatform = generatePlatformWithSpacing(topPlatform.y - 50 - (i * 50))
        platforms.value.push(newPlatform)
        
        // 아이템 생성 (확률적으로)
        if (Math.random() < 0.3) { // 30% 확률로 아이템 생성
          createItemOnPlatform(newPlatform)
        }
      }
    }
    
    const createItemOnPlatform = (platform) => {
      // inning과 heart는 같은 플랫폼에 올 수 없음
      const hasInning = items.value.some(item => 
        item.platformId === platform.id && item.type === 'inning'
      )
      const hasHeart = items.value.some(item => 
        item.platformId === platform.id && item.type === 'heart'
      )
      
      // 이미 아이템이 있는 플랫폼에는 생성하지 않음
      if (hasInning || hasHeart) return
      
      // 아이템 타입 결정 (inning과 heart 비율 조정)
      const itemType = Math.random() < 0.5 ? 'heart' : 'inning'
      
      const newItem = {
        id: Date.now() + Math.random(),
        type: itemType,
        platformId: platform.id,
        x: platform.x + Math.random() * (platform.width - 20), // 플랫폼 위에서 랜덤 위치
        y: platform.y - 20, // 플랫폼 위에 위치
        width: 20,
        height: 20
      }
      
      items.value.push(newItem)
    }
        const updatePlatforms = () => {
      // 플랫폼들을 아래로 이동
      platforms.value.forEach(platform => {
        platform.y += gameSpeed.value
      })
      
      // 화면 밖으로 나간 플랫폼 제거
      platforms.value = platforms.value.filter(platform => platform.y < 700)
      
      // 새 플랫폼 생성 (더 빠른 생성)
      if (platforms.value.length < 15) {
        createNewPlatforms()
      }
    }
    
    const updateItems = () => {
      // 아이템들을 플랫폼과 함께 아래로 이동
      items.value.forEach(item => {
        item.y += gameSpeed.value
      })
      
      // 화면 밖으로 나간 아이템 제거
      items.value = items.value.filter(item => item.y < 700)
    }
    
    const checkItemCollisions = () => {
      items.value.forEach((item, index) => {
        // 캐릭터와 아이템의 충돌 감지
        const xOverlap = character.value.x < item.x + item.width &&
                         character.value.x + 28 > item.x
        const yOverlap = character.value.y < item.y + item.height &&
                         character.value.y + 40 > item.y
        
        if (xOverlap && yOverlap) {
          // 아이템 수집
          if (item.type === 'inning') {
            // 5ive 효과 표시
            showFiveEffect.value = true
            fiveEffectPosition.value = { x: character.value.x, y: character.value.y - 30 }
            fiveEffectTimer.value = 60 // 1초간 표시 (60프레임)
            itemScore.value += 50 // 아이템 점수 증가
            console.log('inning 수집! 아이템 점수:', itemScore.value)
          } else if (item.type === 'heart') {
            itemScore.value += 20 // 아이템 점수 증가
            console.log('heart 수집! 아이템 점수:', itemScore.value)
          }
          
          // 아이템 제거
          items.value.splice(index, 1)
        }
      })
    }
    
    const updateFiveEffect = () => {
      if (showFiveEffect.value) {
        fiveEffectTimer.value--
        if (fiveEffectTimer.value <= 0) {
          showFiveEffect.value = false
        }
      }
    }
    
    const updateGoal = () => {
      // 목표 지점을 플랫폼과 함께 아래로 이동
      goalPosition.value.y += gameSpeed.value
    }
    
    const checkGoalCollision = () => {
      if (goalReached.value) return
      
      // 캐릭터와 목표 지점의 충돌 감지 (더 관대하게)
      const xOverlap = character.value.x < goalPosition.value.x + goalPosition.value.width &&
                       character.value.x + 28 > goalPosition.value.x
      const yOverlap = character.value.y < goalPosition.value.y + goalPosition.value.height &&
                       character.value.y + 40 > goalPosition.value.y
      
      // 디버깅: 충돌 감지 로그
      if (xOverlap && yOverlap) {
        console.log('목표 지점 충돌 감지!')
        console.log('캐릭터 위치:', character.value.x, character.value.y)
        console.log('목표 지점 위치:', goalPosition.value.x, goalPosition.value.y)
        goalReached.value = true
        console.log('목표 지점 도달! 게임 성공!')
        // 성공 시에도 endGame 호출하되, goalReached 상태로 성공 처리
        endGame()
      }
    }
    
    const startGameLoop = () => {
      gameLoop.value = setInterval(() => {
        updateGame()
      }, 16) // ~60 FPS
    }
    
    const updateGame = () => {
      // Update time
      gameTime.value = (Date.now() - gameStartTime.value) / 1000
      
      // Update character physics
      updateCharacterPhysics()
      
      // Update platforms (move down)
      updatePlatforms()
      
      // Update items (move down)
      updateItems()
      checkItemCollisions()
      updateFiveEffect()
      updateGoal()
      checkGoalCollision()
      
      // Update score (based on time survived)
      score.value = Math.floor(gameTime.value * 10) + itemScore.value
      
      // Speed increase - 더 부드럽고 지속적인 속도 증가
      if (gameTime.value > lastSpeedIncrease.value + 5 && gameSpeed.value < maxSpeed) {
        gameSpeed.value += speedIncreaseRate
        lastSpeedIncrease.value = gameTime.value
        console.log('속도 증가:', gameSpeed.value.toFixed(3))
      }
      
      // Check game over conditions
      if (character.value.y > 640) {
        endGame()
      }
      
      // 시간 초과 체크 (1분)
      if (gameTime.value >= 60 && !goalReached.value) {
        endGame()
      }
    }
    
    const updateCharacterPhysics = () => {
      // Apply gravity
      character.value.velocityY += 0.6 // 중력 감소 (더 부드러운 점프)
      
      // Update position
      character.value.y += character.value.velocityY
      character.value.x += character.value.velocityX
      
      // Apply friction
      character.value.velocityX *= 0.9
      
      // Check platform collisions
      character.value.onGround = false
      platforms.value.forEach(platform => {
        // 캐릭터와 플랫폼의 x축 겹침 확인 (캐릭터 크기 28px로 변경)
        const xOverlap = character.value.x < platform.x + platform.width &&
                         character.value.x + 28 > platform.x
        
        // 캐릭터가 플랫폼 위에서만 착지할 수 있도록 더 엄격한 조건 설정
        const characterBottom = character.value.y + 40
        const characterTop = character.value.y
        const platformTop = platform.y
        const platformBottom = platform.y + platform.height
        
        // 캐릭터가 플랫폼 위에서 착지하는 조건 (더 엄격하게):
        // 1. 캐릭터의 발이 플랫폼 위에 있어야 함 (더 정확한 범위)
        // 2. 캐릭터가 아래로 떨어지는 중이어야 함
        // 3. 캐릭터의 머리가 플랫폼보다 위에 있어야 함
        // 4. 캐릭터가 플랫폼의 중간에 닿지 않도록 더 엄격한 조건
        const isLandingOnTop = characterBottom >= platformTop &&
                               characterBottom <= platformTop + 8 && // 더 정확한 범위
                               characterTop < platformTop &&
                               character.value.velocityY > 0 &&
                               character.value.y + 40 > platformTop // 캐릭터 발이 플랫폼 위에 있어야 함
        
        if (xOverlap && isLandingOnTop) {
          character.value.y = platformTop - 40
          character.value.velocityY = 0
          character.value.onGround = true
        //   console.log('캐릭터 착지! onGround = true')
        }
      })
      
      // 디버깅: onGround 상태 로그
      if (character.value.onGround) {
        // console.log('캐릭터 상태: 서있음 (onGround = true)')
      } else {
        // console.log('캐릭터 상태: 점프중 (onGround = false)')
      }
      
      // Screen boundaries (wrap around for x-axis, limit for y-axis) - 캐릭터 크기 28px 고려
      if (character.value.x < -28) character.value.x = 332
      if (character.value.x > 332) character.value.x = -28
      
      // 캐릭터가 화면 위로 너무 올라가지 않도록 제한 (발 부분 기준)
      if (character.value.y + 40 < 50) { // 캐릭터 발 부분이 화면 위에 닿으면
        character.value.y = 10 // 발이 50에 위치하도록 조정 (50 - 40 = 10)
        character.value.velocityY = Math.max(character.value.velocityY, 0) // 위쪽 속도 제거
      }
    }
    
    const moveLeft = () => {
      character.value.velocityX = -5
      character.value.direction = 'left'
    }
    
    const moveRight = () => {
      character.value.velocityX = 5
      character.value.direction = 'right'
    }
    
    const jump = () => {
      // 점프 (플랫폼에 있을 때만)
      if (character.value.onGround) {
        character.value.velocityY = -10
        character.value.onGround = false
      }
    }
    
    const jumpLeft = () => {
      // 왼쪽으로 점프
      if (character.value.onGround) {
        character.value.velocityY = -10
        character.value.velocityX = -5
        character.value.direction = 'left'
        character.value.onGround = false
      }
    }
    
    const jumpRight = () => {
      // 오른쪽으로 점프
      if (character.value.onGround) {
        character.value.velocityY = -10
        character.value.velocityX = 5
        character.value.direction = 'right'
        character.value.onGround = false
      }
    }
    

    
    const endGame = () => {
      gameState.value = 'gameOver'
      clearInterval(gameLoop.value)
    }
    
    const restartGame = () => {
      gameState.value = 'start'
    }
    
    const shareScore = () => {
      const text = `IN A MINUTE 게임에서 ${score.value}점을 획득했습니다! 🎮`
      if (navigator.share) {
        navigator.share({
          title: 'IN A MINUTE - HOW WE RISE',
          text: text,
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text)
        alert('점수가 클립보드에 복사되었습니다!')
      }
    }
    
    // Keyboard event handlers
    const handleKeyDown = (e) => {
      if (gameState.value !== 'playing') return
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveLeft()
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveRight()
          break
        case ' ':
        case 'ArrowUp':
        case 'w':
        case 'W':
          jump()
          break
      }
    }
    
    const handleKeyUp = (e) => {
      // 키를 떼면 속도 감소
      if (gameState.value !== 'playing') return
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'ArrowRight':
        case 'd':
        case 'D':
          character.value.velocityX *= 0.5
          break
      }
    }
    
    // Lifecycle
    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)
    })
    
    onUnmounted(() => {
      if (gameLoop.value) {
        clearInterval(gameLoop.value)
      }
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    })
    
    return {
      gameState,
      selectedCharacter,
      score,
      gameTime,
      characters,
      character,
      platforms,
      gameSpeed,
      selectedCharacterData,
      currentCharacterImage,
      gameOverMessage,
      items,
      showFiveEffect,
      fiveEffectPosition,
      goalReached,
      goalPosition,
      itemScore,
      startCharacterSelect,
      selectCharacter,
      startGame,
      moveLeft,
      moveRight,
      jump,
      jumpLeft,
      jumpRight,
      restartGame,
      shareScore,
      gameSpeed
    }
  }
}
</script>

<style scoped>
.game-screen {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
