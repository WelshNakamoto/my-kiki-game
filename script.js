// 키키의 밤 - 게임 메인 로직

// 1. 파일 상단에 이미지 로딩
const playerImage = new Image();
playerImage.src = 'img/kiki.png';

// 1. 파일 상단에 몬스터 이미지 매핑 추가
const monsterImages = {
  normal: new Image(),
  fast: new Image(),
  tank: new Image(),
  elite: new Image(),
  mini: new Image(),
  spiky: new Image(),
  ghost: new Image()
};
monsterImages.normal.src = 'img/zombie_1.png';
monsterImages.fast.src = 'img/zombie_2.png';
monsterImages.tank.src = 'img/zombie_3.png';
monsterImages.elite.src = 'img/zombie_4.png';
monsterImages.mini.src = 'img/zombie_5.png';
monsterImages.spiky.src = 'img/zombie_6.png';
monsterImages.ghost.src = 'img/zombie_7.png';

// 1. 파일 상단에 방향별 이미지 로딩
const playerImages = {
  down: new Image(),
  up: new Image(),
  left: new Image(),
  right: new Image(),
  default: new Image()
};
playerImages.default.src = 'img/kiki.png';
playerImages.down.src = 'img/kiki_down.png';
playerImages.up.src = 'img/kiki_up.png';
playerImages.left.src = 'img/kiki_left.png';
playerImages.right.src = 'img/kiki_right.png';

// 1. 파일 상단에 배경 이미지 로딩
const bgImage = new Image();
bgImage.src = 'img/background.png';

// 1. 파일 상단에 background2 이미지도 로딩
const bgImage2 = new Image();
bgImage2.src = 'img/background2.png';

// 1. 파일 상단에 포인트 이미지 3종 로딩
const xpOrbImages = [
  new Image(), // 1단계
  new Image(), // 2단계
  new Image()  // 3단계
];
xpOrbImages[0].src = 'img/kiki_logo.png';
xpOrbImages[1].src = 'img/stacks_logo.png';
xpOrbImages[2].src = 'img/sbtc_logo.png';

// 1. 파일 상단에 아이템 이미지 매핑 추가
const itemImages = {
  heal: new Image(),
  magnet: new Image(),
  shield: new Image(),
  weapon_upgrade: new Image(),
  speed: new Image(),
  cooldown: new Image(),
  bomb: new Image(),
  timestop: new Image(),
  random_box: new Image(),
  coin: new Image(),
  missile_double: new Image(),
  rapid_fire: new Image()
};
itemImages.heal.src = 'img/item/item_heal.png';
itemImages.magnet.src = 'img/item/item_magnet.png';
itemImages.shield.src = 'img/item/item_shield.png';
itemImages.weapon_upgrade.src = 'img/item/item_weapon.png';
itemImages.speed.src = 'img/item/item_speed.png';
itemImages.cooldown.src = 'img/item/item_cooldown.png';
itemImages.bomb.src = 'img/item/item_bomb.png';
itemImages.timestop.src = 'img/item/item_timestop.png';
itemImages.random_box.src = 'img/item/item_random.png';
itemImages.coin.src = 'img/item/item_coin.png';
itemImages.missile_double.src = 'img/item/item_missile.png';
itemImages.rapid_fire.src = 'img/item/item_rapid.png';

