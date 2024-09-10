import { Client } from "@evex/linejs";
import { RateLimitter } from "@evex/linejs/rate-limit";
import { FileStorage } from "@evex/linejs/storage";
import { LINE_OBS } from "@evex/linejs/utils";
import { exec } from "child_process";
import dotenv from "dotenv";
import fs, { watch } from 'fs';
import fetch from "node-fetch";
import { promisify } from "util";

dotenv.config();

// ポリフィルの追加
if (!Promise.withResolvers) {
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

// 定数とユーティリティ関数
const DATA_DIR = './data';
const GITHUB_API_URL = "https://api.github.com/repos/evex-dev/linejs/releases/latest";
const LINE_OBS_URL = "https://obs.line-scdn.net/";
const LINE_ENDPOINT = "gw.line.naver.jp";
const execAsync = promisify(exec);

// オプション設定
const AUTO_INSTALL = process.env.AUTO_INSTALL === 'true';
const AUTO_UPDATE_LINEJS = process.env.AUTO_UPDATE_LINEJS === 'true';

/**
 * データディレクトリの作成
 */
function createDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

/**
 * クライアントの初期化
 * @returns {Client} 初期化されたクライアント
 */
function initializeClient() {
    const storage = new FileStorage(`${DATA_DIR}/${process.env.OWNER_MID}.json`);
    const client = new Client({
        storage,
        LINE_OBS: new LINE_OBS(LINE_OBS_URL),
        endpoint: LINE_ENDPOINT,
        customFetch: async (url, options) => {
            return fetch(url, {
                ...options,
                // ...proxyAgent // プロキシを使用する場合はコメントを解除
            });
        },
        squareRateLimitter: new RateLimitter(4, 2000)
    });
    return client;
}

/**
 * イベントハンドラの設定
 * @param {Client} client - クライアントインスタンス
 */
function setupEventHandlers(client) {
    client.on("pincall", handlePincall);
    client.on("ready", handleReady.bind(client));
    client.on("message", handleMessage.bind(client));
    client.on("square:message", handleSquareMessage.bind(client));
    client.on("update:cert", handleCertUpdate.bind(client));
    client.on("update:authtoken", handleAuthTokenUpdate.bind(client));
}

/**
 * Pincallハンドラ
 * @param {string} pincode - 受信したPINコード
 */
function handlePincall(pincode) {
    console.log(`Received pincode: ${pincode}`);
}

/**
 * Readyハンドラ
 * @param {Object} user - ログインしたユーザー情報
 */
async function handleReady(user) {
    console.log(`Logged in as ${user.displayName} (${user.mid})`);
    const profile = await this.getProfile();
    console.log(JSON.stringify(profile, null, 2)); // プロフィールを整形して出力
}

/**
 * 証明書更新ハンドラ
 * @param {string} cert - 更新された証明書
 */
function handleCertUpdate(cert) {
    console.log("Certificate updated:", cert);
    this.storage.set("cert", cert);
}

/**
 * 認証トークン更新ハンドラ
 * @param {string} authtoken - 更新された認証トークン
 */
function handleAuthTokenUpdate(authtoken) {
    console.log("AuthToken updated");
    this.storage.set("authtoken", authtoken);
    console.log("New authToken saved:", authtoken);
}

/**
 * 最新バージョンの取得
 * @returns {Promise<string>} 最新のバージョン番号
 */
async function getLatestVersion() {
    const response = await fetch(GITHUB_API_URL);
    const data = await response.json();
    return data.tag_name;
}

/**
 * ライブラリの更新確認と更新
 */
async function checkAndUpdateLibrary() {
    if (!AUTO_UPDATE_LINEJS) {
        console.log("Auto-update for @evex/linejs is disabled.");
        return;
    }

    try {
        const latestVersion = await getLatestVersion();
        const { stdout: currentVersion } = await execAsync("npm list @evex/linejs version --json");
        const currentVersionData = JSON.parse(currentVersion);
        const currentLibVersion = currentVersionData.dependencies["@evex/linejs"].version;

        if (currentLibVersion !== latestVersion) {
            console.log(`Updating @evex/linejs to the latest version (${latestVersion})...`);
            const { stdout, stderr } = await execAsync("npm update @evex/linejs");
            console.log(stderr ? `Update stderr: ${stderr}` : `Library update stdout: ${stdout}`);
        } else {
            console.log(`@evex/linejs is already up to date. (Current version: ${currentLibVersion})`);
        }
    } catch (error) {
        console.error(`Error checking or updating library: ${error.message}`);
    }
}

/**
 * 自動インストール
 */
async function autoInstall() {
    if (!AUTO_INSTALL) {
        console.log("Auto-install is disabled.");
        return;
    }

    try {
        console.log("Running auto-install...");
        const { stdout, stderr } = await execAsync("node install_packages.js");
        console.log(stdout);
        if (stderr) console.error(stderr);
    } catch (error) {
        console.error("Error during auto-install:", error.message);
    }
}

/**
 * ログイン処理
 * @param {Client} client - クライアントインスタンス
 */
async function login(client) {
    try {
        const authtoken = client.storage.get("authtoken");
        if (authtoken) {
            try {
                await client.login({ authToken: authtoken });
                console.log("Logged in successfully using stored authToken.");
                return;
            } catch (authError) {
                console.log("Failed to login with stored authToken. Trying email/password login.");
                // 保存されたauthtokenでのログインに失敗した場合、
                // authtokenを削除して新しいログインを試みる
                client.storage.delete("authtoken");
            }
        }

        // Email/パスワードでのログイン
        const currentDate = new Date();
        const pincode = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        await client.login({
            email: process.env.LINE_EMAIL,
            password: process.env.LINE_PASSWORD,
            device: process.env.LINE_DEVICE,
            pincode: pincode
        });
        console.log("Logged in successfully using email/password.");
    } catch (error) {
        if (error.message.includes("ABUSE_BLOCK")) {
            console.error("ABUSE_BLOCK error detected. Your account may be temporarily blocked.");
            const userInput = await askUser("Do you want to stop the program? (Y/N): ");
            if (userInput.toLowerCase() === 'y') {
                console.log("Stopping the program...");
                process.exit(1);
            } else {
                console.log("Continuing the program...");
            }
        } else {
            console.error("Login error:", error.message);
            throw error;
        }
    }
}

/**
 * ユーザー入力を受け取る関数（Y/Nのみ）
 * @param {string} question - ユーザーに表示する質問
 * @returns {Promise<string>} ユーザーの回答（'y' または 'n'）
 */
function askUser(question) {
    return new Promise((resolve) => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        function askAgain() {
            readline.question(question, (answer) => {
                const lowercaseAnswer = answer.toLowerCase();
                if (lowercaseAnswer === 'y' || lowercaseAnswer === 'n') {
                    readline.close();
                    resolve(lowercaseAnswer);
                } else {
                    console.log("Invalid input. Please enter Y or N.");
                    askAgain();
                }
            });
        }

        askAgain();
    });
}

