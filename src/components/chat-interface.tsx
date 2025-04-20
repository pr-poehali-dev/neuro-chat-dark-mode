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

// Demo images and videos for the models
const demoContent = {
  images: [
    "/public/demo-image-1.jpg", 
    "https://source.unsplash.com/random/800x600/?space",
    "https://source.unsplash.com/random/800x600/?nature",
    "https://source.unsplash.com/random/800x600/?art",
    "https://source.unsplash.com/random/800x600/?city",
  ],
  videos: [
    "https://v.redd.it/kfpbln93s7w61/DASH_720.mp4",
    "https://v.redd.it/6u51p07z3aq61/DASH_720.mp4",
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

  const getRandomGameTemplate = () => {
    const randomIndex = Math.floor(Math.random() * demoContent.gameTemplates.length);
    return demoContent.gameTemplates[randomIndex];
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
      const gameTemplate = getRandomGameTemplate();
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
      const gameTemplate = getRandomGameTemplate();
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