const itemDescriptions = [
  { name: "체력 회복", desc: "HP 30% 회복" },
  { name: "자석", desc: "10초간 XP(포인트) 자동 수집" },
  { name: "쉴드", desc: "8초간 무적" },
  { name: "무기 강화", desc: "무기 1레벨 강화(공격력 증가)" },
  { name: "이동속도", desc: "5초간 이동속도 20% 증가" },
  { name: "쿨타임 감소", desc: "5초간 공격 쿨타임 30% 감소(공격속도 증가)" },
  { name: "폭탄", desc: "주변 몬스터 즉시 처치" },
  { name: "시간정지", desc: "3초간 모든 몬스터 정지" },
  { name: "랜덤상자", desc: "무작위 아이템 1개 지급" },
  { name: "코인", desc: "점수/코인 획득" },
  { name: "더블 미사일", desc: "5초간 미사일 2개 발사(2마리 몬스터 추적)" },
  { name: "연사", desc: "10초간 연사(자동공격 속도 대폭 증가, 미사일 속도 2배)" }
];

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.isRunning = false;
        this.isPaused = false;
        this.gameStartTime = 0;
        this.lastUpdateTime = 0;
        this.score = 0;
        
        // 키 입력 상태
        this.keys = {};
        
        // 게임 오브젝트들
        this.player = null;
        this.monsters = [];
        this.bullets = [];
        this.items = [];
        this.xpOrbs = [];
        this.particles = [];
        
        // 게임 설정
        this.monsterSpawnRate = 2000; // 몬스터 스폰 간격 (ms)
        this.lastMonsterSpawn = 0;
        this.itemDropChance = 0.1; // 아이템 드롭 확률
        
        // 업그레이드/버프 상태
        this.upgradeWeaponCount = 0;
        this.upgradeHpCount = 0;
        this.upgradeSpeedCount = 0;
        
        // 아이템 목록 초기화
        this.initializeItemList();
        
        this.lastRandomItemTime = Date.now();
        this.nextRandomItemInterval = 10000 + Math.random() * 5000; // 10~15초
        
        this.init();
    }
    
    initializeItemList() {
        const itemList = document.getElementById('itemList');
        if (itemList) {
            itemList.innerHTML = '';
            itemDescriptions.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="item-name">${item.name}</span>: ${item.desc}`;
                itemList.appendChild(li);
            });
        }
    }
    
    init() {
        this.setupEventListeners();
        this.createPlayer();
        this.start();
    }
    
    setupEventListeners() {
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === 'Escape') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // 레벨업 버튼 이벤트
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgradeType = parseInt(e.target.getAttribute('data-upgrade'));
                this.applyUpgrade(upgradeType);
                this.hideLevelUpModal();
            });
        });
        
        // 재시작 버튼
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('restartClearBtn').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('continueBtn').addEventListener('click', () => {
            this.hideGameClearModal();
        });
    }
    
    createPlayer() {
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
    }
    
    start() {
        this.isRunning = true;
        this.gameStartTime = Date.now();
        this.lastUpdateTime = this.gameStartTime;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
        
        if (!this.isPaused) {
            this.update(deltaTime);
        }
        
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        const gameTime = Date.now() - this.gameStartTime;
        
        // UI 업데이트
        this.updateUI(gameTime);
        
        // 플레이어 업데이트
        this.player.update(deltaTime, this.keys);
        
        // 자동 공격
        this.player.autoAttack(deltaTime, this.bullets, this.monsters, this);
        
        // 몬스터 스폰
        this.spawnMonsters(gameTime);
        
        // 몬스터 업데이트
        this.monsters.forEach(monster => {
            monster.update(deltaTime, this.player);
        });
        
        // 총알 업데이트
        this.bullets.forEach(bullet => {
            bullet.update(deltaTime);
        });
        
        // 아이템 업데이트
        this.items.forEach(item => {
            item.update(deltaTime);
        });
        
        // XP 오브 업데이트
        this.xpOrbs.forEach(orb => {
            orb.update(deltaTime, this.player);
        });
        
        // 파티클 업데이트
        this.particles.forEach(particle => {
            particle.update(deltaTime);
        });
        
        // 충돌 처리
        this.handleCollisions();
        
        // 화면 밖 오브젝트 제거
        this.cleanup();
        
        // 10분 클리어 체크
        if (gameTime >= 600000) { // 10분
            this.showGameClearModal();
        }
        
        // 랜덤 바닥 아이템 생성
        const now = Date.now();
        if (now - this.lastRandomItemTime > this.nextRandomItemInterval) {
            this.spawnRandomGroundItem();
            this.lastRandomItemTime = now;
            this.nextRandomItemInterval = 10000 + Math.random() * 5000;
        }
    }
    
    render() {
        // 캔버스 클리어
        this.ctx.fillStyle = '#001122';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 배경 패턴
        this.drawBackground();
        
        // 게임 오브젝트 렌더링
        this.xpOrbs.forEach(orb => orb.render(this.ctx));
        this.items.forEach(item => item.render(this.ctx));
        this.player.render(this.ctx);
        this.monsters.forEach(monster => monster.render(this.ctx));
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.particles.forEach(particle => particle.render(this.ctx));
    }
    
    drawBackground() {
        // 스테이지 계산 (2분마다 1스테이지, 0~2: bgImage, 3이상: bgImage2)
        const gameTime = Date.now() - this.gameStartTime;
        const stage = Math.floor(gameTime / 120000);
        let bg = bgImage;
        if (stage >= 3 && bgImage2.complete && bgImage2.naturalWidth > 0) {
            bg = bgImage2;
        }
        if (bg.complete && bg.naturalWidth > 0) {
            this.ctx.drawImage(bg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = '#001122';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    spawnMonsters(gameTime) {
        if (gameTime - this.lastMonsterSpawn > this.monsterSpawnRate) {
            this.lastMonsterSpawn = gameTime;
            // 시간에 따른 난이도 조정
            const stage = Math.floor(gameTime / 120000); // 2분마다 스테이지 증가
            // 레벨에 따라 몬스터 수 증가
            let levelBonus = 0;
            if (this.player && this.player.level) {
                levelBonus = Math.floor((this.player.level - 1) / 2); // 2레벨마다 1마리 추가
            }
            const monsterCount = Math.min(1 + Math.floor(stage / 2) + levelBonus, 10); // 최대 10마리까지
            for (let i = 0; i < monsterCount; i++) {
                this.createMonster(stage);
            }
            // 스폰 간격 감소
            this.monsterSpawnRate = Math.max(500, 2000 - stage * 200);
        }
    }
    
    createMonster(stage) {
        const edge = Math.random();
        let x, y;
        if (edge < 0.25) { x = Math.random() * this.canvas.width; y = -30; }
        else if (edge < 0.5) { x = Math.random() * this.canvas.width; y = this.canvas.height + 30; }
        else if (edge < 0.75) { x = -30; y = Math.random() * this.canvas.height; }
        else { x = this.canvas.width + 30; y = Math.random() * this.canvas.height; }

        // 7가지 몬스터 타입 확장
        const monsterTypes = ['normal', 'fast', 'tank', 'elite', 'mini', 'spiky', 'ghost'];
        let weights = [1, 0.7, 0.5, 0.3, 0.6, 0.4, 0.2]; // 등장 확률 가중치
        // stage가 높아질수록 강한 몬스터 등장 확률 증가
        if (stage >= 2) { weights = [0.8, 0.7, 0.7, 0.5, 0.6, 0.5, 0.3]; }
        if (stage >= 4) { weights = [0.6, 0.7, 0.8, 0.7, 0.5, 0.6, 0.5]; }
        // 가중치 기반 랜덤 선택
        let sum = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * sum;
        let idx = 0;
        while (r > weights[idx]) { r -= weights[idx++]; }
        let monsterType = monsterTypes[idx];
        this.monsters.push(new Monster(x, y, monsterType));
    }
    
    handleCollisions() {
        // 총알 vs 몬스터
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.monsters.length - 1; j >= 0; j--) {
                const monster = this.monsters[j];
                if (this.checkCollision(bullet, monster)) {
                    // 데미지 처리
                    monster.takeDamage(bullet.damage);
                    // 미사일 터짐 임팩트(미사일 위치)
                    this.createParticles(bullet.x, bullet.y, '#ffff88');
                    this.bullets.splice(i, 1);
                    // 몬스터 사망 처리
                    if (monster.hp <= 0) {
                        this.createXPOrb(monster.x, monster.y, monster.xpValue, monster.type);
                        // 몬스터 위치 초간단 소형 폭발(노랑 파티클 1개)
                        this.particles.push(new Particle(monster.x, monster.y, '#ffaa00'));
                        this.score += monster.scoreValue;
                        // 아이템 드롭
                        if (Math.random() < this.itemDropChance) {
                            this.createItem(monster.x, monster.y);
                        }
                        this.monsters.splice(j, 1);
                    }
                    break;
                }
            }
        }
        
        // 플레이어 vs 몬스터
        this.monsters.forEach(monster => {
            if (this.checkCollision(this.player, monster) && !this.player.isInvincible) {
                this.player.takeDamage(monster.damage);
                if (this.player.hp <= 0) {
                    this.gameOver();
                }
            }
        });
        
        // 플레이어 vs XP 오브
        for (let i = this.xpOrbs.length - 1; i >= 0; i--) {
            const orb = this.xpOrbs[i];
            if (this.checkCollision(this.player, orb)) {
                this.player.gainXP(orb.value);
                this.xpOrbs.splice(i, 1);
            }
        }
        
        // 플레이어 vs 아이템
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            if (this.checkCollision(this.player, item)) {
                this.applyItem(item.type);
                this.items.splice(i, 1);
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < obj1.radius + obj2.radius;
    }
    
    createXPOrb(x, y, value, monsterType = 'normal') {
        let orbType = 1;
        if ([ 'tank', 'spiky', 'elite' ].includes(monsterType)) orbType = 2;
        if ([ 'ghost' ].includes(monsterType)) orbType = 3;
        this.xpOrbs.push(new XPOrb(x, y, value, orbType));
    }
    
    createItem(x, y) {
        const itemTypes = ['heal', 'magnet', 'shield', 'weapon_upgrade', 'speed', 'cooldown', 'bomb', 'timestop', 'random_box', 'coin', 'missile_double', 'rapid_fire'];
        const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        this.items.push(new Item(x, y, type));
    }
    
    createParticles(x, y, colorOrColors) {
        // colorOrColors가 배열이면 여러 색상 파티클, 아니면 단일 색상
        if (Array.isArray(colorOrColors)) {
            for (let i = 0; i < colorOrColors.length; i++) {
                this.particles.push(new Particle(x, y, colors[i]));
            }
        } else {
            for (let i = 0; i < 8; i++) {
                this.particles.push(new Particle(x, y, colorOrColors));
            }
        }
    }
    
    applyItem(type) {
        const itemTypes = ['heal', 'magnet', 'shield', 'weapon_upgrade', 'speed', 'cooldown', 'bomb', 'timestop', 'random_box', 'coin', 'missile_double', 'rapid_fire'];
        
        switch (type) {
            case 'heal':
                this.player.heal(Math.floor(this.player.maxHp * 0.3));
                break;
            case 'magnet':
                this.player.activateMagnet(10000);
                break;
            case 'shield':
                this.player.activateShield(8000);
                break;
            case 'weapon_upgrade':
                this.player.upgradeWeapon();
                break;
            case 'speed':
                this.player.activateSpeedBoost(5000);
                break;
            case 'cooldown':
                this.player.activateCooldownReduction(5000);
                break;
            case 'bomb':
                this.explodeAllMonsters();
                break;
            case 'timestop':
                this.activateTimeStop(3000);
                break;
            case 'random_box':
                this.applyItem(itemTypes[Math.floor(Math.random() * (itemTypes.length - 1))]);
                break;
            case 'coin':
                this.score += 100;
                break;
            case 'missile_double':
                this.player.activateMissileDouble(5000);
                break;
            case 'rapid_fire':
                this.player.activateRapidFire(10000);
                break;
        }
    }
    
    explodeAllMonsters() {
        this.monsters.forEach(monster => {
            this.createXPOrb(monster.x, monster.y, monster.xpValue, monster.type);
            this.createParticles(monster.x, monster.y, '#ffaa00');
            this.score += monster.scoreValue;
        });
        this.monsters = [];
    }
    
    activateTimeStop(duration) {
        this.monsters.forEach(monster => {
            monster.freeze(duration);
        });
    }
    
    applyUpgrade(type) {
        switch (type) {
            case 0:
                this.player.weaponDamage *= 1.2;
                this.upgradeWeaponCount++;
                break;
            case 1:
                this.player.maxHp += 30;
                this.player.hp = Math.min(this.player.hp + 30, this.player.maxHp);
                this.upgradeHpCount++;
                break;
            case 2:
                this.player.speed *= 1.15;
                this.upgradeSpeedCount++;
                break;
        }
    }
    
    cleanup() {
        // 화면 밖 총알 제거
        this.bullets = this.bullets.filter(bullet => 
            bullet.x > -50 && bullet.x < this.canvas.width + 50 &&
            bullet.y > -50 && bullet.y < this.canvas.height + 50
        );
        
        // 수명이 다한 파티클 제거
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        // 수명이 다한 아이템 제거
        this.items = this.items.filter(item => item.life > 0);
    }
    
    updateUI(gameTime) {
        // 시간 표시
        const minutes = Math.floor(gameTime / 60000);
        const seconds = Math.floor((gameTime % 60000) / 1000);
        document.getElementById('timeDisplay').textContent = 
            `시간: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // 체력바
        const healthPercent = (this.player.hp / this.player.maxHp) * 100;
        document.getElementById('healthFill').style.width = healthPercent + '%';
        document.getElementById('healthText').textContent = `HP: ${this.player.hp}/${this.player.maxHp}`;
        
        // 경험치바
        const expPercent = (this.player.xp / this.player.xpToNext) * 100;
        document.getElementById('expFill').style.width = expPercent + '%';
        document.getElementById('expText').textContent = `XP: ${this.player.xp}/${this.player.xpToNext}`;
        
        // 레벨 및 점수
        document.getElementById('levelDisplay').textContent = `레벨: ${this.player.level}`;
        document.getElementById('scoreDisplay').textContent = `점수: ${this.score}`;
        
        // 레벨업 체크
        if (this.player.xp >= this.player.xpToNext) {
            this.player.levelUp();
            this.showLevelUpModal();
        }
        
        // 업그레이드 정보 표시
        document.getElementById('upgradeWeapon').textContent = this.upgradeWeaponCount;
        document.getElementById('upgradeHp').textContent = this.upgradeHpCount;
        document.getElementById('upgradeSpeed').textContent = this.upgradeSpeedCount;
        // 버프 정보 표시
        const buffInfo = document.getElementById('buffInfo');
        let buffs = [];
        if (this.player.magnetActive) buffs.push(`<div class='buff-active'>자석: ${(this.player.magnetTime/1000).toFixed(1)}s</div>`);
        if (this.player.isInvincible && this.player.invincibilityTime > 0) buffs.push(`<div class='buff-active'>쉴드: ${(this.player.invincibilityTime/1000).toFixed(1)}s</div>`);
        if (this.player.speedBoostActive) buffs.push(`<div class='buff-active'>속도: ${(this.player.speedBoostTime/1000).toFixed(1)}s</div>`);
        if (this.player.cooldownReductionActive) buffs.push(`<div class='buff-active'>쿨타임: ${(this.player.cooldownReductionTime/1000).toFixed(1)}s</div>`);
        if (buffs.length === 0) buffs.push(`<div class='buff-inactive'>활성화된 버프 없음</div>`);
        buffInfo.innerHTML = buffs.join('');
    }
    
    showLevelUpModal() {
        this.isPaused = true;
        document.getElementById('levelUpModal').classList.add('show');
    }
    
    hideLevelUpModal() {
        this.isPaused = false;
        document.getElementById('levelUpModal').classList.remove('show');
    }
    
    showGameClearModal() {
        this.isPaused = true;
        const gameTime = Date.now() - this.gameStartTime;
        const minutes = Math.floor(gameTime / 60000);
        const seconds = Math.floor((gameTime % 60000) / 1000);
        
        document.getElementById('clearTime').textContent = 
            `생존 시간: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('clearScore').textContent = `최종 점수: ${this.score}`;
        document.getElementById('gameClearModal').classList.add('show');
    }
    
    hideGameClearModal() {
        this.isPaused = false;
        document.getElementById('gameClearModal').classList.remove('show');
    }
    
    gameOver() {
        this.isRunning = false;
        const gameTime = Date.now() - this.gameStartTime;
        const minutes = Math.floor(gameTime / 60000);
        const seconds = Math.floor((gameTime % 60000) / 1000);
        
        document.getElementById('survivalTime').textContent = 
            `생존 시간: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('finalScore').textContent = `최종 점수: ${this.score}`;
        document.getElementById('gameOverModal').classList.add('show');
    }
    
    restart() {
        // 모든 모달 숨기기
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        
        // 게임 상태 초기화
        this.monsters = [];
        this.bullets = [];
        this.items = [];
        this.xpOrbs = [];
        this.particles = [];
        this.score = 0;
        this.monsterSpawnRate = 2000;
        this.lastMonsterSpawn = 0;
        
        // 업그레이드/버프 상태 초기화
        this.upgradeWeaponCount = 0;
        this.upgradeHpCount = 0;
        this.upgradeSpeedCount = 0;
        
        // 플레이어 초기화
        this.createPlayer();
        
        // 게임 재시작
        this.start();
    }
    
    togglePause() {
        if (!document.querySelector('.modal.show')) {
            this.isPaused = !this.isPaused;
        }
    }
    
    spawnRandomGroundItem() {
        // 바닥의 랜덤 위치에 아이템 생성
        const margin = 40;
        const x = margin + Math.random() * (this.canvas.width - margin * 2);
        const y = margin + Math.random() * (this.canvas.height - margin * 2);
        this.createItem(x, y);
    }
}