let commandModule;

// コマンドモジュールを動的に読み込む関数
async function loadCommands() {
    try {
        // キャッシュを無効化するためにタイムスタンプを追加
        const module = await import(`./commands.js?update=${Date.now()}`);
        commandModule = module;
        console.log("Commands reloaded");
    } catch (error) {
        console.error("Error loading commands:", error);
    }
}

// メッセージハンドラ
async function handleMessage(message) {
    if (message.author.mid !== this.user?.mid) return;

    // コマンドを再読み込み
    await loadCommands();

    const commandName = message.content.split(' ')[0];
    if (commandModule && commandModule.commands.has(commandName)) {
        await commandModule.commands.get(commandName)(message, this);
    }
}

// スクエアメッセージハンドラ
async function handleSquareMessage(message) {
    if (await message.isMyMessage()) {
        await handleMessage.call(this, message);
    }
}

/**
 * メイン処理
 */
async function main() {
    createDataDirectory();
    await autoInstall();
    await checkAndUpdateLibrary();
    await loadCommands();

    const client = initializeClient();
    setupEventHandlers(client);

    const cert = client.storage.get("cert");
    if (cert) {
        client.registerCert(cert);
    }

    await login(client);

    // commands.jsファイルの変更を監視
    watch('./commands.js', async (eventType, filename) => {
        if (filename) {
            console.log(`commands.js has been modified. Reloading...`);
            await loadCommands();
        }
    });

    // 定期的にコマンドを再読み込み
    setInterval(loadCommands, 5000); // 5秒ごとに再読み込み
}

main().catch(error => console.error("Error:", error));