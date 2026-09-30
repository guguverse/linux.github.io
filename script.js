const input = document.getElementById('command-input');
const terminalBody = document.getElementById('terminal-body');
const terminal = document.getElementById('terminal');
const trayIcon = document.getElementById('tray-icon');
const easyDesktop = document.getElementById('easy-desktop');
const easyIcons = document.getElementById('easy-icons');
const easyCloseBtn = document.getElementById('easy-close');

// История команд
let history = [];
let historyIndex = -1;

// Виртуальная файловая система
let fileSystem = {
    'readme.txt': 'Это простой Linux-терминал на HTML/CSS/JS!',
    'notes.md': '# Мои заметки\n- Изучить Linux\n- Сделать проект'
};

// ==================== КНОПКИ УПРАВЛЕНИЯ ОКНОМ ====================
document.getElementById('btn-close').addEventListener('click', (e) => {
    e.stopPropagation();
    // Закрываем вкладку
    window.close();
    // Если браузер не даёт закрыть (например, вкладка открыта вручную) — показываем сообщение
    setTimeout(() => {
        document.body.innerHTML = `
            <div style="color:#00ff41; font-family: monospace; text-align:center; padding:50px;">
                <h1>Сессия завершена.</h1>
                <p>Вкладку можно закрыть вручную.</p>
                <p style="color:#ffbd2e; cursor:pointer;" onclick="location.reload()">[ Нажмите здесь для перезапуска ]</p>
            </div>`;
    }, 100);
});

document.getElementById('btn-minimize').addEventListener('click', (e) => {
    e.stopPropagation();
    terminal.classList.remove('maximized');
    terminal.classList.add('minimized');
    trayIcon.classList.add('visible');
});

document.getElementById('btn-maximize').addEventListener('click', (e) => {
    e.stopPropagation();
    terminal.classList.toggle('maximized');
    setTimeout(() => input.focus(), 300);
});

// Восстановление из свёрнутого состояния
trayIcon.addEventListener('click', () => {
    terminal.classList.remove('minimized');
    trayIcon.classList.remove('visible');
    setTimeout(() => input.focus(), 100);
});

