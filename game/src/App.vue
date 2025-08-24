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
          :src="selectedCharacterData.image"
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
      
      <!-- Touch Controls (invisible) -->
      <div class="touch-controls">
        <div class="left-area" @touchstart="moveLeft" @mousedown="moveLeft"></div>
        <div class="right-area" @touchstart="moveRight" @mousedown="moveRight"></div>
      </div>
    </div>
    
    <!-- Game Over Screen -->
    <div v-if="gameState === 'gameOver'" class="game-over-overlay">
      <div class="game-over-panel">
        <h2 class="game-over-title">{{ gameOverMessage }}</h2>
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
        sitImage: '/img/koala-sit.png'
      },
      { 
        id: 'hy', 
        name: 'HY', 
        emoji: '🐶', 
        color: '#F9F9F9',
        image: '/img/dog.png',
        sitImage: '/img/dog-sit.png'
      },
      { 
        id: 'jj', 
        name: 'JJ', 
        emoji: '🐻', 
        color: '#C68958',
        image: '/img/bear.png',
        sitImage: '/img/bear-sit.png'
      }
    ])
    
    // Game Physics
    const character = ref({
      x: 165,
      y: 500,
      velocityY: 0,
      velocityX: 0,
      onGround: false
    })
    
    const platforms = ref([])
    const gameLoop = ref(null)
    const keys = ref({})
    const gameSpeed = ref(0.3) // 게임 속도
    const maxSpeed = 2.5 // 최대 속도
    const speedIncreaseRate = 0.002 // 속도 증가율
    
    // Computed
    const selectedCharacterData = computed(() => {
      return characters.value.find(char => char.id === selectedCharacter.value)
    })
    
    const gameOverMessage = computed(() => {
      return gameTime.value >= 60 ? 'THIS IS\nHOW WE DO!' : 'GAME OVER'
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
      gameTime.value = 0
      gameStartTime.value = Date.now()
      gameSpeed.value = 0.3 // 게임 속도 초기화
      
      // Reset character position
      character.value = {
        x: 165,
        y: 450,
        velocityY: 0,
        velocityX: 0,
        onGround: false
      }
      
      // Generate initial platforms
      generatePlatforms()
      
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
      
      // 초기 플랫폼들 생성 (기존과 동일하게 8개)
      for (let i = 0; i < 8; i++) {
        platforms.value.push({
          id: i + 1,
          x: Math.random() * (360 - 100), // 기존과 동일한 x 범위
          y: 500 - i * 80, // 기존과 동일한 간격
          width: 100,
          height: 20
        })
      }
    }
    
    const createNewPlatform = () => {
      const newPlatform = {
        id: Date.now(),
        x: Math.random() * (360 - 100), // 기존과 동일한 x 범위
        y: -20, // 기존과 동일한 시작 위치
        width: 100,
        height: 20
      }
      platforms.value.push(newPlatform)
    }
    
    const updatePlatforms = () => {
      // 플랫폼들을 아래로 이동
      platforms.value.forEach(platform => {
        platform.y += gameSpeed.value
      })
      
      // 화면 밖으로 나간 플랫폼 제거
      platforms.value = platforms.value.filter(platform => platform.y < 700)
      
      // 새 플랫폼 생성 (기존과 동일하게 8개 유지)
      if (platforms.value.length < 8) {
        createNewPlatform()
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
      
      // Update score (based on time survived)
      score.value = Math.floor(gameTime.value * 10)
      
      // Speed increase every 10 seconds
      if (Math.floor(gameTime.value) % 10 === 0 && gameTime.value > 0 && gameSpeed.value < maxSpeed) {
        gameSpeed.value += speedIncreaseRate
      }
      
      // Check game over conditions
      if (character.value.y > 640 || gameTime.value >= 60) {
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
        if (character.value.x < platform.x + platform.width &&
            character.value.x + 40 > platform.x &&
            character.value.y + 40 > platform.y &&
            character.value.y + 40 < platform.y + platform.height + 10 &&
            character.value.velocityY > 0) {
          
          character.value.y = platform.y - 40
          character.value.velocityY = -10 // Jump (더 낮은 점프)
          character.value.onGround = true
          console.log('캐릭터 착지! onGround = true')
        }
      })
      
      // 디버깅: onGround 상태 로그
      if (character.value.onGround) {
        console.log('캐릭터 상태: 서있음 (onGround = true)')
      } else {
        console.log('캐릭터 상태: 점프중 (onGround = false)')
      }
      
      // Screen boundaries (wrap around)
      if (character.value.x < -30) character.value.x = 330
      if (character.value.x > 330) character.value.x = -30
    }
    
    const moveLeft = () => {
      character.value.velocityX = -5
    }
    
    const moveRight = () => {
      character.value.velocityX = 5
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
    
    // Lifecycle
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
      gameOverMessage,
      startCharacterSelect,
      selectCharacter,
      startGame,
      moveLeft,
      moveRight,
      restartGame,
      shareScore
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
