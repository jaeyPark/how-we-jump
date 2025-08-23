# PRD.md

## 🎯 Project Overview
- **Title:** IN A MINUTE – BGM: HOW WE RISE – PLAY  
- **Type:** Vertical Pixel-Art Web Mini Game (MVP)  
- **Goal:**  
  - Promote IN A MINUTE's first EP album with an interactive fan experience.  
  - Simple, 1-minute vertical game optimized for mobile and PC.  
  - Shareable gameplay for TikTok/Reels.  

---

## ✨ Concept
- Inspired by **Doodle Jump**, but simplified.  
- Character auto-jumps on every platform.  
- Player only controls **left/right movement**.  
- No items, no obstacles in MVP (pure core loop).  
- End condition: falling out of screen → Game Over.  

---

## 🎮 Gameplay Flow
1. **Start Screen**  
   - Display album title: `BGM: HOW WE RISE – PLAY`  
   - Subtitle: `IN A MINUTE` (top)
   - Credits: `MADE BY INNING` (bottom)
   - Button: `PRESS PLAY` → goes to Character Select.  

2. **Character Select**  
   - Title: `캐릭터를 선택하세요!` (Select a character!)
   - Player chooses 1 of 3 characters:  
     - JT (Koala 🐨) - Grey koala with black eyes
     - HY (Maltese 🐶) - White/brown dog with floppy ears  
     - JJ (Bear 🐻) - Light brown bear with round ears
   - Button: `START` → begins game.  

3. **Game Screen (Playing)**  
   - Character continuously jumps upward on platforms.  
   - Player input:  
     - **Mobile:** Left/Right arrow buttons on screen bottom.  
     - **PC:** Arrow keys (← →).  
   - Score = height climbed (displayed as "점수: XXX").
   - Timer displayed (displayed as "시간: XXs").
   - Platforms: Orange rectangular blocks in staggered pattern.

4. **Game Over / Success Screen**  
   - Display:  
     - Score (points based on height).  
     - Time survived.  
   - Message options:  
     - `"GAME OVER"` (when falling off screen)
     - `"THIS IS HOW WE DO!"` (success / milestone / when 60s passed).  
   - Buttons: `처음으로` (Restart), `공유하기` (Share).
   - Character appears partially behind buttons (koala peeking).

---

## 🎨 Visual Design
- **Art Style:** Pixel art with retro aesthetic
- **Color Palette:**
  - Background: Dark red-brown brick wall pattern
  - UI Panels: Dark brown/black with transparency
  - Buttons: Pink/magenta (`처음으로`), Green (`공유하기`, `START`)
  - Text: White (main text), Orange-gold (titles), Pink (success message)
- **Typography:** Pixelated font throughout
- **Layout:** Vertical 9:16 aspect ratio with black borders on sides

---

## 🧑‍🎨 Assets Needed
- **Characters** (each has 2 states):  
  - Idle (sitting, front-facing)  
  - Jump (mid-air, front-facing)  
- **Platforms** (basic orange rectangular blocks).  
- **UI Elements**:  
  - Buttons (`Play`, `Start`, `처음으로`, `공유하기`).  
  - Background panels (dark brown rounded rectangles)
- **Background**: `brickwall.png` (used on all screens).  
- **Icons:** Arrow controls (left/right)

---

## 📱 Technical Specs
- **Engine:** HTML, CSS, Vanilla JavaScript only.  
- **Aspect Ratio:** Vertical 9:16 (mobile-first).  
- **Base Resolution:** 360×640px (scale up for PC).  
- **Controls:** Touch/Click + Arrow keys.  
- **Duration:** 1 minute average playtime.  
- **Font:** Pixelated font family (DNFBitBitv2 recommended)

---

## ✅ MVP Scope
- Auto-jumping vertical climb loop.  
- 3 selectable characters (swap sprite).  
- Simple scoring system (height).  
- Game over detection (fall below screen).  
- UI screens (Start, Select, Game, End).  
- Responsive design for mobile and PC
- Share functionality for social media

---

## 🚀 Future Enhancements (Post-MVP)
- Sound effects and background music
- Character animations (idle, jump)
- Platform variety (different sizes, moving platforms)
- Power-ups and obstacles
- Leaderboard system
- More character customization
- Achievement system

## color pallete
### 그래피티 (Graffiti)
Neon Lime Green: #9FFF5B
Vivid Purple: #B66DFF
Sky Cyan: #3CCEFF
Bright Orange: #FF6F3C
Hot Pink: #FF5CA2
### 캐릭터 - 갈색곰 (Brown Bear)
Light Brown: #C68958
Dark Brown: #8B5A2B
Highlight Beige: #EBC8A0
### 캐릭터 - 말티즈 (Maltese Dog)
White: #F9F9F9
Shadow Gray: #D9D9D9
Accent Sky Blue: #6CCFFF
### 캐릭터 - 코알라 (Koala)
Soft Gray: #9FA4A9
Dark Gray: #6B6E70
Ear Pink: #F4A7C3
### 아이템 (Collectibles)
Star Yellow: #FFD93D
Star Orange (Shadow): #FFB84C
Clover Green: #55D685
Clover Dark Green: #2C9C56
Note Blue: #4A90E2
Note Navy (Shadow): #2C3E7F
### 발판 (Brick Block)
Brick Base: #A04D3D
Brick Shadow: #5C2A24
Brick Highlight: #D87B6E

## fonts
```
@font-face{
font-family:'DNFBitBitv2';
font-style:normal;font-weight:400;src:url('//cdn.df.nexon.com/img/common/font/DNFBitBitv2.otf')format('opentype')}
```