// ==================== ВЫВОД В ТЕРМИНАЛ ====================
function printLine(text, className = '') {
    const div = document.createElement('div');
    div.className = 'line ' + className;
    div.innerHTML = text;
    terminalBody.appendChild(div);
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== КОМАНДЫ ====================
const commands = {
    help: () => {
        printLine('<span class="info">Доступные команды:</span>');
        printLine('  help        - показать этот список');
        printLine('  ls          - список файлов');
        printLine('  pwd         - текущая директория');
        printLine('  whoami      - текущий пользователь');
        printLine('  date        - текущая дата и время');
        printLine('  echo [x]    - вывести текст');
        printLine('  cat [f]     - показать содержимое файла');
        printLine('  touch [f]   - создать файл');
        printLine('  rm [f]      - удалить файл');
        printLine('  uname       - информация о системе');
        printLine('  neofetch    - информация о системе (красиво)');
        printLine('  github      - открыть GitHub профиль');
        printLine('  easy linux  - открыть рабочий стол с ярлыками');
        printLine('  clear       - очистить терминал');
    },
    ls: () => {
        const files = Object.keys(fileSystem);
        if (files.length === 0) printLine('(пусто)');
        else printLine(files.map(f => `<span class="info">${f}</span>`).join('   '));
    },
    pwd: () => printLine('/home/user'),
    whoami: () => printLine('user'),
    date: () => printLine(new Date().toString()),
    uname: () => printLine('Linux web-terminal 5.15.0 #1 SMP x86_64 GNU/Linux'),
    clear: () => { terminalBody.innerHTML = ''; },
    neofetch: () => {
        printLine('<span class="info">        .--.        </span>  <span class="highlight">user@linux</span>');
        printLine('<span class="info">       |o_o |       </span>  -----------');
        printLine('<span class="info">       |:_/ |       </span>  OS: WebLinux 1.1');
        printLine('<span class="info">      //   \\ \\      </span>  Kernel: 5.15.0-web');
        printLine('<span class="info">     (|     | )     </span>  Shell: bash 5.1');
        printLine('<span class="info">    /\'\\_   _/`\\    </span>  Resolution: ' + window.innerWidth + 'x' + window.innerHeight);
        printLine('<span class="info">    \\___)=(___/    </span>  Terminal: HTML5');
    },
    echo: (args) => printLine(args.join(' ') || ''),
    cat: (args) => {
        if (!args[0]) return printLine('cat: не указан файл', 'error');
        if (fileSystem[args[0]] !== undefined) {
            printLine(fileSystem[args[0]].replace(/\n/g, '<br>'));
        } else {
            printLine(`cat: ${args[0]}: Нет такого файла`, 'error');
        }
    },
    touch: (args) => {
        if (!args[0]) return printLine('touch: не указано имя файла', 'error');
        if (fileSystem[args[0]] !== undefined) return printLine(`touch: ${args[0]} уже существует`, 'error');
        fileSystem[args[0]] = '';
        printLine(`Файл "${args[0]}" создан.`);
    },
    rm: (args) => {
        if (!args[0]) return printLine('rm: не указан файл', 'error');
        if (fileSystem[args[0]] !== undefined) {
            delete fileSystem[args[0]];
            printLine(`Файл "${args[0]}" удалён.`);
        } else {
            printLine(`rm: ${args[0]}: Нет такого файла`, 'error');
        }
    },
    // === НОВАЯ КОМАНДА: github ===
    github: () => {
        printLine('Открываю <span class="highlight">https://github.com/guguverse</span> ...');
        setTimeout(() => {
            window.open('https://github.com/guguverse', '_blank');
        }, 400);
    }
};

// === Обработка составной команды "easy linux" ===
function handleEasyLinux() {
    printLine('<span class="info">Запуск Easy Linux...</span>');
    setTimeout(() => {
        openEasyDesktop();
    }, 500);
}

// ==================== РАБОЧИЙ СТОЛ EASY LINUX ====================
// Ярлыки-команды рабочего стола
const desktopApps = [
    { name: 'help',        icon: '?',   cmd: 'help' },
    { name: 'ls',          icon: '📁',  cmd: 'ls' },
    { name: 'pwd',         icon: '📍',  cmd: 'pwd' },
    { name: 'whoami',      icon: '👤',  cmd: 'whoami' },
    { name: 'date',        icon: '📅',  cmd: 'date' },
    { name: 'uname',       icon: '🐧',  cmd: 'uname' },
    { name: 'neofetch',    icon: '🖥️', cmd: 'neofetch' },
    { name: 'github',      icon: '🐙',  cmd: 'github' },
    { name: 'echo',        icon: '💬',  cmd: 'echo Hello from Easy Linux!' },
    { name: 'cat readme',  icon: '📄',  cmd: 'cat readme.txt' },
    { name: 'touch test',  icon: '➕',  cmd: 'touch test.txt' },
    { name: 'rm test',     icon: '🗑️', cmd: 'rm test.txt' },
    { name: 'clear',       icon: '🧹',  cmd: 'clear' },
    { name: 'help',        icon: '❓',  cmd: 'help' }
];

function buildEasyDesktop() {
    easyIcons.innerHTML = '';
    desktopApps.forEach(app => {
        const div = document.createElement('div');
        div.className = 'easy-icon';
        div.innerHTML = `
            <div class="easy-icon-img">${app.icon}</div>
            <div class="easy-icon-label">${app.name}</div>
        `;
        div.addEventListener('click', () => {
            runDesktopCommand(app.cmd);
        });
        easyIcons.appendChild(div);
    });
}

function openEasyDesktop() {
    buildEasyDesktop();
    easyDesktop.classList.add('visible');
}

function closeEasyDesktop() {
    easyDesktop.classList.remove('visible');
    setTimeout(() => input.focus(), 100);
}

easyCloseBtn.addEventListener('click', closeEasyDesktop);

// Запуск команды с рабочего стола
function runDesktopCommand(cmdString) {
    closeEasyDesktop();

    // Печатаем эхо команды в терминал
    printLine(`<span style="color:#00ff41;">user@linux:~$</span> ${escapeHtml(cmdString)}`);

    const parts = cmdString.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    if (commands[cmd]) {
        commands[cmd](args);
    } else {
        printLine(`${cmd}: команда не найдена.`, 'error');
    }
    printLine('&nbsp;');
}

// ==================== ОБРАБОТКА ВВОДА ====================
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const raw = input.value.trim();
        if (!raw) return;

        history.push(raw);
        historyIndex = history.length;

        printLine(`<span style="color:#00ff41;">user@linux:~$</span> ${escapeHtml(raw)}`);

        // Проверяем составную команду "easy linux"
        const lower = raw.toLowerCase().replace(/\s+/g, ' ').trim();
        if (lower === 'easy linux') {
            handleEasyLinux();
            printLine('&nbsp;');
            input.value = '';
            return;
        }

        const parts = raw.split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);

        if (commands[cmd]) {
            commands[cmd](args);
        } else {
            printLine(`${cmd}: команда не найдена. Введите <span class="highlight">help</span>.`, 'error');
        }

        printLine('&nbsp;');
        input.value = '';
    }

    // История (стрелки ↑ ↓)
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            input.value = history[historyIndex];
        }
    }
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
            historyIndex++;
            input.value = history[historyIndex];
        } else {
            historyIndex = history.length;
            input.value = '';
        }
    }
});

// Клик по терминалу — фокус на input
document.querySelector('.terminal').addEventListener('click', () => {
    if (!terminal.classList.contains('minimized')) input.focus();
});

// Горячие клавиши: ESC закрывает Easy Linux
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && easyDesktop.classList.contains('visible')) {
        closeEasyDesktop();
    }
});

input.focus();