// 플레이어 클래스
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 21;
        this.speed = 200;
        this.hp = 100;
        this.maxHp = 100;
        this.xp = 0;
        this.xpToNext = 100;
        this.level = 1;
        
        // 무기 설정
        this.weaponDamage = 20;
        this.attackCooldown = 1000;
        this.lastAttack = 0;
        
        // 특수 효과
        this.isInvincible = false;
        this.invincibilityTime = 0;
        this.magnetActive = false;
        this.magnetTime = 0;
        this.speedBoostActive = false;
        this.speedBoostTime = 0;
        this.cooldownReductionActive = false;
        this.cooldownReductionTime = 0;
        this.missileDoubleActive = false;
        this.missileDoubleTime = 0;
        this.rapidFireActive = false;
        this.rapidFireTime = 0;
        // 방향 상태
        this.direction = 'down'; // 기본값
    }
    
    update(deltaTime, keys) {
        let dx = 0, dy = 0;
        if (keys['w'] || keys['arrowup']) dy = -1;
        if (keys['s'] || keys['arrowdown']) dy = 1;
        if (keys['a'] || keys['arrowleft']) dx = -1;
        if (keys['d'] || keys['arrowright']) dx = 1;
        // 대각선 이동 정규화
        if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
        // 방향 갱신
        if (dx !== 0 || dy !== 0) {
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 'right' : 'left';
            } else if (Math.abs(dy) > 0) {
                this.direction = dy > 0 ? 'down' : 'up';
            }
        }
        // 속도 부스트 적용
        let currentSpeed = this.speed;
        if (this.speedBoostActive) {
            currentSpeed *= 1.2;
            this.speedBoostTime -= deltaTime;
            if (this.speedBoostTime <= 0) {
                this.speedBoostActive = false;
            }
        }
        // 위치 업데이트
        this.x += dx * currentSpeed * (deltaTime / 1000);
        this.y += dy * currentSpeed * (deltaTime / 1000);
        // 화면 경계 처리
        this.x = Math.max(this.radius, Math.min(800 - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(600 - this.radius, this.y));
        // 무적 시간 처리
        if (this.isInvincible) {
            this.invincibilityTime -= deltaTime;
            if (this.invincibilityTime <= 0) {
                this.isInvincible = false;
            }
        }
        // 자석 효과 처리
        if (this.magnetActive) {
            this.magnetTime -= deltaTime;
            if (this.magnetTime <= 0) {
                this.magnetActive = false;
            }
        }
        // 쿨타임 감소 효과 처리
        if (this.cooldownReductionActive) {
            this.cooldownReductionTime -= deltaTime;
            if (this.cooldownReductionTime <= 0) {
                this.cooldownReductionActive = false;
            }
        }
        if (this.missileDoubleActive) {
            this.missileDoubleTime -= deltaTime;
            if (this.missileDoubleTime <= 0) {
                this.missileDoubleActive = false;
            }
        }
        if (this.rapidFireActive) {
            this.rapidFireTime -= deltaTime;
            if (this.rapidFireTime <= 0) {
                this.rapidFireActive = false;
            }
        }
    }
    
    autoAttack(deltaTime, bullets, monsters, game) {
        const currentTime = Date.now();
        let cooldown = this.attackCooldown;
        
        if (this.cooldownReductionActive) {
            cooldown *= 0.7;
        }
        if (this.rapidFireActive) cooldown *= 0.3;
        
        if (currentTime - this.lastAttack > cooldown) {
            // 가장 가까운 몬스터 찾기
            let closestMonster = null;
            let closestDistance = Infinity;
            
            monsters.forEach(monster => {
                const dx = monster.x - this.x;
                const dy = monster.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestMonster = monster;
                }
            });
            
            if (closestMonster) {
                const dx = closestMonster.x - this.x;
                const dy = closestMonster.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (this.missileDoubleActive) {
                    // 가까운 몬스터 2마리 추적 유도탄
                    let targets = [];
                    if (monsters.length === 1) {
                        targets = [monsters[0], monsters[0]];
                    } else {
                        targets = monsters.slice().sort((a, b) => {
                            const da = Math.hypot(a.x - this.x, a.y - this.y);
                            const db = Math.hypot(b.x - this.x, b.y - this.y);
                            return da - db;
                        }).slice(0, 2);
                    }
                    targets.forEach(target => {
                        const tdx = target.x - this.x;
                        const tdy = target.y - this.y;
                        const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
                        bullets.push(new Bullet(
                            this.x, this.y,
                            tdx / tdist, tdy / tdist,
                            this.weaponDamage,
                            this.rapidFireActive
                        ));
                    });
                } else {
                    bullets.push(new Bullet(
                        this.x, this.y,
                        dx / distance, dy / distance,
                        this.weaponDamage,
                        this.rapidFireActive
                    ));
                }
                // (kiki 위치 임팩트 파티클 제거)
                this.lastAttack = currentTime;
            }
        }
    }
    
    takeDamage(damage) {
        if (!this.isInvincible) {
            this.hp -= damage;
            this.isInvincible = true;
            this.invincibilityTime = 1000; // 1초 무적
        }
    }
    
    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }
    
    gainXP(amount) {
        this.xp += amount;
    }
    
    levelUp() {
        this.level++;
        this.xp -= this.xpToNext;
        this.xpToNext = Math.floor(this.xpToNext * 1.2);
    }
    
    activateMagnet(duration) {
        this.magnetActive = true;
        this.magnetTime = duration;
    }
    
    activateShield(duration) {
        this.isInvincible = true;
        this.invincibilityTime = duration;
    }
    
    activateSpeedBoost(duration) {
        this.speedBoostActive = true;
        this.speedBoostTime = duration;
    }
    
    activateCooldownReduction(duration) {
        this.cooldownReductionActive = true;
        this.cooldownReductionTime = duration;
    }
    
    activateMissileDouble(duration) {
        this.missileDoubleActive = true;
        this.missileDoubleTime = duration;
    }
    
    activateRapidFire(duration) {
        this.rapidFireActive = true;
        this.rapidFireTime = duration;
    }
    
    upgradeWeapon() {
        this.weaponDamage *= 1.1;
    }
    
    render(ctx) {
        ctx.save();
        if (this.isInvincible && Math.floor(Date.now() / 100) % 2) {
            ctx.globalAlpha = 0.5;
        }
        // 방향에 맞는 이미지 선택
        let img = playerImages[this.direction] || playerImages.default;
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(
                img,
                this.x - this.radius, this.y - this.radius,
                this.radius * 2, this.radius * 2
            );
        } else {
            // 기존 도형 fallback
            ctx.fillStyle = '#ff8800';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            // 귀
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(this.x - 8, this.y - 10, 5, 0, Math.PI * 2);
            ctx.arc(this.x + 8, this.y - 10, 5, 0, Math.PI * 2);
            ctx.fill();
            // 눈
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x - 5, this.y - 3, 3, 0, Math.PI * 2);
            ctx.arc(this.x + 5, this.y - 3, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.x - 5, this.y - 3, 1, 0, Math.PI * 2);
            ctx.arc(this.x + 5, this.y - 3, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        // 특수 효과(자석, 속도 등)는 기존대로
        if (this.magnetActive) {
            ctx.strokeStyle = '#4444ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (this.speedBoostActive) {
            ctx.strokeStyle = '#44ff44';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}

// 몬스터 클래스
class Monster {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.frozen = false;
        this.freezeTime = 0;
        switch (type) {
            case 'normal': // 빨간 원
                this.radius = 12;
                this.speed = 80;
                this.hp = 40;
                this.maxHp = 40;
                this.damage = 10;
                this.color = '#ff4444';
                this.xpValue = 10;
                this.scoreValue = 10;
                break;
            case 'fast': // 초록 원
                this.radius = 10;
                this.speed = 150;
                this.hp = 25;
                this.maxHp = 25;
                this.damage = 8;
                this.color = '#44ff44';
                this.xpValue = 15;
                this.scoreValue = 15;
                break;
            case 'tank': // 파란 사각형
                this.radius = 16;
                this.speed = 50;
                this.hp = 100;
                this.maxHp = 100;
                this.damage = 20;
                this.color = '#4444ff';
                this.xpValue = 25;
                this.scoreValue = 25;
                break;
            case 'elite': // 보라 다이아몬드
                this.radius = 15;
                this.speed = 100;
                this.hp = 80;
                this.maxHp = 80;
                this.damage = 15;
                this.color = '#bb44ff';
                this.xpValue = 30;
                this.scoreValue = 30;
                break;
            case 'mini': // 노랑 작은 원
                this.radius = 7;
                this.speed = 120;
                this.hp = 10;
                this.maxHp = 10;
                this.damage = 5;
                this.color = '#ffe066';
                this.xpValue = 5;
                this.scoreValue = 5;
                break;
            case 'spiky': // 주황 삼각형
                this.radius = 13;
                this.speed = 90;
                this.hp = 35;
                this.maxHp = 35;
                this.damage = 12;
                this.color = '#ff9900';
                this.xpValue = 12;
                this.scoreValue = 12;
                break;
            case 'ghost': // 하늘색 반투명 반원
                this.radius = 14;
                this.speed = 70;
                this.hp = 30;
                this.maxHp = 30;
                this.damage = 8;
                this.color = '#66e0ff';
                this.xpValue = 10;
                this.scoreValue = 10;
                break;
        }
    }
    
    update(deltaTime, player) {
        if (this.frozen) {
            this.freezeTime -= deltaTime;
            if (this.freezeTime <= 0) {
                this.frozen = false;
            }
            return;
        }
        
        // 플레이어 추적
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed * (deltaTime / 1000);
            this.y += (dy / distance) * this.speed * (deltaTime / 1000);
        }
    }
    
    takeDamage(damage) {
        this.hp -= damage;
    }
    
    freeze(duration) {
        this.frozen = true;
        this.freezeTime = duration;
    }
    
    render(ctx) {
        ctx.save();
        if (this.frozen) {
            ctx.globalAlpha = 0.5;
            ctx.filter = 'hue-rotate(180deg)';
        }
        const scale = 1.5;
        const drawSize = this.radius * 2 * scale;
        // 이미지가 있으면 drawImage, 아니면 도형 fallback
        const img = monsterImages[this.type];
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(
                img,
                this.x - drawSize / 2, this.y - drawSize / 2,
                drawSize, drawSize
            );
        } else {
            // 기존 도형 fallback (크기도 1.5배)
            switch (this.type) {
                case 'normal': case 'fast': case 'mini':
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'tank':
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.rect(this.x - this.radius * scale, this.y - this.radius * scale, this.radius * 2 * scale, this.radius * 2 * scale);
                    ctx.fill();
                    break;
                case 'elite':
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y - this.radius * scale);
                    ctx.lineTo(this.x + this.radius * scale, this.y);
                    ctx.lineTo(this.x, this.y + this.radius * scale);
                    ctx.lineTo(this.x - this.radius * scale, this.y);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'spiky':
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y - this.radius * scale);
                    ctx.lineTo(this.x + this.radius * scale, this.y + this.radius * scale);
                    ctx.lineTo(this.x - this.radius * scale, this.y + this.radius * scale);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'ghost':
                    ctx.globalAlpha *= 0.5;
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius * scale, Math.PI, 0, false);
                    ctx.lineTo(this.x + this.radius * scale, this.y);
                    ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI, true);
                    ctx.closePath();
                    ctx.fill();
                    break;
            }
        }
        // HP바 (크기는 기존대로)
        if (this.hp < this.maxHp) {
            const barWidth = this.radius * 2 * scale;
            const barHeight = 4;
            const barY = this.y - this.radius * scale - 8;
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
            ctx.fillStyle = '#ff0000';
            const healthPercent = this.hp / this.maxHp;
            ctx.fillRect(this.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
        }
        ctx.restore();
    }
}

