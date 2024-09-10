const commands = new Map();

function getRandomEmoji() {
    const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

function addEmojiToMessage(message) {
    return `${message} [${getRandomEmoji()}]`;
}

// function generateRandomString(length = 5) {
//     return randomBytes(length).toString('hex');
// }

async function sendMessageWithAntiSpamMeasures(message, content) {
    const modifiedContent = addEmojiToMessage(content);
    await message.reply(modifiedContent);
}

// コマンドを登録する関数
function registerCommand(name, handler) {
    commands.set(name, handler);
}

// 初期コマンドの登録
registerCommand('!ping', async (message) => {
    await sendMessageWithAntiSpamMeasures(message, "pong!");
});

registerCommand('!権限', async (message, client) => {
    if (message.author.mid === process.env.OWNER_MID) {
        await sendMessageWithAntiSpamMeasures(message, "Hi Owner :)");
    }
});

// 新しいコマンドの追加
registerCommand('!time', async (message) => {
    const currentTime = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    await sendMessageWithAntiSpamMeasures(message, `現在の日時は ${currentTime} です。`);
});

// エクスポート
export { commands, registerCommand, sendMessageWithAntiSpamMeasures };

