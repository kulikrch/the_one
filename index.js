class Game {
    constructor() {
        this.map = [];
        this.hero = { x: 0, y: 0, health: 100, damage: 10 };
        this.enemies = [];
        this.classMap = {
            tile: 'tile',
            enemy: 'tile tileE',
            health: 'tile tileHP',
            hero: 'tile tileP',
            sword: 'tile tileSW',
            wall: 'tile tileW'
        };
        this.col = 40;
        this.row = 24;
        this._useLoop(0, this.row, 0, this.col,
            (
                (i) => this.map[i] = []
            ),
            (
                (i, j) => this.map[i][j] = this.classMap.tile
            )
        );
    } 
  
    // Инициализация игры
    init() {
        this.fillMapWithWall();
        this.placeRoomsAndPassages();
        // Размещаем 2 меча
        this.placeRandomItems(this.classMap.sword, 2);
        // Размещаем 10 зелий здоровья
        this.placeRandomItems(this.classMap.health, 10);
        // Размещаем 1 героя
        this.placeRandomItems(this.classMap.hero, 1);
        // Размещаем 10 противников
        this.placeRandomItems(this.classMap.enemy, 10);
        // Добавляем обработчик событий для нажатия клавиш
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    _useLoop(iStart, iEnd, jStart, jEnd, callbackI, callbackJ) {
        for (let i = iStart; i < iEnd; i++) {
            callbackI(i);
            for (let j = jStart; j < jEnd; j++) {
                callbackJ(i, j);
            }
        }
    }

    _randomNumber(from, max) {
        return Math.floor(Math.random() * max) + from;
    }

    _changeElement(i, j, className, health = 100) {
        let tileElement = document.getElementById(i + '-' + j);
        tileElement.innerHTML = "";
        tileElement.className = className;
        this.map[i][j] = className;

        if (this._isHero(className) || this._isEnemy(className)) {
            tileElement.appendChild(this._healthChild(health));
        }
    }

    _healthChild(health) {
        let healthElement = document.createElement('div');
        healthElement.className = 'health';
        healthElement.style.width = health + '%';

        return healthElement;
    }

    _isHero(className) {
        return className === this.classMap.hero;
    }

    _isEnemy(className) {
        return className === this.classMap.enemy;
    }

    _isHealth(className) {
        return className === this.classMap.health;
    }

    _isSword(className) {
        return className === this.classMap.sword;
    }

    _isWall(className) {
        return className === this.classMap.wall;
    }

    _isTile(className) {
        return className === this.classMap.tile;
    }

    _getAvailableCells() {
        let availableCells = [];
      
        this._useLoop(0, this.row, 0, this.col, (() => {}),
            (
                (i, j) => {
                    if (this._isTile(this.map[i][j])) {
                        availableCells.push({ x: j, y: i });
                    }
                }
            )
        );
      
        return availableCells;
    };

    fillMapWithWall() {
        let fieldElement = document.querySelector('.field');

        this._useLoop(0, this.row, 0, this.col, (() => {}),
            (
                (i, j) => {
                    // Добавляем элемент как стену
                    let tileElement = document.createElement('div');
                    tileElement.className = this.classMap.wall;
                    tileElement.id = i + '-' + j;
                    this.map[i][j] = this.classMap.wall;

                    fieldElement.appendChild(tileElement);
                }
            )
        );
    }

    placeRoomsAndPassages() {
        // Создаем пустой стек для хранения координат
        let stack = [];
        // Случайное количество комнат от 5 до 10
        let numRooms = this._randomNumber(5, 10 - 5 + 1);

        for (let k = 0; k < numRooms; k++) {
            // Случайная ширина от 3 до 8
            let roomWidth = this._randomNumber(3, 8 - 3 + 1);
            // Случайная высота от 3 до 8
            let roomHeight = this._randomNumber(3, 8 - 3 + 1);
            // Координаты
            let x = this._randomNumber(0, 40 - roomWidth);
            let y = this._randomNumber(0, 24 - roomHeight);
            
            stack.push({ x, y });

            this._useLoop(y, y + roomHeight, x, x + roomWidth, (() => {}), ((i, j) => this._changeElement(i, j, this.classMap.tile)));
        }

        // Размещаем случайное количество вертикальных проходов
        let numVerticalPassages = this._randomNumber(3, 5 - 3 + 1);
        // Случайная координата x
        let xRandom = [];

        for (let i = 0; i < numVerticalPassages; i++) {
            xRandom.push(this._randomNumber(0, this.col));
        }

        this._useLoop(0, numVerticalPassages, 0, this.row, (() => {}), ((i, j) => this._changeElement(j, xRandom[i], this.classMap.tile)));

        // Размещаем случайное количество горизонтальных проходов
        let numHorizontalPassages = Math.floor(Math.random() * (5 - 3 + 1)) + 3;
        // Случайная координата y
        let yRandom = [];

        for (let i = 0; i < numHorizontalPassages; i++) {
            yRandom.push(this._randomNumber(0, this.row));
        }
        
        this._useLoop(0, numHorizontalPassages, 0, this.col, (() => {}), ((i, j) => this._changeElement(yRandom[i], j, this.classMap.tile)));

        // Реализация алгоритма Recursive Backtracking для проходов
        // Решает проблему недостигаемых пространств

        while (stack.length > 0) {
            // Получаем текущую точку из вершины стека
            let current = stack[stack.length - 1];

            // Получаем соседей текущей точки
            let neighbors = this.getUnvisitedNeighbors(current.x, current.y);

            if (neighbors.length > 0) {
                // Если есть непосещенные соседи, выбираем одного из них
                let next = neighbors[this._randomNumber(0, neighbors.length - 1)];

                // Создаем проход между текущей точкой и выбранным соседом
                this._changeElement((current.y + next.y) / 2, (current.x + next.x) / 2, this.classMap.tile);

                // Помечаем выбранного соседа как посещенного и добавляем его в стек
                this._changeElement(next.y, next.x, this.classMap.tile);
                stack.push({ x: next.x, y: next.y });
            } else {
                // Если у текущей точки нет непосещенных соседей, удаляем ее из стека
                stack.pop();
            }
        }
    }

    getUnvisitedNeighbors(x, y) {
        // Возвращает массив непосещенных соседей для указанных координат
        let neighbors = [];
    
        if (x > 1 && this._isWall(this.map[y][x - 2])) {
            neighbors.push({ x: x - 2, y: y });
        }
        if (x < this.col - 2 && this._isWall(this.map[y][x + 2])) {
            neighbors.push({ x: x + 2, y: y });
        }
        if (y > 1 && this._isWall(this.map[y - 2][x])) {
            neighbors.push({ x: x, y: y - 2 });
        }
        if (y < this.row - 2 && this._isWall(this.map[y + 2][x])) {
            neighbors.push({ x: x, y: y + 2 });
        }
    
        return neighbors;
    }

    placeRandomItems(itemClass, itemCount) {
        let availableCells = this._getAvailableCells();
      
        // Размещаем предметы случайным образом
        for (let i = 0; i < itemCount; i++) {
            let randomIndex = this._randomNumber(0, availableCells.length);
            let cell = availableCells[randomIndex];

            this._changeElement(cell.y, cell.x, itemClass);

            if (this._isEnemy(itemClass)) {
                this.enemies.push({
                    x: cell.x,
                    y: cell.y,
                    health: 100
                });
            }

            if (this._isHero(itemClass)) {
                this.hero.x = cell.x;
                this.hero.y = cell.y;
            }
        
            // Удаляем использованную клетку из доступных
            availableCells.splice(randomIndex, 1);
        }
    }

    handleKeyPress(event) {
        // Получаем код клавиши из события
        if (!this.hero) {
            return;
        }
        let keyCode = event.keyCode;
        let moved = false;
        let [x, y] = [this.hero.x, this.hero.y];

        // Обрабатываем движение героя в зависимости от кода клавиши
        switch (keyCode) {
            case 38: // вверх
                [moved, x, y] = this.movePerson(this.hero.x, this.hero.y, 0, -1, this.classMap.hero, this.hero.health);
                break;
            case 37: // влево
                [moved, x, y] = this.movePerson(this.hero.x, this.hero.y, -1, 0, this.classMap.hero, this.hero.health);
                break;
            case 40: // вниз
                [moved, x, y] = this.movePerson(this.hero.x, this.hero.y, 0, 1, this.classMap.hero, this.hero.health);
                break;
            case 39: // вправо
                [moved, x, y] = this.movePerson(this.hero.x, this.hero.y, 1, 0, this.classMap.hero, this.hero.health);
                break;
            case 32: // удар
                this.attackEnemies();
                moved = true;
                break;
        }

        if (moved) {
            this.hero.x = x;
            this.hero.y = y;
            this.enemyAction();
        }
    }

    attackEnemies() {
        // Получаем координаты текущего положения героя
        let heroX = this.hero.x;
        let heroY = this.hero.y;

        // Проверяем наличие противников вокруг героя
        Array.from(this.enemies).forEach((enemy, index) => {
            if (this.isAdjacent(heroX, heroY, enemy.x, enemy.y)) {
                // Если противник на соседней клетке, наносим урон
                enemy.health -= this.hero.damage;
                this.enemies[index].health = enemy.health;

                // Проверяем, не убит ли противник
                if (enemy.health <= 0) {
                    // Убираем противника из массива и из карты
                    this.enemies.splice(index, 1);
                    this._changeElement(enemy.y, enemy.x, this.classMap.tile);
                } else {
                    // Обновляем здоровье противника на карте
                    this._changeElement(enemy.y, enemy.x, this.classMap.enemy, enemy.health);
                }
            }
        });
    }

    isAdjacent(x1, y1, x2, y2) {
        // Проверяет, находятся ли две клетки рядом
        return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;
    }

    movePerson(x, y, dx, dy, classPerson, health) {      
        // Проверяем, не выходит ли за границы карты
        let newX = (x + dx + this.col) % this.col;
        let newY = (y + dy + this.row) % this.row;
        
        if (this.canMoveTo(newX, newY, classPerson)) {
            // Перемещаем на новую позицию
            if (this._isHealth(this.map[newY][newX]) && this.hero.health < 100) {
                this.hero.health += 10;
                health = this.hero.health;
            }
            
            if (this._isSword(this.map[newY][newX])) {
                this.hero.damage += 10;
            }

            this._changeElement(y, x, this.classMap.tile);
            this._changeElement(newY, newX, classPerson, health);

            return [true, newX, newY];
        }

        return [false, newX, newY];
    }

    enemyAction() {
        Array.from(this.enemies).forEach((enemy, index) => {
            let action = this._randomNumber(0, 5);
            let moved = false;
            let x, y = 0;

            switch (action) {
                case 0: // вверх
                    [moved, x, y] = this.movePerson(enemy.x, enemy.y, 0, -1, this.classMap.enemy, enemy.health);
                    break;
                case 1: // влево
                    [moved, x, y] = this.movePerson(enemy.x, enemy.y, -1, 0, this.classMap.enemy, enemy.health);
                    break;
                case 2: // вниз
                    [moved, x, y] = this.movePerson(enemy.x, enemy.y, 0, 1, this.classMap.enemy, enemy.health);
                    break;
                case 3: // вправо
                    [moved, x, y] = this.movePerson(enemy.x, enemy.y, 1, 0, this.classMap.enemy, enemy.health);
                    break;
                case 4: // удар
                    this.attackHero(enemy.x, enemy.y);
                    break;
            }

            if (moved) {
                this.enemies[index].x = x;
                this.enemies[index].y = y;
            }
        });
    }

    attackHero(enemyX, enemyY) {
        // Проверяем наличие героя вокруг
        if (this.isAdjacent(this.hero.x, this.hero.y, enemyX, enemyY)) {
            // Если герой на соседней клетке, наносим урон
            this.hero.health -= 10;

            // Проверяем, не убит ли противник
            if (this.hero.health > 0) {
                // Обновляем здоровье героя на карте
                this._changeElement(this.hero.y, this.hero.x, this.classMap.hero, this.hero.health);
            }
            else {
                this._changeElement(this.hero.y, this.hero.x, this.classMap.tile);
                this.hero = null;
            }
        }
    }

    canMoveTo(x, y, person) {
        // Проверяем, можно ли переместиться на указанные координаты
        let tile = this.map[y][x];
      
        // Проверка на стену или противника
        if (this._isWall(tile) || this._isEnemy(tile) || this._isHero(tile) || (this._isEnemy(person) && (this._isHealth(tile) || this._isSword(tile)))) {
            return false;
        }
      
        return true;
    }
}