// 총알 클래스
class Bullet {
    constructor(x, y, dirX, dirY, damage, isRapid = false) {
        this.x = x;
        this.y = y;
        this.dirX = dirX;
        this.dirY = dirY;
        this.speed = isRapid ? 1440 : 720;
        this.radius = 3;
        this.damage = damage;
    }
    
    update(deltaTime) {
        this.x += this.dirX * this.speed * (deltaTime / 1000);
        this.y += this.dirY * this.speed * (deltaTime / 1000);
    }
    
    render(ctx) {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// XP 오브 클래스
class XPOrb {
    constructor(x, y, value, orbType = 1) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.radius = 6 + orbType * 2; // 단계별 크기 차이
        this.collectRadius = 40;
        this.type = orbType; // 1,2,3
        // 포인트 오브 생성 특수효과(아이템과 동일한 원형 외곽선, 색상만 다르게)
        this.ringPulseTime = 0;
        // 오브별 외곽선 색상 지정
        const ringColors = ['#ffe066', '#ffaa00', '#00cfff'];
        this.effectRingColor = ringColors[this.type - 1] || '#ffe066';
        // 기존 파티클 효과 제거
    }
    
    update(deltaTime, player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (player.magnetActive || distance < this.collectRadius) {
            const speed = player.magnetActive ? 300 : 200;
            this.x += (dx / distance) * speed * (deltaTime / 1000);
            this.y += (dy / distance) * speed * (deltaTime / 1000);
        }
        // 외곽선 효과 애니메이션 타이머
        this.ringPulseTime += deltaTime;
    }
    
    render(ctx) {
        // 모든 XP 오브 이미지를 동일한 크기로 고정 (28x28)
        const drawRadius = 14;
        const img = xpOrbImages[this.type - 1];
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(
                img,
                this.x - drawRadius, this.y - drawRadius,
                drawRadius * 2, drawRadius * 2
            );
        } else {
            // fallback: 단계별 색상
            const colors = ['#00ff00', '#ffaa00', '#00cfff'];
            ctx.fillStyle = colors[this.type - 1] || '#00ff00';
            ctx.beginPath();
            ctx.arc(this.x, this.y, drawRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        // 아이템과 유사한 외곽선 특수효과(색상만 다르게)
        ctx.save();
        const pulse = Math.sin(this.ringPulseTime / 200) * 0.2 + 1.1;
        ctx.strokeStyle = this.effectRingColor;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(this.x, this.y, drawRadius * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

// 아이템 클래스
class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 14.4; // 기존 12에서 20% 증가
        this.life = 30000; // 30초 후 사라짐
        this.pulseTime = 0;
    }
    
    update(deltaTime) {
        this.life -= deltaTime;
        this.pulseTime += deltaTime;
    }
    
    render(ctx) {
        const pulse = Math.sin(this.pulseTime / 200) * 0.2 + 1;
        const currentRadius = this.radius * pulse;
        ctx.save();
        // 아이템 이미지가 있으면 drawImage, 없으면 도형 fallback
        const img = itemImages[this.type];
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(
                img,
                this.x - currentRadius, this.y - currentRadius,
                currentRadius * 2, currentRadius * 2
            );
        } else {
            // 기존 도형 fallback
            switch (this.type) {
                case 'heal': ctx.fillStyle = '#ff4444'; break;
                case 'magnet': ctx.fillStyle = '#4444ff'; break;
                case 'shield': ctx.fillStyle = '#44ffff'; break;
                case 'weapon_upgrade': ctx.fillStyle = '#ff8800'; break;
                case 'speed': ctx.fillStyle = '#44ff44'; break;
                case 'cooldown': ctx.fillStyle = '#ff44ff'; break;
                case 'bomb': ctx.fillStyle = '#ffff00'; break;
                case 'timestop': ctx.fillStyle = '#8844ff'; break;
                case 'random_box': ctx.fillStyle = '#ffffff'; break;
                case 'coin': ctx.fillStyle = '#ffaa00'; break;
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        // 사각형 특수효과
        ctx.save();
        const squarePulse = Math.sin(this.pulseTime / 200) * 0.2 + 1.1;
        ctx.strokeStyle = '#66ccff'; // 파란색 계열
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.8;
        const side = currentRadius * squarePulse * 2;
        ctx.beginPath();
        ctx.rect(this.x - side/2, this.y - side/2, side, side);
        ctx.stroke();
        ctx.restore();
        ctx.restore();
    }
}

// 파티클 클래스
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 200;
        this.vy = (Math.random() - 0.5) * 200;
        this.life = 1000;
        this.maxLife = 1000;
        this.color = color;
        this.radius = Math.random() * 1 + 1; // 1~2로 작게
    }
    
    update(deltaTime) {
        this.x += this.vx * (deltaTime / 1000);
        this.y += this.vy * (deltaTime / 1000);
        this.life -= deltaTime;
        this.vx *= 0.98;
        this.vy *= 0.98;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 게임 시작
let game;
window.addEventListener('load', () => {
    game = new Game();
}); 