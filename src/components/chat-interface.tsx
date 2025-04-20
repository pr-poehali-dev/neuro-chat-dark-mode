import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Send, Download, Check, Copy, Save, Code, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  attachments?: {
    type: "image" | "video" | "code" | "game";
    url: string;
    alt?: string;
    fileName?: string;
    content?: string;
  }[];
};

type ModelInfo = {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
};

interface ChatInterfaceProps {
  selectedModel: string;
  models: ModelInfo[];
}

// Реальные демо-изображения и видео для моделей
const demoContent = {
  images: [
    "https://images.unsplash.com/photo-1679678691006-0ad24fecb769?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
    "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1679594647079-adb516bc954a?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1696652163362-94f1ebb8cddc?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1706514577324-5eecee7f2379?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ],
  videos: [
    "https://player.vimeo.com/external/559160858.sd.mp4?s=4b36c4ce69e61caf8f0eaa82c01f6ef7f5104c92&profile_id=165&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/517090081.sd.mp4?s=cad3e76825cfe3add0fe525e79949abe96a4d24a&profile_id=165&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/451823388.sd.mp4?s=c14a9e8442bf5ae4643c0403cafe8c5d80d706ec&profile_id=165&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/434045526.sd.mp4?s=c27eff4ad66f9bafcd7706822c829effbb4310a6&profile_id=165&oauth2_token_id=57447761"
  ],
  gameTemplates: [
    {
      name: "Простая игра-платформер",
      code: `<!DOCTYPE html>
<html>
<head>
  <title>Простая игра-платформер</title>
  <style>
    body { margin: 0; overflow: hidden; }
    #game { background: #0f172a; position: relative; width: 100vw; height: 100vh; }
    #player { width: 50px; height: 50px; background: #8b5cf6; position: absolute; border-radius: 5px; }
    .platform { position: absolute; background: #64748b; border-radius: 5px; }
    #score { position: absolute; top: 10px; left: 10px; color: white; font-family: Arial; font-size: 24px; }
  </style>
</head>
<body>
  <div id="game">
    <div id="player"></div>
    <div id="score">Счёт: 0</div>
  </div>

  <script>
    // Настройки игры
    const player = document.getElementById('player');
    const game = document.getElementById('game');
    const scoreElement = document.getElementById('score');
    
    let playerX = 100;
    let playerY = 0;
    let velocityY = 0;
    let velocityX = 0;
    let isJumping = false;
    let score = 0;
    
    // Гравитация и управление
    const gravity = 0.5;
    const jumpPower = -15;
    const moveSpeed = 5;
    
    // Создаем платформы
    const platforms = [];
    
    function createPlatform(x, y, width, height) {
      const platform = document.createElement('div');
      platform.className = 'platform';
      platform.style.left = x + 'px';
      platform.style.top = y + 'px';
      platform.style.width = width + 'px';
      platform.style.height = height + 'px';
      game.appendChild(platform);
      
      platforms.push({
        element: platform,
        x, y, width, height
      });
    }
    
    // Создаем начальные платформы
    createPlatform(0, 500, 800, 20);
    createPlatform(200, 400, 200, 20);
    createPlatform(500, 300, 200, 20);
    createPlatform(100, 200, 200, 20);
    
    // Управление
    const keys = {};
    window.addEventListener('keydown', e => {
      keys[e.code] = true;
    });
    
    window.addEventListener('keyup', e => {
      keys[e.code] = false;
    });
    
    // Проверка столкновений
    function checkCollision() {
      let onPlatform = false;
      
      for (const platform of platforms) {
        // Проверяем находится ли игрок на платформе
        if (
          playerX + 50 > platform.x &&
          playerX < platform.x + platform.width &&
          playerY + 50 <= platform.y &&
          playerY + 50 + velocityY >= platform.y
        ) {
          playerY = platform.y - 50;
          velocityY = 0;
          isJumping = false;
          onPlatform = true;
          score++;
          scoreElement.textContent = \`Счёт: \${score}\`;
        }
      }
      
      return onPlatform;
    }
    
    // Основной игровой цикл
    function gameLoop() {
      // Применяем гравитацию
      velocityY += gravity;
      
      // Управление
      if (keys['ArrowLeft'] || keys['KeyA']) {
        velocityX = -moveSpeed;
      } else if (keys['ArrowRight'] || keys['KeyD']) {
        velocityX = moveSpeed;
      } else {
        velocityX = 0;
      }
      
      if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && !isJumping) {
        velocityY = jumpPower;
        isJumping = true;
      }
      
      // Обновляем позицию игрока
      playerX += velocityX;
      playerY += velocityY;
      
      // Проверяем столкновения
      checkCollision();
      
      // Ограничиваем игрока экраном
      if (playerX < 0) playerX = 0;
      if (playerX > game.clientWidth - 50) playerX = game.clientWidth - 50;
      if (playerY > game.clientHeight) {
        playerY = 0;
        playerX = 100;
        score = 0;
        scoreElement.textContent = \`Счёт: \${score}\`;
      }
      
      // Обновляем позицию
      player.style.left = playerX + 'px';
      player.style.top = playerY + 'px';
      
      requestAnimationFrame(gameLoop);
    }
    
    // Запускаем игру
    gameLoop();
  </script>
</body>
</html>`
    },
    {
      name: "Змейка на Canvas",
      code: `<!DOCTYPE html>
<html>
<head>
  <title>Змейка</title>
  <style>
    body { 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      height: 100vh; 
      margin: 0; 
      background-color: #0f172a; 
    }
    canvas { 
      border: 2px solid #8b5cf6; 
    }
    #score {
      position: absolute;
      top: 20px;
      color: white;
      font-family: Arial;
      font-size: 24px;
    }
  </style>
</head>
<body>
  <div id="score">Счёт: 0</div>
  <canvas id="game" width="400" height="400"></canvas>

  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    
    // Размер клетки
    const gridSize = 20;
    
    // Начальная скорость
    let speed = 100;
    
    // Змейка
    let snake = [
      {x: 5, y: 5},
      {x: 4, y: 5},
      {x: 3, y: 5}
    ];
    
    // Направление
    let direction = 'right';
    let nextDirection = direction;
    
    // Еда
    let food = {
      x: Math.floor(Math.random() * (canvas.width / gridSize)),
      y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
    
    // Счет
    let score = 0;
    
    // Управление
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' && direction !== 'down') {
        nextDirection = 'up';
      } else if (e.key === 'ArrowDown' && direction !== 'up') {
        nextDirection = 'down';
      } else if (e.key === 'ArrowLeft' && direction !== 'right') {
        nextDirection = 'left';
      } else if (e.key === 'ArrowRight' && direction !== 'left') {
        nextDirection = 'right';
      }
    });
    
    // Основной игровой цикл
    function gameLoop() {
      // Обновляем направление
      direction = nextDirection;
      
      // Создаем новую голову змейки
      const head = {...snake[0]};
      
      // Двигаем голову в нужном направлении
      if (direction === 'right') head.x++;
      if (direction === 'left') head.x--;
      if (direction === 'up') head.y--;
      if (direction === 'down') head.y++;
      
      // Проверяем столкновение со стеной
      if (
        head.x < 0 || 
        head.y < 0 || 
        head.x >= canvas.width / gridSize || 
        head.y >= canvas.height / gridSize
      ) {
        resetGame();
        return;
      }
      
      // Проверяем столкновение с собой
      for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
          resetGame();
          return;
        }
      }
      
      // Добавляем новую голову
      snake.unshift(head);
      
      // Проверяем столкновение с едой
      if (head.x === food.x && head.y === food.y) {
        // Увеличиваем счет
        score++;
        scoreElement.textContent = \`Счёт: \${score}\`;
        
        // Увеличиваем скорость
        speed = Math.max(50, speed - 2);
        
        // Создаем новую еду
        food = {
          x: Math.floor(Math.random() * (canvas.width / gridSize)),
          y: Math.floor(Math.random() * (canvas.height / gridSize))
        };
      } else {
        // Если не съели еду, убираем хвост
        snake.pop();
      }
      
      // Очищаем холст
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем змейку
      for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? '#8b5cf6' : '#a78bfa';
        ctx.fillRect(
          snake[i].x * gridSize, 
          snake[i].y * gridSize, 
          gridSize, 
          gridSize
        );
        
        // Добавляем обводку
        ctx.strokeStyle = '#0f172a';
        ctx.strokeRect(
          snake[i].x * gridSize, 
          snake[i].y * gridSize, 
          gridSize, 
          gridSize
        );
      }
      
      // Рисуем еду
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(
        food.x * gridSize + gridSize/2, 
        food.y * gridSize + gridSize/2, 
        gridSize/2, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      
      // Планируем следующий кадр
      setTimeout(gameLoop, speed);
    }
    
    // Сброс игры
    function resetGame() {
      snake = [
        {x: 5, y: 5},
        {x: 4, y: 5},
        {x: 3, y: 5}
      ];
      direction = 'right';
      nextDirection = direction;
      speed = 100;
      score = 0;
      scoreElement.textContent = \`Счёт: \${score}\`;
      food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
      };
      gameLoop();
    }
    
    // Запускаем игру
    gameLoop();
  </script>
</body>
</html>`
    },
    {
      name: "Космический шутер",
      code: `<!DOCTYPE html>
<html>
<head>
  <title>Космический шутер</title>
  <style>
    body { 
      margin: 0; 
      overflow: hidden; 
      background-color: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    canvas { 
      background: #0f172a; 
      display: block;
      border: 2px solid #8b5cf6;
    }
    #ui {
      position: absolute;
      top: 20px;
      color: white;
      font-family: Arial;
      font-size: 24px;
      text-align: center;
      width: 100%;
    }
  </style>
</head>
<body>
  <div id="ui">
    <div id="score">Счёт: 0</div>
    <div id="lives">Жизни: 3</div>
  </div>
  <canvas id="gameCanvas" width="600" height="800"></canvas>
  
  <script>
    // Настройка canvas
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    
    // Настройки игры
    let score = 0;
    let lives = 3;
    let gameOver = false;
    
    // Игрок
    const player = {
      x: canvas.width / 2,
      y: canvas.height - 100,
      width: 50,
      height: 50,
      speed: 8,
      color: '#8b5cf6'
    };
    
    // Снаряды
    const bullets = [];
    const bulletSpeed = 10;
    const bulletWidth = 5;
    const bulletHeight = 15;
    
    // Враги
    const enemies = [];
    const enemyWidth = 40;
    const enemyHeight = 40;
    let enemySpeed = 2;
    
    // Звезды (для фона)
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3,
        speed: 0.5 + Math.random() * 1.5
      });
    }
    
    // Управление
    const keys = {};
    window.addEventListener('keydown', e => {
      keys[e.code] = true;
    });
    
    window.addEventListener('keyup', e => {
      keys[e.code] = false;
    });
    
    // Стрельба (пробел)
    window.addEventListener('keydown', e => {
      if (e.code === 'Space' && !gameOver) {
        bullets.push({
          x: player.x + player.width / 2 - bulletWidth / 2,
          y: player.y,
          width: bulletWidth,
          height: bulletHeight
        });
      }
      
      // Перезапуск игры
      if (e.code === 'Enter' && gameOver) {
        resetGame();
      }
    });
    
    // Создание врагов
    function createEnemy() {
      if (enemies.length < 10 && !gameOver) {
        enemies.push({
          x: Math.random() * (canvas.width - enemyWidth),
          y: -enemyHeight,
          width: enemyWidth,
          height: enemyHeight,
          speed: enemySpeed + Math.random() * 2
        });
      }
    }
    
    // Проверка столкновений
    function checkCollisions() {
      // Снаряды и враги
      for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
          if (isColliding(bullets[i], enemies[j])) {
            // Удаляем снаряд и врага
            bullets.splice(i, 1);
            enemies.splice(j, 1);
            
            // Увеличиваем счет
            score += 10;
            scoreElement.textContent = \`Счёт: \${score}\`;
            
            // Увеличиваем скорость врагов каждые 100 очков
            if (score % 100 === 0) {
              enemySpeed += 0.5;
            }
            
            break;
          }
        }
      }
      
      // Игрок и враги
      for (let i = enemies.length - 1; i >= 0; i--) {
        if (isColliding(player, enemies[i])) {
          // Удаляем врага
          enemies.splice(i, 1);
          
          // Уменьшаем жизни
          lives--;
          livesElement.textContent = \`Жизни: \${lives}\`;
          
          if (lives <= 0) {
            gameOver = true;
          }
        }
      }
    }
    
    // Проверка столкновения двух объектов
    function isColliding(a, b) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    }
    
    // Обновление игры
    function update() {
      // Движение игрока
      if (keys['ArrowLeft'] || keys['KeyA']) {
        player.x = Math.max(0, player.x - player.speed);
      }
      if (keys['ArrowRight'] || keys['KeyD']) {
        player.x = Math.min(canvas.width - player.width, player.x + player.speed);
      }
      
      // Обновление снарядов
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bulletSpeed;
        
        // Удаляем снаряды, вышедшие за пределы экрана
        if (bullets[i].y + bullets[i].height < 0) {
          bullets.splice(i, 1);
        }
      }
      
      // Обновление врагов
      for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        
        // Удаляем врагов, вышедших за пределы экрана
        if (enemies[i].y > canvas.height) {
          enemies.splice(i, 1);
          
          // Штраф за пропущенного врага
          score = Math.max(0, score - 5);
          scoreElement.textContent = \`Счёт: \${score}\`;
        }
      }
      
      // Обновление звезд
      for (let i = 0; i < stars.length; i++) {
        stars[i].y += stars[i].speed;
        
        // Возвращаем звезды, вышедшие за пределы экрана
        if (stars[i].y > canvas.height) {
          stars[i].y = 0;
          stars[i].x = Math.random() * canvas.width;
        }
      }
      
      // Создаем новых врагов
      if (Math.random() < 0.02) {
        createEnemy();
      }
      
      // Проверяем столкновения
      checkCollisions();
    }
    
    // Отрисовка игры
    function draw() {
      // Очищаем холст
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем звезды
      ctx.fillStyle = 'white';
      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Если игра окончена
      if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ИГРА ОКОНЧЕНА', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText(\`Счёт: \${score}\`, canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText('Нажмите Enter для перезапуска', canvas.width / 2, canvas.height / 2 + 100);
        
        requestAnimationFrame(draw);
        return;
      }
      
      // Рисуем игрока
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y, player.width, player.height);
      
      // Рисуем снаряды
      ctx.fillStyle = '#a78bfa';
      for (const bullet of bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      }
      
      // Рисуем врагов
      ctx.fillStyle = '#ef4444';
      for (const enemy of enemies) {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }
      
      // Обновляем состояние игры
      update();
      
      // Запрашиваем следующий кадр
      requestAnimationFrame(draw);
    }
    
    // Сброс игры
    function resetGame() {
      score = 0;
      lives = 3;
      gameOver = false;
      enemySpeed = 2;
      player.x = canvas.width / 2;
      player.y = canvas.height - 100;
      bullets.length = 0;
      enemies.length = 0;
      
      scoreElement.textContent = \`Счёт: \${score}\`;
      livesElement.textContent = \`Жизни: \${lives}\`;
    }
    
    // Запускаем игру
    draw();
  </script>
</body>
</html>`
    },
    {
      name: "Тетрис",
      code: `<!DOCTYPE html>
<html>
<head>
  <title>Тетрис</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: Arial, sans-serif;
      color: white;
    }
    .game-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .info-panel {
      display: flex;
      justify-content: space-around;
      width: 300px;
      margin-bottom: 20px;
    }
    .score, .level, .lines {
      text-align: center;
    }
    .label {
      font-size: 14px;
      color: #a78bfa;
      margin-bottom: 5px;
    }
    .value {
      font-size: 24px;
      font-weight: bold;
    }
    canvas {
      border: 2px solid #8b5cf6;
      background-color: #1e293b;
    }
    .game-over {
      position: absolute;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 8px;
      padding: 20px;
      display: none;
    }
    .game-over h2 {
      font-size: 36px;
      color: #ef4444;
      margin-bottom: 20px;
    }
    .game-over button {
      background-color: #8b5cf6;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 18px;
      border-radius: 4px;
      cursor: pointer;
    }
    .game-over button:hover {
      background-color: #7c3aed;
    }
    .controls {
      margin-top: 20px;
      font-size: 14px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="game-container">
    <div class="info-panel">
      <div class="score">
        <div class="label">СЧЁТ</div>
        <div class="value" id="score">0</div>
      </div>
      <div class="level">
        <div class="label">УРОВЕНЬ</div>
        <div class="value" id="level">1</div>
      </div>
      <div class="lines">
        <div class="label">ЛИНИИ</div>
        <div class="value" id="lines">0</div>
      </div>
    </div>
    
    <div class="canvas-container">
      <canvas id="tetris" width="300" height="600"></canvas>
      <div class="game-over" id="gameOver">
        <h2>ИГРА ОКОНЧЕНА</h2>
        <button id="restartButton">ИГРАТЬ СНОВА</button>
      </div>
    </div>
    
    <div class="controls">
      Управление: ← → для движения, ↑ для поворота, ↓ для ускорения
    </div>
  </div>

  <script>
    // Получаем элементы DOM
    const canvas = document.getElementById('tetris');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const linesElement = document.getElementById('lines');
    const gameOverPanel = document.getElementById('gameOver');
    const restartButton = document.getElementById('restartButton');
    
    // Размер ячейки
    const blockSize = 30;
    const boardWidth = 10;
    const boardHeight = 20;
    
    // Цвета для фигур
    const colors = [
      null,
      '#FF0D72', // I
      '#0DC2FF', // J
      '#0DFF72', // L
      '#F538FF', // O
      '#FF8E0D', // S
      '#FFE138', // T
      '#3877FF'  // Z
    ];
    
    // Фигуры тетриса
    const pieces = [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
      ],
      [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
      ],
      [
        [4, 4],
        [4, 4]
      ],
      [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
      ],
      [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]
      ],
      [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
      ]
    ];
    
    // Создаем поле игры
    let board = createBoard();
    
    // Создаем игрока
    let player = {
      pos: {x: 0, y: 0},
      piece: null,
      score: 0,
      level: 1,
      lines: 0,
      dropCounter: 0,
      dropInterval: 1000, // 1 секунда
    };
    
    // Переменные для игрового цикла
    let lastTime = 0;
    let gameOver = false;
    
    // Инициализация игры
    initGame();
    
    // Создание игрового поля
    function createBoard() {
      return Array(boardHeight).fill().map(() => Array(boardWidth).fill(0));
    }
    
    // Инициализация игры
    function initGame() {
      board = createBoard();
      player.score = 0;
      player.level = 1;
      player.lines = 0;
      player.dropInterval = 1000;
      scoreElement.textContent = player.score;
      levelElement.textContent = player.level;
      linesElement.textContent = player.lines;
      gameOver = false;
      gameOverPanel.style.display = 'none';
      createPiece();
      
      // Запускаем игровой цикл
      requestAnimationFrame(gameLoop);
    }
    
    // Создание новой фигуры
    function createPiece() {
      const pieceType = Math.floor(Math.random() * pieces.length);
      player.piece = pieces[pieceType];
      player.pos.y = 0;
      player.pos.x = Math.floor((board[0].length - player.piece[0].length) / 2);
      
      // Проверка на конец игры - если новая фигура сразу сталкивается
      if (checkCollision()) {
        gameOver = true;
        gameOverPanel.style.display = 'flex';
      }
    }
    
    // Проверка столкновений
    function checkCollision() {
      for (let y = 0; y < player.piece.length; y++) {
        for (let x = 0; x < player.piece[y].length; x++) {
          if (player.piece[y][x] !== 0 && // Если это часть фигуры
              (!board[y + player.pos.y] || // Если выходит за поле по вертикали
               !board[y + player.pos.y][x + player.pos.x] === undefined || // Если выходит за поле по горизонтали
               board[y + player.pos.y][x + player.pos.x] !== 0)) { // Если ячейка занята
            return true;
          }
        }
      }
      return false;
    }
    
    // Поворот фигуры
    function rotate() {
      const piece = JSON.parse(JSON.stringify(player.piece)); // Создаем копию
      
      // Транспонируем матрицу
      for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < y; x++) {
          [piece[x][y], piece[y][x]] = [piece[y][x], piece[x][y]];
        }
      }
      
      // Переворачиваем строки
      piece.forEach(row => row.reverse());
      
      // Проверяем, возможен ли поворот
      const originalPos = {...player.pos};
      let offset = 0;
      
      player.piece = piece;
      
      // Если после поворота фигура выходит за пределы - пробуем сместить её
      if (checkCollision()) {
        for (offset = 1; offset < piece[0].length; offset++) {
          player.pos.x += offset;
          if (!checkCollision()) break;
          
          player.pos.x -= offset * 2;
          if (!checkCollision()) break;
          
          player.pos.x += offset;
        }
      }
      
      // Если никакое смещение не помогло - отменяем поворот
      if (checkCollision()) {
        player.piece = JSON.parse(JSON.stringify(pieces[pieces.indexOf(player.piece)]));
        player.pos = {...originalPos};
      }
    }
    
    // Сбрасываем фигуру вниз
    function drop() {
      player.pos.y++;
      if (checkCollision()) {
        player.pos.y--;
        solidify();
        removeLines();
        createPiece();
      }
      player.dropCounter = 0;
    }
    
    // Закрепляем фигуру на доске
    function solidify() {
      player.piece.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            board[y + player.pos.y][x + player.pos.x] = value;
          }
        });
      });
    }
    
    // Проверяем и удаляем заполненные линии
    function removeLines() {
      let linesCleared = 0;
      
      outer: for (let y = board.length - 1; y >= 0; y--) {
        for (let x = 0; x < board[y].length; x++) {
          if (board[y][x] === 0) continue outer;
        }
        
        // Удаляем линию
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        y++; // Проверяем ту же позицию снова
        
        linesCleared++;
      }
      
      if (linesCleared > 0) {
        // Начисляем очки (больше очков за одновременное удаление нескольких линий)
        const points = [0, 40, 100, 300, 1200];
        player.score += points[linesCleared] * player.level;
        player.lines += linesCleared;
        
        // Повышаем уровень каждые 10 линий
        const newLevel = Math.floor(player.lines / 10) + 1;
        if (newLevel > player.level) {
          player.level = newLevel;
          player.dropInterval = Math.max(100, 1000 - (player.level - 1) * 100); // Увеличиваем скорость
        }
        
        scoreElement.textContent = player.score;
        levelElement.textContent = player.level;
        linesElement.textContent = player.lines;
      }
    }
    
    // Перемещение фигуры
    function move(dir) {
      player.pos.x += dir;
      if (checkCollision()) {
        player.pos.x -= dir;
      }
    }
    
    // Отрисовка доски
    function drawBoard() {
      board.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            ctx.fillStyle = colors[value];
            ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
            
            // Отрисовка границ блока
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2;
            ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
          }
        });
      });
    }
    
    // Отрисовка текущей фигуры
    function drawPiece() {
      player.piece.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            ctx.fillStyle = colors[value];
            ctx.fillRect((x + player.pos.x) * blockSize, (y + player.pos.y) * blockSize, blockSize, blockSize);
            
            // Отрисовка границ блока
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2;
            ctx.strokeRect((x + player.pos.x) * blockSize, (y + player.pos.y) * blockSize, blockSize, blockSize);
          }
        });
      });
    }
    
    // Отрисовка всего игрового поля
    function draw() {
      // Очищаем canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем сетку (опционально)
      ctx.strokeStyle = '#2a3548';
      ctx.lineWidth = 1;
      for (let i = 0; i <= boardWidth; i++) {
        ctx.beginPath();
        ctx.moveTo(i * blockSize, 0);
        ctx.lineTo(i * blockSize, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i <= boardHeight; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * blockSize);
        ctx.lineTo(canvas.width, i * blockSize);
        ctx.stroke();
      }
      
      // Рисуем доску и текущую фигуру
      drawBoard();
      drawPiece();
    }
    
    // Игровой цикл
    function gameLoop(time = 0) {
      if (gameOver) return;
      
      const deltaTime = time - lastTime;
      lastTime = time;
      
      player.dropCounter += deltaTime;
      if (player.dropCounter > player.dropInterval) {
        drop();
      }
      
      draw();
      requestAnimationFrame(gameLoop);
    }
    
    // Обработка ввода с клавиатуры
    document.addEventListener('keydown', event => {
      if (gameOver) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          move(-1);
          break;
        case 'ArrowRight':
          move(1);
          break;
        case 'ArrowDown':
          drop();
          break;
        case 'ArrowUp':
          rotate();
          break;
      }
    });
    
    // Кнопка рестарта
    restartButton.addEventListener('click', initGame);
  </script>
</body>
</html>`
    },
    {
      name: "Арканоид",
      code: `<!DOCTYPE html>
<html>
<head>
  <title>Арканоид</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: Arial, sans-serif;
      color: white;
    }
    .game-container {
      position: relative;
    }
    canvas {
      border: 2px solid #8b5cf6;
      background-color: #1e293b;
      display: block;
    }
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(15, 23, 42, 0.8);
      visibility: hidden;
    }
    .message {
      font-size: 36px;
      color: white;
      margin-bottom: 20px;
      text-align: center;
    }
    .btn {
      background: #8b5cf6;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 18px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }
    .btn:hover {
      background: #7c3aed;
    }
    .info {
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 18px;
    }
    .score {
      margin-bottom: 5px;
    }
    .lives {
      display: flex;
      align-items: center;
    }
    .life {
      width: 12px;
      height: 12px;
      background: #ef4444;
      border-radius: 50%;
      margin-left: 5px;
      display: inline-block;
    }
    .controls {
      position: absolute;
      bottom: 10px;
      left: 0;
      width: 100%;
      text-align: center;
      color: #94a3b8;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="game-container">
    <canvas id="game" width="800" height="600"></canvas>
    
    <div class="info">
      <div class="score">Счёт: <span id="score">0</span></div>
      <div class="lives">Жизни: <span id="livesContainer"></span></div>
    </div>
    
    <div class="overlay" id="overlay">
      <div class="message" id="message"></div>
      <button class="btn" id="startBtn">Начать игру</button>
    </div>
    
    <div class="controls">
      Управление: мышь или стрелки влево/вправо для движения платформы
    </div>
  </div>

  <script>
    // Получаем элементы DOM
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('overlay');
    const message = document.getElementById('message');
    const startBtn = document.getElementById('startBtn');
    const scoreElement = document.getElementById('score');
    const livesContainer = document.getElementById('livesContainer');
    
    // Определяем состояние игры
    let gameState = {
      score: 0,
      lives: 3,
      playing: false,
      ball: {
        x: canvas.width / 2,
        y: canvas.height - 60,
        radius: 10,
        dx: 5,
        dy: -5,
        speed: 5
      },
      paddle: {
        x: canvas.width / 2 - 50,
        y: canvas.height - 30,
        width: 100,
        height: 15,
        dx: 0,
        speed: 10
      },
      bricks: [],
      brickConfig: {
        rows: 5,
        cols: 10,
        width: 70,
        height: 20,
        padding: 10,
        offsetX: 45,
        offsetY: 60,
        colors: ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#6366f1']
      },
      keys: {
        left: false,
        right: false
      }
    };
    
    // Создаем кирпичи
    function createBricks() {
      gameState.bricks = [];
      
      for (let row = 0; row < gameState.brickConfig.rows; row++) {
        for (let col = 0; col < gameState.brickConfig.cols; col++) {
          const brick = {
            x: col * (gameState.brickConfig.width + gameState.brickConfig.padding) + gameState.brickConfig.offsetX,
            y: row * (gameState.brickConfig.height + gameState.brickConfig.padding) + gameState.brickConfig.offsetY,
            width: gameState.brickConfig.width,
            height: gameState.brickConfig.height,
            color: gameState.brickConfig.colors[row],
            status: 1 // 1 = активен, 0 = разбит
          };
          
          gameState.bricks.push(brick);
        }
      }
    }
    
    // Обновляем UI
    function updateUI() {
      scoreElement.textContent = gameState.score;
      
      // Обновляем индикаторы жизней
      livesContainer.innerHTML = '';
      for (let i = 0; i < gameState.lives; i++) {
        const lifeElement = document.createElement('div');
        lifeElement.className = 'life';
        livesContainer.appendChild(lifeElement);
      }
    }
    
    // Инициализация игры
    function initGame() {
      overlay.style.visibility = 'visible';
      message.textContent = 'Арканоид';
      
      gameState.score = 0;
      gameState.lives = 3;
      gameState.ball.x = canvas.width / 2;
      gameState.ball.y = canvas.height - 60;
      gameState.ball.dx = gameState.ball.speed * (Math.random() > 0.5 ? 1 : -1);
      gameState.ball.dy = -gameState.ball.speed;
      gameState.paddle.x = canvas.width / 2 - gameState.paddle.width / 2;
      
      createBricks();
      updateUI();
      
      // Рисуем начальное состояние
      draw();
    }
    
    // Старт игры
    function startGame() {
      overlay.style.visibility = 'hidden';
      gameState.playing = true;
      
      // Запускаем игровой цикл
      requestAnimationFrame(gameLoop);
    }
    
    // Обработка окончания игры
    function gameOver(won) {
      gameState.playing = false;
      overlay.style.visibility = 'visible';
      
      if (won) {
        message.textContent = 'Вы выиграли! 🎉';
      } else {
        message.textContent = 'Игра окончена!';
      }
    }
    
    // Движение платформы
    function movePaddle() {
      // Клавиши управления
      if (gameState.keys.left) {
        gameState.paddle.dx = -gameState.paddle.speed;
      } else if (gameState.keys.right) {
        gameState.paddle.dx = gameState.paddle.speed;
      } else {
        gameState.paddle.dx = 0;
      }
      
      // Обновляем позицию платформы
      gameState.paddle.x += gameState.paddle.dx;
      
      // Предотвращаем выход за пределы поля
      if (gameState.paddle.x < 0) {
        gameState.paddle.x = 0;
      } else if (gameState.paddle.x + gameState.paddle.width > canvas.width) {
        gameState.paddle.x = canvas.width - gameState.paddle.width;
      }
    }
    
    // Движение мяча
    function moveBall() {
      // Обновляем позицию мяча
      gameState.ball.x += gameState.ball.dx;
      gameState.ball.y += gameState.ball.dy;
      
      // Отскок от стен
      if (gameState.ball.x + gameState.ball.radius > canvas.width || 
          gameState.ball.x - gameState.ball.radius < 0) {
        gameState.ball.dx = -gameState.ball.dx;
      }
      
      // Отскок от верха
      if (gameState.ball.y - gameState.ball.radius < 0) {
        gameState.ball.dy = -gameState.ball.dy;
      }
      
      // Мяч вышел за нижнюю границу
      if (gameState.ball.y + gameState.ball.radius > canvas.height) {
        gameState.lives--;
        updateUI();
        
        if (gameState.lives <= 0) {
          gameOver(false);
          return;
        }
        
        // Сброс позиции мяча
        gameState.ball.x = canvas.width / 2;
        gameState.ball.y = canvas.height - 60;
        gameState.ball.dx = gameState.ball.speed * (Math.random() > 0.5 ? 1 : -1);
        gameState.ball.dy = -gameState.ball.speed;
        gameState.paddle.x = canvas.width / 2 - gameState.paddle.width / 2;
      }
      
      // Проверка столкновения с платформой
      if (
        gameState.ball.y + gameState.ball.radius > gameState.paddle.y &&
        gameState.ball.y - gameState.ball.radius < gameState.paddle.y + gameState.paddle.height &&
        gameState.ball.x > gameState.paddle.x &&
        gameState.ball.x < gameState.paddle.x + gameState.paddle.width
      ) {
        // Меняем направление в зависимости от того, где мяч ударил по платформе
        let hitPosition = (gameState.ball.x - gameState.paddle.x) / gameState.paddle.width;
        
        // Угол отскока зависит от места удара по платформе
        let angle = hitPosition * Math.PI - Math.PI/2;
        
        gameState.ball.dx = gameState.ball.speed * Math.cos(angle);
        gameState.ball.dy = -gameState.ball.speed * Math.sin(angle);
      }
      
      // Проверка столкновения с кирпичами
      for (let i = 0; i < gameState.bricks.length; i++) {
        const brick = gameState.bricks[i];
        
        if (brick.status === 1) {
          if (
            gameState.ball.x + gameState.ball.radius > brick.x &&
            gameState.ball.x - gameState.ball.radius < brick.x + brick.width &&
            gameState.ball.y + gameState.ball.radius > brick.y &&
            gameState.ball.y - gameState.ball.radius < brick.y + brick.height
          ) {
            // Меняем направление мяча
            gameState.ball.dy = -gameState.ball.dy;
            
            // Помечаем кирпич как разбитый
            brick.status = 0;
            
            // Увеличиваем счет
            gameState.score += 10;
            updateUI();
            
            // Проверяем, все ли кирпичи разбиты
            if (gameState.bricks.every(brick => brick.status === 0)) {
              gameOver(true);
              return;
            }
          }
        }
      }
    }
    
    // Отрисовка мяча
    function drawBall() {
      ctx.beginPath();
      ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#8b5cf6';
      ctx.fill();
      ctx.closePath();
    }
    
    // Отрисовка платформы
    function drawPaddle() {
      ctx.beginPath();
      ctx.rect(
        gameState.paddle.x,
        gameState.paddle.y,
        gameState.paddle.width,
        gameState.paddle.height
      );
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.closePath();
    }
    
    // Отрисовка кирпичей
    function drawBricks() {
      gameState.bricks.forEach(brick => {
        if (brick.status === 1) {
          ctx.beginPath();
          ctx.rect(brick.x, brick.y, brick.width, brick.height);
          ctx.fillStyle = brick.color;
          ctx.fill();
          ctx.closePath();
          
          // Добавляем блик (эффект объема)
          ctx.beginPath();
          ctx.rect(brick.x + 2, brick.y + 2, brick.width - 4, 5);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fill();
          ctx.closePath();
        }
      });
    }
    
    // Отрисовка всех элементов
    function draw() {
      // Очищаем холст
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем компоненты
      drawBricks();
      drawBall();
      drawPaddle();
    }
    
    // Игровой цикл
    function gameLoop() {
      if (!gameState.playing) return;
      
      // Обновляем позиции
      movePaddle();
      moveBall();
      
      // Отрисовываем
      draw();
      
      // Следующий кадр
      requestAnimationFrame(gameLoop);
    }
    
    // Обработчики событий
    startBtn.addEventListener('click', startGame);
    
    // Управление клавиатурой
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        gameState.keys.left = true;
      } else if (e.key === 'ArrowRight') {
        gameState.keys.right = true;
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft') {
        gameState.keys.left = false;
      } else if (e.key === 'ArrowRight') {
        gameState.keys.right = false;
      }
    });
    
    // Управление мышью
    canvas.addEventListener('mousemove', (e) => {
      // Получаем позицию мыши относительно canvas
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      
      // Обновляем позицию платформы
      gameState.paddle.x = mouseX - gameState.paddle.width / 2;
      
      // Предотвращаем выход за пределы поля
      if (gameState.paddle.x < 0) {
        gameState.paddle.x = 0;
      } else if (gameState.paddle.x + gameState.paddle.width > canvas.width) {
        gameState.paddle.x = canvas.width - gameState.paddle.width;
      }
    });
    
    // Запускаем игру
    initGame();
  </script>
</body>
</html>`
    }
  ]
};

export function ChatInterface({ selectedModel, models }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSaved, setIsSaved] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeModel = models.find(model => model.id === selectedModel) || models[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getRandomDemoContent = (type: 'image' | 'video') => {
    if (type === 'image') {
      const randomIndex = Math.floor(Math.random() * demoContent.images.length);
      return demoContent.images[randomIndex];
    } else {
      const randomIndex = Math.floor(Math.random() * demoContent.videos.length);
      return demoContent.videos[randomIndex];
    }
  };

  const getGameTemplateByPrompt = (prompt: string) => {
    // Выбираем шаблон игры на основе ключевых слов в запросе
    prompt = prompt.toLowerCase();
    
    if (prompt.includes('платформер') || prompt.includes('прыжки') || prompt.includes('марио')) {
      return demoContent.gameTemplates[0]; // Платформер
    } else if (prompt.includes('змейка') || prompt.includes('змея') || prompt.includes('snake')) {
      return demoContent.gameTemplates[1]; // Змейка
    } else if (prompt.includes('шутер') || prompt.includes('стрелялка') || prompt.includes('космос')) {
      return demoContent.gameTemplates[2]; // Космический шутер
    } else if (prompt.includes('тетрис') || prompt.includes('блоки') || prompt.includes('tetris')) {
      return demoContent.gameTemplates[3]; // Тетрис
    } else if (prompt.includes('арканоид') || prompt.includes('блоки') || prompt.includes('шарик')) {
      return demoContent.gameTemplates[4]; // Арканоид
    } else {
      // По умолчанию возвращаем случайный шаблон
      const randomIndex = Math.floor(Math.random() * demoContent.gameTemplates.length);
      return demoContent.gameTemplates[randomIndex];
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Simulate AI response based on selected model
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getResponseByModelAndPrompt(activeModel.id, input),
        role: "assistant",
        timestamp: new Date(),
        attachments: getAttachmentByModel(activeModel.id, input)
      };
      
      setMessages(prev => [...prev, responseMessage]);
    }, 1000);
  };

  const getAttachmentByModel = (modelId: string, prompt: string): Message["attachments"] => {
    if (modelId.includes("dall") || modelId.includes("midjourney")) {
      const imageUrl = getRandomDemoContent('image');
      return [{ 
        type: "image", 
        url: imageUrl, 
        alt: `Изображение по запросу "${prompt}"`,
        fileName: `image-${Date.now()}.jpg`
      }];
    }
    if (modelId.includes("sora")) {
      const videoUrl = getRandomDemoContent('video');
      return [{ 
        type: "video", 
        url: videoUrl, 
        alt: `Видео по запросу "${prompt}"`,
        fileName: `video-${Date.now()}.mp4`
      }];
    }
    if (modelId.includes("gemini")) {
      const gameTemplate = getGameTemplateByPrompt(prompt);
      return [{ 
        type: "game", 
        url: "", 
        alt: `Игра по запросу "${prompt}"`,
        fileName: `game-${prompt.substring(0, 10)}-${Date.now()}.html`,
        content: gameTemplate.code
      }];
    }
    return undefined;
  };

  const getResponseByModelAndPrompt = (modelId: string, prompt: string): string => {
    if (modelId.includes("dall") || modelId.includes("midjourney")) {
      return `✨ Вот изображение по запросу "${prompt}". Я постарался сделать его максимально детализированным. Вы можете сохранить его, нажав на кнопку загрузки.`;
    }
    if (modelId.includes("sora")) {
      return `🎬 Видео по запросу "${prompt}" готово. Оно демонстрирует именно ту сцену, которую вы описали. Вы можете просмотреть и сохранить его.`;
    }
    if (modelId.includes("gemini")) {
      const gameTemplate = getGameTemplateByPrompt(prompt);
      return `💻 Я создал игру "${gameTemplate.name}" по вашему запросу "${prompt}". Вы можете запустить её прямо сейчас или сохранить код для дальнейшего использования.`;
    }
    if (modelId.includes("custom")) {
      return `Как ваша персонализированная нейросеть, я готов помочь с запросом "${prompt}". Я могу создавать изображения, видео, игры и многое другое. Просто скажите, что именно вы хотите получить.`;
    }
    return `Я обработал ваш запрос "${prompt}". Чем еще могу помочь?`;
  };

  const handleSave = (messageId: string, attachment: Message["attachments"][0]) => {
    if (!attachment) return;
    
    setIsSaved(prev => ({ ...prev, [messageId]: true }));
    
    // Create download functionality based on attachment type
    if (attachment.type === "image" || attachment.type === "video") {
      // Create an anchor element and trigger download
      const a = document.createElement('a');
      a.href = attachment.url;
      a.download = attachment.fileName || `file-${Date.now()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Файл сохранен",
        description: `${attachment.type === "image" ? "Изображение" : "Видео"} успешно сохранено на ваше устройство.`,
      });
    } else if (attachment.type === "game" || attachment.type === "code") {
      // For code/game, create a downloadable text file
      const blob = new Blob([attachment.content || ""], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.fileName || `game-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Игра сохранена",
        description: "HTML-файл игры успешно сохранен. Откройте его в браузере, чтобы играть.",
      });
    }
    
    setTimeout(() => {
      setIsSaved(prev => ({ ...prev, [messageId]: false }));
    }, 2000);
  };
  
  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setIsSaved(prev => ({ ...prev, [messageId]: true }));
    
    toast({
      title: "Скопировано в буфер обмена",
      description: "Код успешно скопирован. Теперь вы можете его использовать.",
    });
    
    setTimeout(() => {
      setIsSaved(prev => ({ ...prev, [messageId]: false }));
    }, 2000);
  };
  
  const playGame = (gameCode: string, messageId: string) => {
    // Toggle play state
    setIsPlaying(prev => {
      const newState = { ...prev };
      newState[messageId] = !newState[messageId];
      return newState;
    });
    
    if (!isPlaying[messageId]) {
      // Create a popup window or iframe to run the game
      const gameWindow = window.open("", "_blank");
      if (gameWindow) {
        gameWindow.document.write(gameCode);
        gameWindow.document.close();
      } else {
        toast({
          title: "Не удалось запустить игру",
          description: "Разрешите всплывающие окна для этого сайта и попробуйте снова.",
          variant: "destructive"
        });
        setIsPlaying(prev => ({ ...prev, [messageId]: false }));
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <div className="mb-4 p-4 rounded-full bg-primary/10">
              {activeModel.avatar ? (
                <img src={activeModel.avatar} alt={activeModel.name} className="w-16 h-16" />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center text-primary text-2xl">
                  {activeModel.name.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">{activeModel.name}</h3>
            <p className="max-w-md">
              {activeModel.description || "Задайте вопрос или опишите, что вы хотите создать"}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-5xl",
                message.role === "user" ? "ml-auto" : ""
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 bg-primary">
                  <span>{activeModel.name.charAt(0)}</span>
                </Avatar>
              )}
              
              <div className={cn(
                "flex flex-col rounded-lg p-4",
                message.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card"
              )}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Render attachments */}
                {message.attachments?.map((attachment, i) => (
                  <div key={i} className="mt-3">
                    {attachment.type === "image" && (
                      <div className="relative">
                        <img 
                          src={attachment.url} 
                          alt={attachment.alt} 
                          className="rounded-md max-w-md h-auto" 
                        />
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="absolute top-2 right-2"
                          onClick={() => handleSave(message.id, attachment)}
                        >
                          {isSaved[message.id] ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}
                    
                    {attachment.type === "video" && (
                      <div className="relative rounded-md max-w-md overflow-hidden">
                        <video 
                          controls 
                          className="w-full h-auto" 
                          src={attachment.url}
                        >
                          Ваш браузер не поддерживает видео.
                        </video>
                        <Button 
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleSave(message.id, attachment)}
                        >
                          {isSaved[message.id] ? <Check className="h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                          {isSaved[message.id] ? "Сохранено" : "Сохранить"}
                        </Button>
                      </div>
                    )}
                    
                    {attachment.type === "game" && (
                      <div className="mt-3 relative rounded-md border border-border overflow-hidden">
                        <div className="flex items-center justify-between bg-card-muted p-2">
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{attachment.fileName}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => playGame(attachment.content || "", message.id)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Запустить
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSave(message.id, attachment)}
                            >
                              {isSaved[message.id] ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                              {isSaved[message.id] ? "Сохранено" : "Сохранить"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => copyToClipboard(attachment.content || "", message.id)}
                            >
                              {isSaved[message.id] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <pre className="bg-black p-4 overflow-x-auto text-sm max-h-64 overflow-y-auto">
                          <code className="text-green-400">{attachment.content?.substring(0, 500)}...</code>
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {message.role === "user" && (
                <Avatar className="h-8 w-8 bg-secondary">
                  <span>👨‍💻</span>
                </Avatar>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder={`Напишите сообщение для ${activeModel.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
