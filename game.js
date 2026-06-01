const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayHint = document.getElementById("overlayHint");
const overlayGrid = document.getElementById("overlayGrid");
const overlayConfirm = document.getElementById("overlayConfirm");
const manualOpen = document.getElementById("manualOpen");
const manualOverlay = document.getElementById("manualOverlay");
const manualClose = document.getElementById("manualClose");
const languageToggle = document.getElementById("languageToggle");
const statusText = document.getElementById("statusText");
const subStatusText = document.getElementById("subStatusText");
const stageText = document.getElementById("stageText");
const timerText = document.getElementById("timerText");
const timerFill = document.getElementById("timerFill");
const deckText = document.getElementById("deckText");
const skillBadges = document.getElementById("skillBadges");
const augmentTrack = document.getElementById("augmentTrack");
const actionPrompt = document.getElementById("actionPrompt");
const resultOverlay = document.getElementById("resultOverlay");
const resultParticles = document.getElementById("resultParticles");
const resultEyebrow = document.getElementById("resultEyebrow");
const resultTitle = document.getElementById("resultTitle");
const resultPattern = document.getElementById("resultPattern");
const resultScore = document.getElementById("resultScore");
const resultBinds = document.getElementById("resultBinds");
const resultTiles = document.getElementById("resultTiles");
const resultRestart = document.getElementById("resultRestart");
const resultClose = document.getElementById("resultClose");
const skillDetailOverlay = document.getElementById("skillDetailOverlay");
const skillDetailTier = document.getElementById("skillDetailTier");
const skillDetailIcon = document.getElementById("skillDetailIcon");
const skillDetailName = document.getElementById("skillDetailName");
const skillDetailDesc = document.getElementById("skillDetailDesc");
const skillDetailClose = document.getElementById("skillDetailClose");
const actionBar = document.querySelector(".actions");
const actionButtons = {
  win: document.querySelector('[data-action="win"]'),
  pass: document.querySelector('[data-action="pass"]'),
  vitality: document.querySelector('[data-action="vitality"]'),
  cookie: document.querySelector('[data-action="cookie"]'),
  restart: document.querySelector('[data-action="restart"]')
};

const LANG_STORAGE_KEY = "hexMahjongLanguage";
let currentLang = localStorage.getItem(LANG_STORAGE_KEY) || "zh";
if (!["zh", "en"].includes(currentLang)) currentLang = "zh";

const i18n = {
  zh: {
    langToggle: "EN",
    title: "海克斯麻将 H5",
    canvasLabel: "海克斯麻将牌桌",
    overlay: {
      cityTitle: "选择城邦",
      cityHint: "第一层全局规则会改变整局节奏。",
      augmentTitle: count => `海克斯强化 ${count}/${MAX_HEX_SKILLS}`,
      augmentInitial: "开局三选一，确定你的第一条运营路线。",
      augmentStage: "阶段奖励：从三项强化中选择一个，改变接下来的牌局。",
      confirm: "开始游戏",
      manual: "玩法说明"
    },
    manual: {
      eyebrow: "海克斯麻将 H5",
      title: "玩法说明",
      close: "关闭玩法说明",
      sections: [
        ["一局怎么玩", "先选城邦，再选海克斯。开局后你和 3 名 AI 轮流摸牌、出牌，满足牌型时点击胡牌。第 1、3、6 轮会获得海克斯强化，最多持有 3 个。"],
        ["牌与操作", ["牌组包含筒、条、万三种花色，每种 1 到 9，每张 4 份。", "混子可以补缺失点数、对子或刻子；右上角城邦/海克斯详情会列出本局每个混子对应的具体牌。", "点击手牌选中，再点同一张即可打出；倒计时结束会自动出牌。", "底部只显示当前可用操作：胡牌、过牌、活力、拆牌、重开。"]],
        ["城邦规则", ["净水监狱：传统规则，无海克斯，适合先熟悉摸打。", "皮尔特沃夫金库：每轮筹码主题，当前保留为强化入口。", "祖安实验室：加入城邦额外混子，成型更快但 AI 也更危险。", "艾欧尼亚道场：只能胡清一色，需要提前规划花色。", "诺克萨斯角斗场：点炮惩罚主题，当前保留为后续结算扩展。", "班德尔城传送门：每 3 轮随机和一名 AI 交换一张手牌。"]],
        ["海克斯强化", ["饼干海克斯：主动，每 3 轮一次，将 3 以上的筒/条拆成两张 1 和一张余数牌。", "混子成双：被动，额外加入一张指定混子牌，可在右上角详情查看。", "千丝增幅器、铜墙铁饼、万法归宗：经济型海克斯，立即获得对应花色 3 张牌。", "活力再生：主动，弃两张孤牌换摸两张，冷却 2 轮。", "全能吸血：反应型路线展示，后续会扩展拿牌效果。"]],
        ["胡牌公式", ["公式符号：AAA=三张一样，ABC=同花色连续三张，XX=对子，J=混子。", "标准理解：4 组牌 + 1 对，例如 AAA + BBB + ABC + ABC + XX。当前原型用更快的牌型判定来适配 H5 节奏。", "清一色大成：同一花色覆盖 1-9，例如 1筒2筒3筒...9筒；缺口可用 J 补。", "七对子：XX + XX + XX + XX + XX + XX + XX，J + J 也能算一对。", "四刻成型：AAA + BBB + CCC + DDD；AA + J 或 A + J + J 可补刻。", "偏门成势：同一花色牌 + J >= 10，作为低门槛成型出口。", "羁绊额外加分：万法归一、千丝万缕、圆满无缺、三花聚顶、四喜临门。"]],
        ["对局提示", ["右上角海克斯徽章可以点击查看详情。", "可拆、将弃、新摸牌会在手牌上高亮。", "底部胶囊提示会展示当前可胡、可拆或活力换牌结果。", "结算会展示最终牌型、分数、触发羁绊和最终手牌。"]]
      ]
    },
    suits: { character: "筒", bamboo: "条", wan: "万" },
    joker: (suit, rank) => `混(${suit}${rank})`,
    players: { human: "你", ai: index => `AI ${index}` },
    cities: {
      pureWaterPrison: ["净水监狱", "传统麻将，无海克斯可选。"],
      piltoverVault: ["皮尔特沃夫金库", "每轮所有玩家额外获得1个基础筹码。"],
      zaunLab: ["祖安实验室", "加入一张指定城邦混子，高风险高回报。"],
      ioniaDojo: ["艾欧尼亚道场", "只能胡清一色，迫使你提前规划。"],
      noxusArena: ["诺克萨斯角斗场", "点炮惩罚翻倍，出牌更刺激。"],
      bandleCityPortal: ["班德尔城传送门", "每三轮随机交换手牌，局势会变。"]
    },
    skills: {
      cookie: ["饼干海克斯", "主动：每3轮一次，将条/筒数字3以上的牌拆成三张。"],
      jokerDouble: ["混子成双", "被动：额外加入一张指定混子牌。"],
      thousandSilk: ["千丝增幅器", "经济：立即获得3张条子，帮助千丝万缕羁绊成型。"],
      bronzeWall: ["铜墙铁饼", "经济：立即获得3张筒子，朝圆满无缺方向运营。"],
      tenThousandLaw: ["万法归宗", "经济：立即获得3张万字，强化万法归一路线。"],
      vitalityRegen: ["活力再生", "主动：弃两张孤牌换两张，冷却2轮。"],
      lifeSteal: ["全能吸血", "反应：后续版本可拿取他人弃牌，当前提供羁绊分。"]
    },
    tiers: { "棱彩": "棱彩", "黄金": "黄金", "白银": "白银" },
    types: { active: "主动", economy: "经济", passive: "被动", reaction: "反应", resource: "资源" },
    actions: { win: "胡牌", pass: "过牌", vitality: "活力", cookie: "拆牌", restart: "重开", auto: "托管出牌", changeCity: "换城邦" },
    hud: { city: "城邦", augment: "海克斯", battle: "对局", gameOver: "终局", ready: "准备", deck: count => `牌山 ${count}` },
    messages: {
      chooseCity: "选择城邦",
      citySub: "城邦 -> 海克斯 -> 羁绊",
      chooseAugment: "选择海克斯",
      yourTurn: "你的回合",
      selectCityFirst: "先选择城邦",
      cityFirstSub: "城邦是第一层全局规则",
      startSub: city => `${city} | 点击手牌选择，再点一次出牌`,
      drawSub: tile => `摸到 ${tile} | 点击手牌出牌`,
      playerDiscard: (name, tile) => `${name}打出 ${tile}`,
      deckRound: (deck, round) => `牌山 ${deck} | 第 ${round} 轮`,
      drawGame: "流局",
      deckEmpty: "牌山已空",
      won: (name, pattern) => `${name}胡了：${pattern}`,
      triggered: names => `触发 ${names}`,
      score: score => `得分 ${score}`,
      basicWin: "基础胡牌",
      defeat: "惜败",
      victory: "胜利",
      resultEnd: "终局",
      bandle: "班德尔城传送门",
      exchange: target => `你和 AI ${target} 交换了一张手牌`,
      selectTile: tile => `选择 ${tile}`,
      selectTileSub: "再点一次出牌，或点拆牌/胡牌",
      timeout: "倒计时结束",
      autoDiscard: tile => `自动打出 ${tile}`,
      autoPass: "托管出牌",
      autoPassSub: tile => `打出 ${tile}，进入下一家`,
      cannotWin: "暂时不能胡",
      cannotWinSub: "继续运营羁绊和海克斯",
      starting: "正在开始游戏",
      startingSub: "正在发牌和生成海克斯牌局",
      startFail: "开局失败",
      gotSkill: (skill, tile) => `获得 ${skill}，摸到 ${tile}`
    },
    prompts: {
      win: (pattern, detail) => `可胡：${pattern}，${detail}`,
      winBasic: score => `基础分 ${score}`,
      cookie: (source, results) => `可拆：${source} -> ${results}`,
      vitality: (tiles, draws) => `可用活力：弃 ${tiles} -> 摸 ${draws} 张`
    },
    patterns: { flush: "清一色大成", pairs: "七对子", triples: "四刻成型", offSuit: "偏门成势" },
    binds: { wan: "万法归一", bamboo: "千丝万缕", character: "圆满无缺", threeFlowers: "三花聚顶", fourJoy: "四喜临门" },
    tileHints: { readySplit: "可拆", willSplit: "将拆", willDiscard: "将弃", draw2: "摸2", new: "新", joker: "混", wildcard: "万能" },
    jokerPanel: {
      title: "本局混子",
      fixed: "固定混子",
      city: "城邦额外混子",
      hex: "海克斯额外混子",
      copies: count => `${count} 张`,
      none: "无额外混子"
    },
    errors: {
      vitalityInactive: "活力再生未激活",
      chooseSkillFirst: "选择该海克斯后才能使用",
      vitalityCooldown: left => `还需 ${left} 轮`,
      vitalityCooling: "活力再生冷却中",
      vitalityFail: "活力再生失败",
      notEnough: "手牌或牌山不足",
      vitalityDone: "弃两张换两张",
      cookieInactive: "饼干海克斯未激活",
      cookieCooling: "饼干海克斯冷却中",
      cookieInvalid: "这张牌不能拆",
      cookieInvalidSub: "饼干只能拆3以上的条/筒",
      cookieDone: "饼干海克斯",
      cookieDoneSub: text => `${text}，冷却3轮`
    }
  },
  en: {
    langToggle: "中",
    title: "Hex Mahjong H5",
    canvasLabel: "Hex Mahjong table",
    overlay: {
      cityTitle: "Choose City-State",
      cityHint: "Pick the global rule that shapes this run.",
      augmentTitle: count => `Hex Augment ${count}/${MAX_HEX_SKILLS}`,
      augmentInitial: "Choose one opening augment to define your route.",
      augmentStage: "Stage reward: choose one of three augments.",
      confirm: "Start Game",
      manual: "How to Play"
    },
    manual: {
      eyebrow: "Hex Mahjong H5",
      title: "How to Play",
      close: "Close rules",
      sections: [
        ["Core Loop", "Choose a city-state, then choose augments. You and 3 AI players draw and discard in turn. Win when your hand satisfies a pattern. Augments appear on rounds 1, 3, and 6; you can hold up to 3."],
        ["Tiles & Controls", ["The deck has Dots, Bamboo, and Wan, ranks 1-9, four copies each.", "Jokers fill missing ranks, pairs, or triplets; top-right city/augment details list the exact tile behind every joker this game.", "Tap a tile to select it, tap it again to discard. If time runs out, a tile is discarded automatically.", "The bottom bar only shows actions currently available."]],
        ["City-State Rules", ["Purewater Prison: classic rules, no augments.", "Piltover Vault: economy theme, reserved for future chip systems.", "Zaun Lab: adds a city bonus joker, faster hands for everyone.", "Ionia Dojo: only flush-style wins are allowed.", "Noxus Arena: discard penalty theme, reserved for future scoring.", "Bandle Portal: every 3 rounds, swap one random tile with an AI."]],
        ["Hex Augments", ["Cookie Hex: active, once every 3 rounds, split a Dot/Bamboo tile rank 3+ into two 1s and a remainder tile.", "Joker Double: passive, adds one specified joker tile; review it from the top-right details.", "Silk Amplifier, Bronze Wall, and Ten Thousand Law are economy augments that grant 3 suited tiles.", "Vitality Regen: active, discard two isolated tiles and draw two, cooldown 2 rounds.", "Omnivamp: reaction route preview, future version will expand steal effects."]],
        ["Winning Formula", ["Symbols: AAA = triplet, ABC = same-suit sequence, XX = pair, J = joker.", "Standard shape: 4 groups + 1 pair, such as AAA + BBB + ABC + ABC + XX. This prototype uses faster pattern checks for H5 pacing.", "Full Flush: one suit covers ranks 1-9, such as Dot1-Dot9; J can fill missing ranks.", "Seven Pairs: XX + XX + XX + XX + XX + XX + XX; J + J can count as one pair.", "Four Triplets: AAA + BBB + CCC + DDD; AA + J or A + J + J can complete a triplet.", "Off-Suit Momentum: same-suit tiles + J >= 10, a lower-threshold win route.", "Traits add bonus score: suit routes, Three Flowers, and Four Joy."]],
        ["Game Tips", ["Click the augment badges on the top right to review details.", "Splittable, discard-targeted, and newly drawn tiles are highlighted.", "The bottom prompt previews win, split, or vitality outcomes.", "The result screen shows pattern, score, traits, and final hand."]]
      ]
    },
    suits: { character: "Dot", bamboo: "Bamboo", wan: "Wan" },
    joker: (suit, rank) => `Joker(${suit}${rank})`,
    players: { human: "You", ai: index => `AI ${index}` },
    cities: {
      pureWaterPrison: ["Purewater Prison", "Classic mahjong. No augments."],
      piltoverVault: ["Piltover Vault", "All players gain 1 base chip each round."],
      zaunLab: ["Zaun Lab", "Adds an extra fixed joker tile. High risk, high reward."],
      ioniaDojo: ["Ionia Dojo", "Only flush wins are allowed. Plan early."],
      noxusArena: ["Noxus Arena", "Discard penalties are doubled."],
      bandleCityPortal: ["Bandle Portal", "Every 3 rounds, hands get shuffled by a swap."]
    },
    skills: {
      cookie: ["Cookie Hex", "Active: once every 3 rounds, split a Dot/Bamboo tile rank 3+ into three tiles."],
      jokerDouble: ["Joker Double", "Passive: adds one extra specified joker tile."],
      thousandSilk: ["Silk Amplifier", "Economy: gain 3 Bamboo tiles to build the Silk route."],
      bronzeWall: ["Bronze Wall", "Economy: gain 3 Dot tiles to build the Perfect Circle route."],
      tenThousandLaw: ["Ten Thousand Law", "Economy: gain 3 Wan tiles to build the Wan route."],
      vitalityRegen: ["Vitality Regen", "Active: discard two isolated tiles and draw two. Cooldown 2 rounds."],
      lifeSteal: ["Omnivamp", "Reaction: future versions can take discards; currently adds trait pressure."]
    },
    tiers: { "棱彩": "Prismatic", "黄金": "Gold", "白银": "Silver" },
    types: { active: "Active", economy: "Economy", passive: "Passive", reaction: "Reaction", resource: "Resource" },
    actions: { win: "Win", pass: "Pass", vitality: "Vitality", cookie: "Split", restart: "Restart", auto: "Auto discard", changeCity: "Change city" },
    hud: { city: "City", augment: "Augment", battle: "Battle", gameOver: "Game Over", ready: "Ready", deck: count => `Deck ${count}` },
    messages: {
      chooseCity: "Choose City-State",
      citySub: "City -> Hex -> Traits",
      chooseAugment: "Choose Augment",
      yourTurn: "Your Turn",
      selectCityFirst: "Choose a city first",
      cityFirstSub: "City-states are the global rule layer",
      startSub: city => `${city} | Tap a tile, then tap again to discard`,
      drawSub: tile => `Drew ${tile} | Tap a tile to discard`,
      playerDiscard: (name, tile) => `${name} discarded ${tile}`,
      deckRound: (deck, round) => `Deck ${deck} | Round ${round}`,
      drawGame: "Draw",
      deckEmpty: "Deck is empty",
      won: (name, pattern) => `${name} won: ${pattern}`,
      triggered: names => `Triggered ${names}`,
      score: score => `Score ${score}`,
      basicWin: "Base Win",
      defeat: "Defeat",
      victory: "Victory",
      resultEnd: "End",
      bandle: "Bandle Portal",
      exchange: target => `You swapped one tile with AI ${target}`,
      selectTile: tile => `Selected ${tile}`,
      selectTileSub: "Tap again to discard, or use Split/Win",
      timeout: "Time is up",
      autoDiscard: tile => `Auto discarded ${tile}`,
      autoPass: "Auto discard",
      autoPassSub: tile => `Discarded ${tile}; next player`,
      cannotWin: "Cannot win yet",
      cannotWinSub: "Keep building traits and augments",
      starting: "Starting game",
      startingSub: "Dealing tiles and preparing augments",
      startFail: "Failed to start",
      gotSkill: (skill, tile) => `Gained ${skill}, drew ${tile}`
    },
    prompts: {
      win: (pattern, detail) => `Ready: ${pattern}, ${detail}`,
      winBasic: score => `base ${score}`,
      cookie: (source, results) => `Can split: ${source} -> ${results}`,
      vitality: (tiles, draws) => `Vitality: discard ${tiles} -> draw ${draws}`
    },
    patterns: { flush: "Full Flush", pairs: "Seven Pairs", triples: "Four Triplets", offSuit: "Off-Suit Momentum" },
    binds: { wan: "Ten Thousand Unity", bamboo: "Silken Threads", character: "Perfect Circle", threeFlowers: "Three Flowers", fourJoy: "Four Joy" },
    tileHints: { readySplit: "Split", willSplit: "Split", willDiscard: "Discard", draw2: "Draw 2", new: "New", joker: "Joker", wildcard: "Wild" },
    jokerPanel: {
      title: "Jokers This Game",
      fixed: "Fixed Joker",
      city: "City Bonus Joker",
      hex: "Augment Bonus Joker",
      copies: count => `${count} tile${count > 1 ? "s" : ""}`,
      none: "No bonus joker"
    },
    errors: {
      vitalityInactive: "Vitality Regen inactive",
      chooseSkillFirst: "Choose this augment first",
      vitalityCooldown: left => `${left} rounds left`,
      vitalityCooling: "Vitality cooling down",
      vitalityFail: "Vitality failed",
      notEnough: "Not enough tiles or deck",
      vitalityDone: "Discard two, draw two",
      cookieInactive: "Cookie Hex inactive",
      cookieCooling: "Cookie Hex cooling down",
      cookieInvalid: "This tile cannot split",
      cookieInvalidSub: "Cookie only splits Dot/Bamboo rank 3+",
      cookieDone: "Cookie Hex",
      cookieDoneSub: text => `${text}, cooldown 3 rounds`
    }
  }
};

function tr(path, ...args) {
  const value = path.split(".").reduce((object, key) => object?.[key], i18n[currentLang]);
  return typeof value === "function" ? value(...args) : value;
}

function joinList(items) {
  return items.join(currentLang === "zh" ? "、" : ", ");
}

const suits = [
  { id: "character", name: "筒", color: "#252a2f" },
  { id: "bamboo", name: "条", color: "#16823f" },
  { id: "wan", name: "万", color: "#426eea" }
];

const cityStates = [
  { id: "pureWaterPrison", name: "净水监狱", color: "#2f4f4f", desc: "传统麻将，无海克斯可选。", hex: false, art: 0 },
  { id: "piltoverVault", name: "皮尔特沃夫金库", color: "#b8860b", desc: "每轮所有玩家额外获得1个基础筹码。", chipBonus: 1, hex: true, art: 1 },
  { id: "zaunLab", name: "祖安实验室", color: "#8b38cc", desc: "加入一张指定城邦混子，高风险高回报。", jokerBonus: true, hex: true, art: 2 },
  { id: "ioniaDojo", name: "艾欧尼亚道场", color: "#228b22", desc: "只能胡清一色，迫使你提前规划。", onlyFlush: true, hex: true, art: 3 },
  { id: "noxusArena", name: "诺克萨斯角斗场", color: "#c72d3e", desc: "点炮惩罚翻倍，出牌更刺激。", discardPenalty: 2, hex: true, art: 4 },
  { id: "bandleCityPortal", name: "班德尔城传送门", color: "#0faeb5", desc: "每三轮随机交换手牌，局势会变。", exchange: true, hex: true, art: 5 }
];

const hexSkills = [
  { id: "cookie", name: "饼干海克斯", color: "#d9367a", icon: "拆", tier: "棱彩", desc: "主动：每3轮一次，将条/筒数字3以上的牌拆成三张。", type: "active" },
  { id: "jokerDouble", name: "混子成双", color: "#8b5bd6", icon: "混", tier: "黄金", desc: "被动：额外加入一张指定混子牌。", type: "passive" },
  { id: "thousandSilk", name: "千丝增幅器", color: "#228b22", icon: "条", tier: "白银", desc: "经济：立即获得3张条子，帮助千丝万缕羁绊成型。", suit: "bamboo", type: "economy" },
  { id: "bronzeWall", name: "铜墙铁饼", color: "#b97835", icon: "筒", tier: "白银", desc: "经济：立即获得3张筒子，朝圆满无缺方向运营。", suit: "character", type: "economy" },
  { id: "tenThousandLaw", name: "万法归宗", color: "#4169e1", icon: "万", tier: "白银", desc: "经济：立即获得3张万字，强化万法归一路线。", suit: "wan", type: "economy" },
  { id: "vitalityRegen", name: "活力再生", color: "#e65f3a", icon: "活", tier: "黄金", desc: "主动：弃两张孤牌换两张，冷却2轮。", type: "active" },
  { id: "lifeSteal", name: "全能吸血", color: "#a62f42", icon: "吸", tier: "黄金", desc: "反应：后续版本可拿取他人弃牌，当前提供羁绊分。", type: "reaction" }
];

const MAX_HEX_SKILLS = 3;
const AUGMENT_ROUNDS = [1, 3, 6];
const TURN_SECONDS = 18;

const state = {
  phase: "city",
  city: null,
  selectedSkills: [],
  deck: [],
  players: [],
  currentPlayer: 0,
  round: 0,
  discards: [],
  selectedTileId: null,
  lastDrawn: null,
  message: "选择城邦",
  subMessage: "城邦 -> 海克斯 -> 羁绊",
  tileRects: [],
  discardRects: [],
  scores: [0, 0, 0, 0],
  jokerRules: [],
  lastVitalityRound: -99,
  lastCookieRound: -99,
  started: false,
  augmentDraftsTaken: 0,
  pendingAugmentRound: null,
  currentAugmentOffers: [],
  timerRemaining: 0,
  turnDeadline: null,
  lastTimerBeep: null
};

let lastStartRequestAt = 0;
let turnTimerId = null;
let audioContext = null;
let audioMaster = null;

const assets = {
  table: loadImage("./assets/city-sheet.jpg"),
  citySheet: loadImage("./assets/table-bg.jpg")
};

function loadImage(src) {
  const image = new Image();
  image.src = src;
  image.addEventListener("load", render);
  return image;
}

function makeTile(suit, rank, isJoker = false) {
  return {
    id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    suit,
    rank,
    isJoker
  };
}

function tileName(tile) {
  if (!tile) return "";
  const suit = suitName(tile.suit);
  if (tile.isJoker) return tr("joker", suit, tile.rank);
  return currentLang === "zh" ? `${suit}${tile.rank}` : `${tile.rank} ${suit}`;
}

function suitName(suitId) {
  return i18n[currentLang].suits[suitId] || suitId;
}

function cityName(city) {
  return i18n[currentLang].cities[city.id]?.[0] || city.name;
}

function cityDesc(city) {
  return i18n[currentLang].cities[city.id]?.[1] || city.desc;
}

function skillName(skillOrId) {
  const id = typeof skillOrId === "string" ? skillOrId : skillOrId?.id;
  return i18n[currentLang].skills[id]?.[0] || hexSkills.find(item => item.id === id)?.name || id;
}

function skillDesc(skillOrId) {
  const id = typeof skillOrId === "string" ? skillOrId : skillOrId?.id;
  return i18n[currentLang].skills[id]?.[1] || hexSkills.find(item => item.id === id)?.desc || "";
}

function tierName(tier) {
  return i18n[currentLang].tiers[tier] || tier;
}

function playerName(index) {
  return index === 0 ? tr("players.human") : tr("players.ai", index);
}

function patternName(patternId) {
  return i18n[currentLang].patterns[patternId] || patternId;
}

function bindName(bindId) {
  return i18n[currentLang].binds[bindId] || bindId;
}

function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (let rank = 1; rank <= 9; rank += 1) {
      for (let copy = 0; copy < 4; copy += 1) deck.push(makeTile(suit.id, rank));
    }
  }

  state.jokerRules = createJokerRules();
  for (const rule of state.jokerRules) {
    for (let i = 0; i < rule.copies; i += 1) {
      deck.push(makeTile(rule.suit, rule.rank, true));
    }
  }
  return shuffle(deck);
}

function createJokerRules() {
  const rules = [
    { source: "fixed", suit: "character", rank: 5, copies: 2 }
  ];

  if (state.city?.jokerBonus) {
    rules.push({ source: "city", suit: "bamboo", rank: 5, copies: 1, cityId: state.city.id });
  }

  if (state.selectedSkills.includes("jokerDouble")) {
    rules.push({ source: "hex", suit: "wan", rank: 5, copies: 1, skillId: "jokerDouble" });
  }

  return rules;
}

function jokerRuleLabel(rule) {
  const sourceLabels = {
    fixed: tr("jokerPanel.fixed"),
    city: tr("jokerPanel.city"),
    hex: tr("jokerPanel.hex")
  };
  return `${sourceLabels[rule.source] || rule.source}: ${tileName(rule)} (${tr("jokerPanel.copies", rule.copies)})`;
}

function jokerRulesText() {
  const rules = state.jokerRules.length ? state.jokerRules : createJokerRules();
  return rules.map(jokerRuleLabel).join(currentLang === "zh" ? "\n" : "\n");
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function sortHand(hand) {
  return [...hand].sort((a, b) => {
    if (a.isJoker !== b.isJoker) return a.isJoker ? 1 : -1;
    if (a.suit !== b.suit) return suits.findIndex(item => item.id === a.suit) - suits.findIndex(item => item.id === b.suit);
    return a.rank - b.rank;
  });
}

function startGame() {
  if (!state.city) {
    setMessage(tr("messages.selectCityFirst"), tr("messages.cityFirstSub"));
    showCitySelection();
    return;
  }

  stopTurnTimer();
  state.deck = createDeck();
  state.players = Array.from({ length: 4 }, (_, index) => ({
    name: playerName(index),
    isAI: index > 0,
    hand: [],
    skills: index === 0 ? [...state.selectedSkills] : []
  }));
  state.currentPlayer = 0;
  state.round = 1;
  state.discards = [];
  state.selectedTileId = null;
  state.lastVitalityRound = -99;
  state.lastCookieRound = -99;
  state.scores = [0, 0, 0, 0];
  state.started = true;
  state.lastTimerBeep = null;

  for (let count = 0; count < 13; count += 1) {
    for (const player of state.players) {
      player.hand.push(state.deck.pop());
    }
  }
  applySuitBonusSkills();
  drawFromDeck(0);

  state.phase = "playing";
  hideOverlay();
  playSound("start");
  setMessage(tr("messages.yourTurn"), tr("messages.startSub", cityName(state.city)));
  renderBadges();
  startPlayerTurnTimer();
  render();
}

function applySuitBonusSkills() {
  const player = state.players[0];
  for (const skillId of state.selectedSkills) {
    const skill = hexSkills.find(item => item.id === skillId);
    if (!skill?.suit) continue;
    for (let i = 0; i < 3; i += 1) {
      const index = state.deck.findIndex(tile => tile.suit === skill.suit && !tile.isJoker);
      if (index >= 0) player.hand.push(state.deck.splice(index, 1)[0]);
    }
  }
}

function drawFromDeck(playerIndex) {
  if (!state.deck.length) return false;
  const tile = state.deck.pop();
  state.players[playerIndex].hand.push(tile);
  state.lastDrawn = tile;
  if (playerIndex === 0) playSound("draw");
  return true;
}

function discardTile(playerIndex, tileId) {
  const player = state.players[playerIndex];
  const index = player.hand.findIndex(tile => tile.id === tileId);
  if (index < 0) return false;
  const [tile] = player.hand.splice(index, 1);
  state.discards.push({ tile, playerIndex });
  state.selectedTileId = null;
  playSound(playerIndex === 0 ? "discard" : "aiDiscard");
  setMessage(tr("messages.playerDiscard", playerName(playerIndex), tileName(tile)), tr("messages.deckRound", state.deck.length, state.round));
  return true;
}

function nextTurn() {
  stopTurnTimer();
  if (!state.deck.length) {
    state.phase = "gameOver";
    playSound("end");
    setMessage(tr("messages.drawGame"), tr("messages.deckEmpty"));
    render();
    return;
  }
  state.currentPlayer = (state.currentPlayer + 1) % 4;
  if (state.currentPlayer === 0) {
    state.round += 1;
    maybeBandleExchange();
    if (shouldOfferAugment()) {
      showAugmentSelection({ resume: true });
      return;
    }
  }
  drawFromDeck(state.currentPlayer);
  render();
  if (state.players[state.currentPlayer].isAI) {
    window.setTimeout(runAITurn, 420);
  } else {
    setMessage(tr("messages.yourTurn"), tr("messages.drawSub", tileName(state.lastDrawn)));
    startPlayerTurnTimer();
  }
}

function runAITurn() {
  stopTurnTimer();
  const player = state.players[state.currentPlayer];
  const win = checkWin(player.hand);
  if (win && win.score >= 100) {
    endGame(state.currentPlayer, win);
    return;
  }
  const tile = chooseAIDiscard(player.hand);
  discardTile(state.currentPlayer, tile.id);
  render();
  window.setTimeout(nextTurn, 360);
}

function chooseAIDiscard(hand) {
  const sorted = sortHand(hand).filter(tile => !tile.isJoker);
  const counts = countByTile(sorted);
  const isolated = sorted.find(tile => {
    const key = `${tile.suit}-${tile.rank}`;
    const lower = sorted.some(item => item.suit === tile.suit && item.rank === tile.rank - 1);
    const higher = sorted.some(item => item.suit === tile.suit && item.rank === tile.rank + 1);
    return counts.get(key) === 1 && !lower && !higher;
  });
  return isolated || sorted[0] || hand[0];
}

function countByTile(hand) {
  const counts = new Map();
  for (const tile of hand) {
    if (tile.isJoker) continue;
    const key = `${tile.suit}-${tile.rank}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function checkWin(hand) {
  if (hand.length < 14) return null;
  const nonJokers = hand.filter(tile => !tile.isJoker);
  const jokerCount = hand.length - nonJokers.length;
  const suitSet = new Set(nonJokers.map(tile => tile.suit));
  const counts = countByTile(hand);

  if (state.city?.onlyFlush && suitSet.size > 1) return null;

  const binds = checkBinds(hand);
  if (suitSet.size === 1 && hasRanks(nonJokers, [1, 2, 3, 4, 5, 6, 7, 8, 9], jokerCount)) {
    return { id: "flush", score: 260 + bindScore(binds), binds };
  }

  let pairs = 0;
  for (const count of counts.values()) pairs += Math.floor(count / 2);
  pairs += Math.floor(jokerCount / 2);
  if (pairs >= 7) return { id: "pairs", score: 140 + bindScore(binds), binds };

  let triples = 0;
  let freeJokers = jokerCount;
  for (const count of counts.values()) {
    if (count >= 3) triples += 1;
    else if (count + freeJokers >= 3) {
      freeJokers -= 3 - count;
      triples += 1;
    }
  }
  if (triples >= 4) return { id: "triples", score: 120 + bindScore(binds), binds };

  const strongestSuitCount = Math.max(0, ...[...suitSet].map(suit => nonJokers.filter(tile => tile.suit === suit).length));
  if (strongestSuitCount + jokerCount >= 10 && hand.length >= 14) {
    return { id: "offSuit", score: 90 + bindScore(binds), binds };
  }
  return null;
}

function hasRanks(tiles, ranks, jokerCount) {
  const present = new Set(tiles.map(tile => tile.rank));
  const missing = ranks.filter(rank => !present.has(rank)).length;
  return missing <= jokerCount;
}

function checkBinds(hand) {
  const nonJokers = hand.filter(tile => !tile.isJoker);
  const results = [];
  for (const suit of suits) {
    const suitTiles = nonJokers.filter(tile => tile.suit === suit.id);
    if (suitTiles.length >= 11 && hasRanks(suitTiles, [1, 9], hand.length - nonJokers.length)) {
      results.push({ id: suit.id, score: 1000 });
    }
  }
  const suitCounts = suits.map(suit => nonJokers.filter(tile => tile.suit === suit.id).length);
  if (suitCounts.filter(count => count >= 2).length >= 3) results.push({ id: "threeFlowers", score: 50 });
  let pairs = 0;
  for (const count of countByTile(hand).values()) pairs += Math.floor(count / 2);
  if (pairs >= 4) results.push({ id: "fourJoy", score: 30 });
  return results;
}

function bindScore(binds) {
  return binds.reduce((total, bind) => total + bind.score, 0);
}

function endGame(winnerIndex, result) {
  stopTurnTimer();
  state.phase = "gameOver";
  const name = playerName(winnerIndex);
  const pattern = patternName(result.id);
  playSound(winnerIndex === 0 ? "win" : "end");
  setMessage(tr("messages.won", name, pattern), result.binds.length ? tr("messages.triggered", joinList(result.binds.map(bind => bindName(bind.id)))) : tr("messages.score", result.score));
  render();
  showResultOverlay(winnerIndex, result);
}

function showResultOverlay(winnerIndex, result) {
  const isHumanWinner = winnerIndex === 0;
  resultOverlay.hidden = false;
  resultOverlay.classList.toggle("defeat", !isHumanWinner);
  resultEyebrow.textContent = `${state.round}-${state.currentPlayer + 1} ${tr("messages.resultEnd")}`;
  resultTitle.textContent = isHumanWinner ? tr("messages.victory") : tr("messages.defeat");
  resultPattern.textContent = tr("messages.won", playerName(winnerIndex), patternName(result.id));
  resultScore.textContent = `${isHumanWinner ? "+" : ""}${result.score}`;

  resultBinds.innerHTML = "";
  const binds = result.binds.length ? result.binds : [{ id: "basicWin", score: result.score }];
  for (const bind of binds) {
    const item = document.createElement("span");
    item.textContent = `${bind.id === "basicWin" ? tr("messages.basicWin") : bindName(bind.id)} +${bind.score}`;
    resultBinds.appendChild(item);
  }

  resultTiles.innerHTML = "";
  sortHand(state.players[winnerIndex].hand).forEach((tile, index) => {
    const item = document.createElement("span");
    item.className = "result-tile";
    item.style.animationDelay = `${Math.min(index * 0.025, 0.35)}s`;
    item.style.color = tile.isJoker ? "#7a441f" : suits.find(suit => suit.id === tile.suit)?.color || "#252a2f";
    item.textContent = tileName(tile);
    resultTiles.appendChild(item);
  });

  spawnResultParticles(isHumanWinner);
}

function spawnResultParticles(isHumanWinner) {
  resultParticles.innerHTML = "";
  const colors = isHumanWinner ? ["#f3c64e", "#fff4c6", "#51d6ff", "#d9367a"] : ["#51d6ff", "#dff8ff", "#7c8bff"];
  for (let i = 0; i < 46; i += 1) {
    const particle = document.createElement("span");
    particle.className = "result-particle";
    particle.style.setProperty("--angle", `${Math.random() * 360}deg`);
    particle.style.setProperty("--distance", `${160 + Math.random() * 280}px`);
    particle.style.setProperty("--duration", `${0.75 + Math.random() * 0.85}s`);
    particle.style.setProperty("--particle-color", colors[i % colors.length]);
    particle.style.animationDelay = `${Math.random() * 0.26}s`;
    resultParticles.appendChild(particle);
  }
}

function hideResultOverlay() {
  resultOverlay.hidden = true;
}

function maybeBandleExchange() {
  if (!state.city?.exchange || state.round % 3 !== 0) return;
  const target = 1 + Math.floor(Math.random() * 3);
  const mine = randomTile(state.players[0].hand);
  const theirs = randomTile(state.players[target].hand);
  if (!mine || !theirs) return;
  swapTile(0, mine.id, target, theirs.id);
  setMessage(tr("messages.bandle"), tr("messages.exchange", target));
}

function randomTile(hand) {
  return hand[Math.floor(Math.random() * hand.length)];
}

function swapTile(a, aId, b, bId) {
  const handA = state.players[a].hand;
  const handB = state.players[b].hand;
  const indexA = handA.findIndex(tile => tile.id === aId);
  const indexB = handB.findIndex(tile => tile.id === bId);
  if (indexA < 0 || indexB < 0) return;
  [handA[indexA], handB[indexB]] = [handB[indexB], handA[indexA]];
}

function useVitality() {
  if (!state.selectedSkills.includes("vitalityRegen")) {
    setMessage(tr("errors.vitalityInactive"), tr("errors.chooseSkillFirst"));
    return;
  }
  if (state.currentPlayer !== 0 || state.phase !== "playing") return;
  if (state.round - state.lastVitalityRound < 2) {
    setMessage(tr("errors.vitalityCooling"), tr("errors.vitalityCooldown", 2 - (state.round - state.lastVitalityRound)));
    return;
  }
  const player = state.players[0];
  const candidates = sortHand(player.hand).filter(tile => !tile.isJoker).slice(0, 2);
  if (candidates.length < 2 || state.deck.length < 2) {
    setMessage(tr("errors.vitalityFail"), tr("errors.notEnough"));
    return;
  }
  for (const tile of candidates) discardTile(0, tile.id);
  drawFromDeck(0);
  drawFromDeck(0);
  state.lastVitalityRound = state.round;
  playSound("skill");
  setMessage(skillName("vitalityRegen"), tr("errors.vitalityDone"));
  render();
}

function useCookie() {
  if (!state.selectedSkills.includes("cookie")) {
    setMessage(tr("errors.cookieInactive"), tr("errors.chooseSkillFirst"));
    return;
  }
  if (state.round - state.lastCookieRound < 3) {
    setMessage(tr("errors.cookieCooling"), tr("errors.vitalityCooldown", 3 - (state.round - state.lastCookieRound)));
    return;
  }
  const player = state.players[0];
  const tile = player.hand.find(item => item.id === state.selectedTileId);
  if (!tile || tile.isJoker || tile.suit === "wan" || tile.rank < 3) {
    setMessage(tr("errors.cookieInvalid"), tr("errors.cookieInvalidSub"));
    return;
  }
  player.hand = player.hand.filter(item => item.id !== tile.id);
  player.hand.push(makeTile(tile.suit, 1), makeTile(tile.suit, 1), makeTile(tile.suit, tile.rank - 2));
  state.selectedTileId = null;
  state.lastCookieRound = state.round;
  playSound("skill");
  const splitText = `${tileName(tile)} -> ${[makePreviewTile(tile.suit, 1), makePreviewTile(tile.suit, 1), makePreviewTile(tile.suit, tile.rank - 2)].map(tileName).join(currentLang === "zh" ? "、" : ", ")}`;
  setMessage(tr("errors.cookieDone"), tr("errors.cookieDoneSub", splitText));
  render();
}

function renderBadges() {
  skillBadges.innerHTML = "";
  if (state.city) {
    const cityBadge = document.createElement("button");
    cityBadge.className = "badge city-badge";
    cityBadge.type = "button";
    cityBadge.dataset.cityDetail = state.city.id;
    cityBadge.setAttribute("aria-label", currentLang === "zh" ? `查看${cityName(state.city)}规则` : `View ${cityName(state.city)} rules`);
    cityBadge.textContent = cityName(state.city);
    skillBadges.appendChild(cityBadge);
  }
  for (let i = 0; i < MAX_HEX_SKILLS; i += 1) {
    const skillId = state.selectedSkills[i];
    const badge = document.createElement(skillId ? "button" : "span");
    badge.className = skillId ? "badge" : "badge empty";
    if (!skillId) {
      badge.textContent = currentLang === "zh" ? `海克斯槽 ${i + 1}` : `Augment Slot ${i + 1}`;
      skillBadges.appendChild(badge);
      continue;
    }
    const skill = hexSkills.find(item => item.id === skillId);
    badge.type = "button";
    badge.dataset.skillId = skillId;
    badge.setAttribute("aria-label", currentLang === "zh" ? `查看${skillName(skill)}详情` : `View ${skillName(skill)} details`);
    badge.textContent = skillName(skill);
    skillBadges.appendChild(badge);
  }
  updateHud();
}

function showSkillDetail(skillId) {
  const skill = hexSkills.find(item => item.id === skillId);
  if (!skill) return;
  skillDetailTier.textContent = `${tierName(skill.tier)} · ${skillTypeName(skill)}`;
  skillDetailIcon.textContent = skill.icon;
  skillDetailIcon.style.background = `linear-gradient(145deg, ${skill.color}66, rgba(0,0,0,0.22))`;
  skillDetailName.textContent = skillName(skill);
  skillDetailDesc.textContent = skill.id === "jokerDouble"
    ? `${skillDesc(skill)}\n\n${tr("jokerPanel.title")}\n${jokerRulesText()}`
    : skillDesc(skill);
  skillDetailOverlay.hidden = false;
  playSound("select");
}

function showCityDetail() {
  if (!state.city) return;
  skillDetailTier.textContent = currentLang === "zh" ? "城邦规则" : "City-State Rule";
  skillDetailIcon.textContent = currentLang === "zh" ? "城" : "C";
  skillDetailIcon.style.background = `linear-gradient(145deg, ${state.city.color}88, rgba(0,0,0,0.22))`;
  skillDetailName.textContent = cityName(state.city);
  const jokerText = jokerRulesText();
  skillDetailDesc.textContent = `${cityDesc(state.city)}\n\n${tr("jokerPanel.title")}\n${jokerText || tr("jokerPanel.none")}`;
  skillDetailOverlay.hidden = false;
  playSound("select");
}

function skillTypeName(skill) {
  return i18n[currentLang].types[skill.type] || tr("types.resource");
}

function hideSkillDetail() {
  skillDetailOverlay.hidden = true;
}

function showManual() {
  renderManual();
  manualOverlay.hidden = false;
  playSound("select");
}

function hideManual() {
  manualOverlay.hidden = true;
}

function renderManual() {
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
  document.title = tr("title");
  canvas.setAttribute("aria-label", tr("canvasLabel"));
  actionBar.setAttribute("aria-label", currentLang === "zh" ? "游戏操作" : "Game actions");
  augmentTrack.setAttribute("aria-label", currentLang === "zh" ? "海克斯阶段" : "Augment stages");
  languageToggle.textContent = tr("langToggle");
  manualOpen.textContent = tr("overlay.manual");
  overlayConfirm.textContent = tr("overlay.confirm");
  manualClose.setAttribute("aria-label", tr("manual.close"));
  manualOverlay.querySelector(".manual-eyebrow").textContent = tr("manual.eyebrow");
  manualOverlay.querySelector("h2").textContent = tr("manual.title");
  const content = manualOverlay.querySelector(".manual-content");
  content.innerHTML = "";
  for (const [title, body] of tr("manual.sections")) {
    const section = document.createElement("section");
    const heading = document.createElement("h3");
    heading.textContent = title;
    section.appendChild(heading);
    if (Array.isArray(body)) {
      const list = document.createElement("ul");
      for (const text of body) {
        const item = document.createElement("li");
        item.textContent = text;
        list.appendChild(item);
      }
      section.appendChild(list);
    } else {
      const paragraph = document.createElement("p");
      paragraph.textContent = body;
      section.appendChild(paragraph);
    }
    content.appendChild(section);
  }
  resultRestart.textContent = currentLang === "zh" ? "再来一局" : "Play Again";
  resultClose.textContent = currentLang === "zh" ? "查看牌桌" : "View Table";
  skillDetailClose.setAttribute("aria-label", currentLang === "zh" ? "关闭海克斯详情" : "Close augment details");
}

function refreshLanguage() {
  renderManual();
  if (state.phase === "city") {
    showCitySelection();
    return;
  }
  if (state.phase === "augment") {
    renderAugmentSelection({ initial: !state.started, offers: state.currentAugmentOffers });
    return;
  }
  if (state.phase === "playing") {
    if (state.currentPlayer === 0) {
      setMessage(tr("messages.yourTurn"), state.lastDrawn ? tr("messages.drawSub", tileName(state.lastDrawn)) : tr("messages.startSub", cityName(state.city)));
    } else {
      setMessage(`${playerName(state.currentPlayer)} ${tr("hud.battle")}`, tr("messages.deckRound", state.deck.length, state.round));
    }
  }
  renderBadges();
  updateHud();
  render();
}

function toggleLanguage() {
  currentLang = currentLang === "zh" ? "en" : "zh";
  localStorage.setItem(LANG_STORAGE_KEY, currentLang);
  refreshLanguage();
}

function renderAugmentTrack() {
  augmentTrack.innerHTML = "";
  const canUseAugments = state.city?.hex || state.phase === "city";
  augmentTrack.hidden = !canUseAugments;
  if (!canUseAugments) return;

  AUGMENT_ROUNDS.forEach((round, index) => {
    const node = document.createElement("span");
    const chosen = state.selectedSkills[index];
    const isActive = state.phase === "augment" && state.pendingAugmentRound === round;
    const isDone = Boolean(chosen) || (state.round > round && state.selectedSkills.length > index);
    node.className = `track-node${isDone ? " done" : ""}${isActive ? " active" : ""}`;
    const skill = hexSkills.find(item => item.id === chosen);
    node.textContent = skill ? `${round}-1 ${skillName(skill)}` : `${round}-1 ${tr("hud.augment")}`;
    augmentTrack.appendChild(node);
  });
}

function getHumanWinResult() {
  if (state.phase !== "playing" || state.currentPlayer !== 0 || !state.players[0]) return null;
  return checkWin(state.players[0].hand);
}

function getVitalityPlan() {
  if (state.phase !== "playing" || state.currentPlayer !== 0 || !state.players[0]) return null;
  if (!state.selectedSkills.includes("vitalityRegen")) return null;
  if (state.round - state.lastVitalityRound < 2) return null;
  const discards = sortHand(state.players[0].hand).filter(tile => !tile.isJoker).slice(0, 2);
  if (discards.length < 2 || state.deck.length < 2) return null;
  return { discards, draws: 2 };
}

function canUseVitality() {
  return Boolean(getVitalityPlan());
}

function getCookiePlan() {
  if (state.phase !== "playing" || state.currentPlayer !== 0 || !state.players[0]) return null;
  if (!state.selectedSkills.includes("cookie")) return null;
  if (state.round - state.lastCookieRound < 3) return null;
  const tile = state.players[0].hand.find(item => item.id === state.selectedTileId);
  if (!tile || tile.isJoker || tile.suit === "wan" || tile.rank < 3) return null;
  return {
    source: tile,
    results: [
      makePreviewTile(tile.suit, 1),
      makePreviewTile(tile.suit, 1),
      makePreviewTile(tile.suit, tile.rank - 2)
    ]
  };
}

function canUseCookie() {
  return Boolean(getCookiePlan());
}

function makePreviewTile(suit, rank) {
  return { suit, rank, isJoker: false };
}

function setActionDetail(button, label, detail = "") {
  button.querySelector("strong").textContent = label;
  button.querySelector("span").textContent = detail;
}

function actionHintText() {
  const win = getHumanWinResult();
  if (win) return tr("prompts.win", patternName(win.id), win.binds.length ? tr("messages.triggered", joinList(win.binds.map(bind => bindName(bind.id)))) : tr("prompts.winBasic", win.score));

  const cookie = getCookiePlan();
  if (cookie) return tr("prompts.cookie", tileName(cookie.source), joinList(cookie.results.map(tileName)));

  const vitality = getVitalityPlan();
  if (vitality) return tr("prompts.vitality", joinList(vitality.discards.map(tileName)), vitality.draws);

  return "";
}

function updateActionButtons() {
  const isHumanTurn = state.phase === "playing" && state.currentPlayer === 0;
  const win = getHumanWinResult();
  const vitality = getVitalityPlan();
  const cookie = getCookiePlan();
  const hint = actionHintText();

  actionBar.hidden = state.phase === "city" || state.phase === "augment";
  actionButtons.restart.hidden = false;
  actionButtons.pass.hidden = !isHumanTurn;
  actionButtons.win.hidden = !win;
  actionButtons.vitality.hidden = !vitality;
  actionButtons.cookie.hidden = !cookie;

  setActionDetail(actionButtons.pass, tr("actions.pass"), tr("actions.auto"));
  setActionDetail(actionButtons.restart, tr("actions.restart"), tr("actions.changeCity"));
  if (win) setActionDetail(actionButtons.win, tr("actions.win"), `${patternName(win.id)} +${win.score}`);
  if (vitality) setActionDetail(actionButtons.vitality, tr("actions.vitality"), `${joinList(vitality.discards.map(tileName))} -> ${currentLang === "zh" ? "摸2" : "Draw 2"}`);
  if (cookie) setActionDetail(actionButtons.cookie, tr("actions.cookie"), `${tileName(cookie.source)} -> ${joinList(cookie.results.map(tileName))}`);

  actionPrompt.hidden = !hint || actionBar.hidden;
  actionPrompt.textContent = hint;
}

function setMessage(message, subMessage = "") {
  state.message = message;
  state.subMessage = subMessage;
  statusText.textContent = message;
  subStatusText.textContent = subMessage;
  updateHud();
}

function updateHud() {
  const phaseNames = {
    city: `1-1 ${tr("hud.city")}`,
    augment: `${state.pendingAugmentRound || 1}-1 ${tr("hud.augment")}`,
    playing: `${state.round || 1}-${state.currentPlayer + 1} ${tr("hud.battle")}`,
    gameOver: tr("hud.gameOver")
  };
  stageText.textContent = phaseNames[state.phase] || tr("hud.ready");
  deckText.textContent = tr("hud.deck", state.deck?.length ?? "--");
  const pct = state.turnDeadline ? Math.max(0, Math.min(1, state.timerRemaining / TURN_SECONDS)) : 0;
  timerText.textContent = state.turnDeadline ? `${Math.ceil(state.timerRemaining)}` : "--";
  timerFill.style.strokeDashoffset = `${113 * (1 - pct)}`;
  timerFill.style.stroke = pct < 0.28 ? "#ff715b" : pct < 0.55 ? "#f0c552" : "#51d6ff";
  renderAugmentTrack();
  updateActionButtons();
}

function startPlayerTurnTimer() {
  stopTurnTimer();
  if (state.phase !== "playing" || state.currentPlayer !== 0) {
    updateHud();
    return;
  }

  state.timerRemaining = TURN_SECONDS;
  state.turnDeadline = Date.now() + TURN_SECONDS * 1000;
  state.lastTimerBeep = null;
  updateHud();
  turnTimerId = window.setInterval(() => {
    state.timerRemaining = Math.max(0, (state.turnDeadline - Date.now()) / 1000);
    const seconds = Math.ceil(state.timerRemaining);
    if (seconds > 0 && seconds <= 3 && state.lastTimerBeep !== seconds) {
      state.lastTimerBeep = seconds;
      playSound("tick");
    }
    updateHud();
    if (state.timerRemaining <= 0) {
      stopTurnTimer();
      autoDiscardForTimeout();
    }
  }, 180);
}

function stopTurnTimer() {
  if (turnTimerId) {
    window.clearInterval(turnTimerId);
    turnTimerId = null;
  }
  state.turnDeadline = null;
  state.timerRemaining = 0;
  state.lastTimerBeep = null;
  updateHud();
}

function autoDiscardForTimeout() {
  if (state.phase !== "playing" || state.currentPlayer !== 0) return;
  const player = state.players[0];
  const selected = player.hand.find(tile => tile.id === state.selectedTileId);
  const fallback = selected || chooseAIDiscard(player.hand);
  if (!fallback) return;
  discardTile(0, fallback.id);
  setMessage(tr("messages.timeout"), tr("messages.autoDiscard", tileName(fallback)));
  render();
  window.setTimeout(nextTurn, 260);
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  render();
}

function layout() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const landscape = w > h;
  const safeTop = 62;
  const actionReserve = landscape ? 150 : 178;
  return {
    w,
    h,
    landscape,
    tableCenter: { x: w / 2, y: landscape ? h / 2 + 10 : h / 2 - 20 },
    handY: h - actionReserve - 58,
    discardY: landscape ? h / 2 + 10 : h / 2 - 30,
    drawPile: { x: w - (landscape ? 104 : 76), y: landscape ? h / 2 : h / 2 + 84 },
    safeTop
  };
}

function render() {
  if (!ctx) return;
  const box = layout();
  ctx.clearRect(0, 0, box.w, box.h);
  drawTable(box);
  if (state.phase === "playing" || state.phase === "gameOver") {
    try {
      drawOpponents(box);
      drawDiscardPile(box);
      drawDrawPile(box);
      drawHand(box);
      canvas.dataset.renderError = "";
    } catch (error) {
      canvas.dataset.renderError = error?.stack || error?.message || String(error);
      console.error(error);
    }
  }
  publishDebugState(box);
}

function publishDebugState(box) {
  const debug = {
    phase: state.phase,
    round: state.round,
    currentPlayer: state.currentPlayer,
    deck: state.deck.length,
    hand: state.players[0]?.hand.length || 0,
    tileRects: state.tileRects.length,
    handY: box.handY,
    w: box.w,
    h: box.h
  };
  canvas.dataset.debug = JSON.stringify(debug);
  try {
    window.hexDebugState = debug;
  } catch (error) {
    // Ignore debug publication failures in embedded browsers.
  }
}

function drawTable(box) {
  if (assets.table.complete && assets.table.naturalWidth) {
    drawCoverImage(assets.table, 0, 0, box.w, box.h);
    ctx.fillStyle = "rgba(5, 25, 17, 0.24)";
    ctx.fillRect(0, 0, box.w, box.h);
  } else {
    const gradient = ctx.createRadialGradient(box.w / 2, box.h / 2, 40, box.w / 2, box.h / 2, Math.max(box.w, box.h) * 0.7);
    gradient.addColorStop(0, "#1b7a4e");
    gradient.addColorStop(0.62, "#145f3d");
    gradient.addColorStop(1, "#0b3524");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, box.w, box.h);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  roundRect(box.w * 0.08, box.safeTop, box.w * 0.84, box.h - box.safeTop - 96, 18);
  ctx.stroke();
}

function drawCoverImage(image, x, y, w, h) {
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (image.naturalWidth - sw) / 2;
  const sy = (image.naturalHeight - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
}

function drawOpponents(box) {
  const names = [
    { text: currentLang === "zh" ? `AI 2 手牌 ${state.players[2]?.hand.length || 0}` : `AI 2 Hand ${state.players[2]?.hand.length || 0}`, x: box.w / 2, y: box.safeTop + 26 },
    { text: currentLang === "zh" ? `AI 1 手牌 ${state.players[1]?.hand.length || 0}` : `AI 1 Hand ${state.players[1]?.hand.length || 0}`, x: 76, y: box.h / 2 },
    { text: currentLang === "zh" ? `AI 3 手牌 ${state.players[3]?.hand.length || 0}` : `AI 3 Hand ${state.players[3]?.hand.length || 0}`, x: box.w - 76, y: box.h / 2 }
  ];
  for (const item of names) {
    ctx.fillStyle = "rgba(0,0,0,0.24)";
    roundRect(item.x - 72, item.y - 18, 144, 36, 8);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.font = "700 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.text, item.x, item.y);
  }
}

function drawHand(box) {
  const hand = sortHand(state.players[0]?.hand || []);
  const tileW = box.landscape ? 50 : 46;
  const tileH = box.landscape ? 70 : 66;
  const maxWidth = box.w - 26;
  const spacing = hand.length > 1 ? Math.min(tileW + 8, Math.max(28, (maxWidth - tileW) / (hand.length - 1))) : 0;
  const startX = box.w / 2 - ((hand.length - 1) * spacing + tileW) / 2;
  state.tileRects = [];

  for (let i = 0; i < hand.length; i += 1) {
    const x = startX + i * spacing;
    const y = box.handY;
    state.tileRects.push({ x, y, w: tileW, h: tileH, id: hand[i].id });
    drawTileActionHint(hand[i], x, y, tileW, tileH);
    drawTileFace(hand[i], x, y, tileW, tileH, hand[i].id === state.selectedTileId, false, hand[i].id === state.lastDrawn?.id);
  }
}

function drawTileActionHint(tile, x, y, w, h) {
  const hint = tileActionHint(tile);
  if (!hint) return;

  ctx.save();
  ctx.shadowColor = hint.color;
  ctx.shadowBlur = 16;
  ctx.strokeStyle = hint.color;
  ctx.lineWidth = 3;
  roundRect(x - 4, y - 14, w + 8, h + 18, 9);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = hint.fill;
  roundRect(x + w / 2 - 22, y - 25, 44, 18, 9);
  ctx.fill();
      ctx.fillStyle = "#fff";
  ctx.font = "800 11px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(hint.label, x + w / 2, y - 16);

  if (hint.detail && tile.id === state.selectedTileId) {
    const width = Math.min(170, Math.max(88, ctx.measureText(hint.detail).width + 18));
    roundRect(x + w / 2 - width / 2, y + h + 8, width, 24, 8);
    ctx.fill();
    ctx.fillStyle = "#fff7cc";
    ctx.font = "800 12px sans-serif";
    ctx.fillText(hint.detail, x + w / 2, y + h + 20);
  }
  ctx.restore();
}

function tileActionHint(tile) {
  if (state.phase !== "playing" || state.currentPlayer !== 0) return null;

  const cookieReady = state.selectedSkills.includes("cookie") && state.round - state.lastCookieRound >= 3;
  const cookieCandidate = cookieReady && !tile.isJoker && tile.suit !== "wan" && tile.rank >= 3;
  if (cookieCandidate) {
    const results = [makePreviewTile(tile.suit, 1), makePreviewTile(tile.suit, 1), makePreviewTile(tile.suit, tile.rank - 2)];
    return {
      label: tile.id === state.selectedTileId ? tr("tileHints.willSplit") : tr("tileHints.readySplit"),
      detail: `-> ${results.map(tileName).join(" ")}`,
      color: "#ff6cac",
      fill: "rgba(217, 54, 122, 0.92)"
    };
  }

  const vitality = getVitalityPlan();
  if (vitality?.discards.some(item => item.id === tile.id)) {
    return {
      label: tr("tileHints.willDiscard"),
      detail: `-> ${tr("tileHints.draw2")}`,
      color: "#ff8a54",
      fill: "rgba(230, 95, 58, 0.92)"
    };
  }

  return null;
}

function drawDiscardPile(box) {
  const recent = state.discards.slice(-36);
  const tileW = box.landscape ? 34 : 30;
  const tileH = box.landscape ? 46 : 42;
  const cols = box.landscape ? 12 : 7;
  const gap = 5;
  const rows = Math.ceil(recent.length / cols);
  const startX = box.w / 2 - (cols * tileW + (cols - 1) * gap) / 2;
  const startY = box.discardY - (rows * tileH + (rows - 1) * gap) / 2;

  ctx.fillStyle = "rgba(0,0,0,0.13)";
  roundRect(startX - 12, startY - 12, cols * tileW + (cols - 1) * gap + 24, Math.max(1, rows) * tileH + Math.max(0, rows - 1) * gap + 24, 12);
  ctx.fill();

  for (let i = 0; i < recent.length; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    drawTileFace(recent[i].tile, startX + col * (tileW + gap), startY + row * (tileH + gap), tileW, tileH, false, true);
  }
}

function drawDrawPile(box) {
  const { x, y } = box.drawPile;
  ctx.fillStyle = "#8b451f";
  roundRect(x - 34, y - 52, 68, 104, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 2;
  for (let i = -32; i <= 32; i += 16) {
    ctx.beginPath();
    ctx.moveTo(x - 24, y + i);
    ctx.lineTo(x + 24, y + i);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  roundRect(x - 26, y - 16, 52, 32, 7);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "800 18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${state.deck.length}`, x, y);
}

function drawTileFace(tile, x, y, w, h, selected = false, compact = false, hot = false) {
  const offsetY = selected ? 10 : 0;
  const y0 = y - offsetY;
  const radius = Math.max(6, Math.floor(w * 0.16));
  const suit = suits.find(item => item.id === tile.suit) || suits[0];

  ctx.save();
  ctx.shadowColor = hot ? "rgba(81,214,255,0.55)" : "rgba(0,0,0,0.32)";
  ctx.shadowBlur = hot ? 18 : 8;
  ctx.shadowOffsetY = hot ? 0 : 4;

  const face = ctx.createLinearGradient(x, y0, x + w, y0 + h);
  face.addColorStop(0, tile.isJoker ? "#fff0a8" : "#fffefa");
  face.addColorStop(0.55, tile.isJoker ? "#f3c94b" : "#f4f0e7");
  face.addColorStop(1, tile.isJoker ? "#c68828" : "#d8d0c1");
  ctx.fillStyle = face;
  roundRect(x, y0, w, h, radius);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = selected ? "#f7d66b" : hot ? "#51d6ff" : "rgba(35, 25, 18, 0.7)";
  ctx.lineWidth = selected || hot ? 3 : 1.4;
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  roundRect(x + w * 0.12, y0 + h * 0.08, w * 0.34, h * 0.08, 8);
  ctx.fill();

  if (tile.isJoker) {
    drawJokerFace(tile, x, y0, w, h, compact, suit);
  } else {
    drawStandardTileFace(tile, x, y0, w, h, compact, suit);
  }

  if (hot && !compact) {
    ctx.fillStyle = "rgba(81, 214, 255, 0.92)";
    roundRect(x + w - 22, y0 - 7, 24, 18, 9);
    ctx.fill();
    ctx.fillStyle = "#05202a";
    ctx.font = "900 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tr("tileHints.new"), x + w - 10, y0 + 2);
  }

  ctx.restore();
}

function drawJokerFace(tile, x, y, w, h, compact, suit) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#7a2f18";
  ctx.font = `900 ${Math.floor(w * (compact ? 0.42 : 0.5))}px sans-serif`;
  ctx.fillText(tr("tileHints.joker"), x + w / 2, y + h * 0.35);

  ctx.fillStyle = "rgba(122, 47, 24, 0.16)";
  roundRect(x + w * 0.18, y + h * 0.52, w * 0.64, h * 0.3, 7);
  ctx.fill();

  ctx.fillStyle = suit.color;
  ctx.font = `900 ${Math.floor(w * (compact ? 0.24 : 0.27))}px sans-serif`;
  ctx.fillText(currentLang === "zh" ? `${suitName(tile.suit)}${tile.rank}` : `${tile.rank} ${suitName(tile.suit)}`, x + w / 2, y + h * 0.67);

  ctx.fillStyle = "rgba(122,47,24,0.72)";
  ctx.font = `800 ${Math.max(8, Math.floor(w * 0.16))}px sans-serif`;
  ctx.fillText(tr("tileHints.wildcard"), x + w / 2, y + h * 0.86);
}

function drawStandardTileFace(tile, x, y, w, h, compact, suit) {
  ctx.fillStyle = suit.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (tile.suit === "character") {
    drawCircleTile(tile.rank, x, y, w, h, compact, suit.color);
  } else if (tile.suit === "bamboo") {
    drawBambooTile(tile.rank, x, y, w, h, compact);
  } else {
    drawWanTile(tile.rank, x, y, w, h, compact, suit.color);
  }
}

function drawWanTile(rank, x, y, w, h, compact, color) {
  ctx.fillStyle = color;
  ctx.font = `900 ${Math.floor(w * (compact ? 0.48 : 0.62))}px serif`;
  ctx.fillText(`${rank}`, x + w / 2, y + h * 0.38);
  ctx.font = `900 ${Math.floor(w * (compact ? 0.36 : 0.48))}px serif`;
  ctx.fillText("万", x + w / 2, y + h * 0.68);
  drawTileCorner(rank, suitName("wan"), x, y, w, h, color, compact);
}

function drawCircleTile(rank, x, y, w, h, compact, color) {
  const spots = tileSpots(rank);
  const r = Math.max(2.4, w * (compact ? 0.09 : 0.105));
  for (const [px, py] of spots) {
    const cx = x + w * px;
    const cy = y + h * py;
    ctx.fillStyle = rank % 2 === 0 ? "#16823f" : color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f9fbf7";
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.48, 0, Math.PI * 2);
    ctx.fill();
  }
  drawTileCorner(rank, suitName("character"), x, y, w, h, color, compact);
}

function drawBambooTile(rank, x, y, w, h, compact) {
  const spots = tileSpots(rank);
  for (const [px, py] of spots) {
    drawBambooStem(x + w * px, y + h * py, Math.max(10, h * (compact ? 0.16 : 0.18)), w * 0.055);
  }
  drawTileCorner(rank, suitName("bamboo"), x, y, w, h, "#16823f", compact);
}

function drawBambooStem(cx, cy, length, width) {
  ctx.save();
  ctx.strokeStyle = "#16823f";
  ctx.lineWidth = Math.max(2, width);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy - length / 2);
  ctx.lineTo(cx, cy + length / 2);
  ctx.stroke();
  ctx.strokeStyle = "#46b86b";
  ctx.lineWidth = Math.max(1, width * 0.48);
  ctx.beginPath();
  ctx.moveTo(cx - width * 1.4, cy - length * 0.18);
  ctx.lineTo(cx + width * 1.4, cy - length * 0.02);
  ctx.moveTo(cx - width * 1.4, cy + length * 0.18);
  ctx.lineTo(cx + width * 1.4, cy + length * 0.02);
  ctx.stroke();
  ctx.restore();
}

function drawTileCorner(rank, label, x, y, w, h, color, compact) {
  if (compact) return;
  ctx.fillStyle = color;
  ctx.font = `900 ${Math.max(9, Math.floor(w * 0.2))}px sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`${rank}${label}`, x + w * 0.12, y + h * 0.08);
}

function tileSpots(rank) {
  const layouts = {
    1: [[0.5, 0.54]],
    2: [[0.36, 0.38], [0.64, 0.7]],
    3: [[0.34, 0.34], [0.5, 0.54], [0.66, 0.74]],
    4: [[0.34, 0.34], [0.66, 0.34], [0.34, 0.72], [0.66, 0.72]],
    5: [[0.34, 0.32], [0.66, 0.32], [0.5, 0.52], [0.34, 0.74], [0.66, 0.74]],
    6: [[0.34, 0.3], [0.66, 0.3], [0.34, 0.52], [0.66, 0.52], [0.34, 0.74], [0.66, 0.74]],
    7: [[0.32, 0.28], [0.5, 0.28], [0.68, 0.28], [0.34, 0.52], [0.66, 0.52], [0.34, 0.76], [0.66, 0.76]],
    8: [[0.32, 0.28], [0.5, 0.28], [0.68, 0.28], [0.34, 0.48], [0.66, 0.48], [0.32, 0.72], [0.5, 0.72], [0.68, 0.72]],
    9: [[0.32, 0.26], [0.5, 0.26], [0.68, 0.26], [0.32, 0.5], [0.5, 0.5], [0.68, 0.5], [0.32, 0.74], [0.5, 0.74], [0.68, 0.74]]
  };
  return layouts[rank] || layouts[1];
}

function roundRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function showCitySelection() {
  stopTurnTimer();
  hideResultOverlay();
  hideManual();
  resetSessionState();
  state.phase = "city";
  overlay.classList.remove("hidden");
  setMessage(tr("messages.chooseCity"), tr("messages.citySub"));
  overlayTitle.textContent = tr("overlay.cityTitle");
  overlayHint.textContent = tr("overlay.cityHint");
  overlayConfirm.classList.add("hidden");
  overlayGrid.innerHTML = "";
  overlayGrid.classList.remove("augment-grid");
  for (const city of cityStates) {
    const button = optionButton(cityName(city), cityDesc(city), city.color);
    applyCityCardArt(button, city.art);
    button.addEventListener("click", () => {
      playSound("select");
      state.city = city;
      if (!city.hex) {
        state.selectedSkills = [];
        startGame();
      } else {
        showAugmentSelection({ initial: true });
      }
    });
    overlayGrid.appendChild(button);
  }
  renderBadges();
  render();
}

function hideOverlay() {
  overlay.classList.add("hidden");
  overlayGrid.innerHTML = "";
  overlayGrid.classList.remove("augment-grid");
  overlayConfirm.classList.add("hidden");
}

function resetSessionState() {
  state.city = null;
  state.selectedSkills = [];
  state.deck = [];
  state.players = [];
  state.currentPlayer = 0;
  state.round = 0;
  state.discards = [];
  state.selectedTileId = null;
  state.lastDrawn = null;
  state.scores = [0, 0, 0, 0];
  state.jokerRules = [];
  state.lastVitalityRound = -99;
  state.lastCookieRound = -99;
  state.started = false;
  state.augmentDraftsTaken = 0;
  state.pendingAugmentRound = null;
  state.currentAugmentOffers = [];
  state.lastTimerBeep = null;
}

function applyCityCardArt(button, artIndex) {
  const col = artIndex % 3;
  const row = Math.floor(artIndex / 3);
  const x = col === 0 ? "0%" : col === 1 ? "50%" : "100%";
  const y = row === 0 ? "0%" : "100%";
  button.style.setProperty("--art-image", "url('./assets/table-bg.jpg')");
  button.style.setProperty("--art-size", "300% 200%");
  button.style.setProperty("--art-position", `${x} ${y}`);
  button.style.setProperty("--art-opacity", "0.78");
}

function shouldOfferAugment() {
  if (!state.city?.hex) return false;
  if (state.selectedSkills.length >= MAX_HEX_SKILLS) return false;
  if (!AUGMENT_ROUNDS.includes(state.round)) return false;
  return state.pendingAugmentRound !== state.round;
}

function showAugmentSelection({ initial = false, resume = false } = {}) {
  stopTurnTimer();
  state.phase = "augment";
  state.pendingAugmentRound = state.round || 1;
  overlay.classList.remove("hidden");
  playSound(initial ? "augment" : "stage");
  const offers = rollAugmentOffers();
  state.currentAugmentOffers = offers.map(skill => skill.id);
  renderAugmentSelection({ initial, resume, offers: state.currentAugmentOffers });
}

function renderAugmentSelection({ initial = false, resume = false, offers = [] } = {}) {
  setMessage(tr("messages.chooseAugment"), `${cityName(state.city)} | ${currentLang === "zh" ? `第 ${state.selectedSkills.length + 1}/${MAX_HEX_SKILLS} 个强化` : `${state.selectedSkills.length + 1}/${MAX_HEX_SKILLS}`}`);
  overlayTitle.textContent = tr("overlay.augmentTitle", state.selectedSkills.length + 1);
  overlayHint.textContent = initial
    ? tr("overlay.augmentInitial")
    : tr("overlay.augmentStage");
  overlayConfirm.classList.add("hidden");
  overlayGrid.innerHTML = "";

  overlayGrid.classList.add("augment-grid");
  for (const skillId of offers) {
    const skill = hexSkills.find(item => item.id === skillId) || skillId;
    const button = augmentButton(skill);
    button.addEventListener("click", () => {
      selectAugment(skill.id, { initial, resume });
    });
    overlayGrid.appendChild(button);
  }
  renderBadges();
  render();
}

function rollAugmentOffers() {
  const available = hexSkills.filter(skill => !state.selectedSkills.includes(skill.id));
  return shuffle(available).slice(0, Math.min(3, available.length));
}

function augmentButton(skill) {
  const button = optionButton(skillName(skill), skillDesc(skill), skill.color);
  button.classList.add("augment-option");
  button.innerHTML = `<span class="option-icon">${skill.icon}</span><span class="tier">${tierName(skill.tier)}</span><strong>${skillName(skill)}</strong><span>${skillDesc(skill)}</span>`;
  return button;
}

function selectAugment(skillId, { initial = false } = {}) {
  if (state.selectedSkills.includes(skillId) || state.selectedSkills.length >= MAX_HEX_SKILLS) return;
  playSound("selectAugment");
  state.selectedSkills.push(skillId);
  state.augmentDraftsTaken = state.selectedSkills.length;
  state.currentAugmentOffers = [];
  applyNewAugment(skillId);
  renderBadges();

  if (initial || !state.started) {
    startGame();
    return;
  }

  hideOverlay();
  state.phase = "playing";
  drawFromDeck(0);
  setMessage(tr("messages.yourTurn"), tr("messages.gotSkill", skillName(skillId), tileName(state.lastDrawn)));
  startPlayerTurnTimer();
  render();
}

function applyNewAugment(skillId) {
  if (!state.started) return;
  const skill = hexSkills.find(item => item.id === skillId);
  if (!skill) return;

  if (skill.suit) {
    for (let i = 0; i < 3; i += 1) {
      const index = state.deck.findIndex(tile => tile.suit === skill.suit && !tile.isJoker);
      if (index >= 0) state.players[0].hand.push(state.deck.splice(index, 1)[0]);
    }
  }

  if (skill.id === "jokerDouble") {
    state.jokerRules = createJokerRules();
    state.deck = shuffle(state.deck.concat(makeTile("wan", 5, true)));
  }
}

function optionButton(title, desc, color) {
  const button = document.createElement("button");
  button.className = "option";
  button.type = "button";
  button.style.background = `linear-gradient(135deg, ${color}cc, rgba(255,255,255,0.08))`;
  button.innerHTML = `<strong>${title}</strong><span>${desc}</span>`;
  return button;
}

function handleCanvasPointer(event) {
  if (state.phase !== "playing" || state.currentPlayer !== 0) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const hit = state.tileRects.find(item => x >= item.x && x <= item.x + item.w && y >= item.y - 12 && y <= item.y + item.h);
  if (!hit) return;
  if (state.selectedTileId === hit.id) {
    stopTurnTimer();
    discardTile(0, hit.id);
    render();
    window.setTimeout(nextTurn, 260);
  } else {
    state.selectedTileId = hit.id;
    const tile = state.players[0].hand.find(item => item.id === hit.id);
    playSound("select");
    setMessage(tr("messages.selectTile", tileName(tile)), tr("messages.selectTileSub"));
    render();
  }
}

actionBar.addEventListener("click", event => {
  const button = event.target?.closest?.("button[data-action]");
  const action = button?.dataset?.action;
  if (!action) return;
  primeAudio();
  if (action === "restart") {
    playSound("select");
    showCitySelection();
    return;
  }
  if (state.phase !== "playing" || state.currentPlayer !== 0) return;
  if (action === "pass") {
    stopTurnTimer();
    const selected = state.players[0].hand.find(tile => tile.id === state.selectedTileId);
    const fallback = selected || chooseAIDiscard(state.players[0].hand);
    if (fallback) {
      discardTile(0, fallback.id);
      setMessage(tr("messages.autoPass"), tr("messages.autoPassSub", tileName(fallback)));
      render();
      window.setTimeout(nextTurn, 260);
    }
  }
  if (action === "win") {
    const result = getHumanWinResult();
    if (result) {
      stopTurnTimer();
      endGame(0, result);
    }
    else {
      playSound("error");
      setMessage(tr("messages.cannotWin"), tr("messages.cannotWinSub"));
    }
  }
  if (action === "vitality" && canUseVitality()) useVitality();
  if (action === "cookie" && canUseCookie()) useCookie();
});

skillBadges.addEventListener("click", event => {
  const cityBadge = event.target?.closest?.("button[data-city-detail]");
  if (cityBadge) {
    primeAudio();
    showCityDetail();
    return;
  }
  const badge = event.target?.closest?.("button[data-skill-id]");
  if (!badge) return;
  primeAudio();
  showSkillDetail(badge.dataset.skillId);
});

skillDetailClose.addEventListener("click", () => {
  primeAudio();
  hideSkillDetail();
});

skillDetailOverlay.addEventListener("click", event => {
  if (event.target !== skillDetailOverlay) return;
  primeAudio();
  hideSkillDetail();
});

manualOpen.addEventListener("click", event => {
  event.stopPropagation();
  primeAudio();
  showManual();
});

manualClose.addEventListener("click", () => {
  primeAudio();
  hideManual();
});

manualOverlay.addEventListener("click", event => {
  if (event.target !== manualOverlay) return;
  primeAudio();
  hideManual();
});

languageToggle.addEventListener("click", () => {
  primeAudio();
  toggleLanguage();
});

resultRestart.addEventListener("click", () => {
  primeAudio();
  playSound("select");
  showCitySelection();
});

resultClose.addEventListener("click", () => {
  primeAudio();
  playSound("select");
  hideResultOverlay();
});

function requestStartGame(event) {
  primeAudio();
  const target = event?.target;
  if (target?.closest && !target.closest("#overlayConfirm")) return;
  event?.preventDefault?.();
  event?.stopPropagation?.();
  const now = Date.now();
  if (now - lastStartRequestAt < 250) return;
  lastStartRequestAt = now;
  setMessage(tr("messages.starting"), tr("messages.startingSub"));
  try {
    startGame();
  } catch (error) {
    console.error(error);
    playSound("error");
    setMessage(tr("messages.startFail"), error?.message || String(error));
  }
}

function primeAudio() {
  const audio = ensureAudio();
  if (audio?.state === "suspended") audio.resume();
}

function ensureAudio() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioContext) {
    audioContext = new AudioCtor();
    audioMaster = audioContext.createGain();
    audioMaster.gain.value = 0.12;
    audioMaster.connect(audioContext.destination);
  }
  return audioContext;
}

function playTone({ frequency, duration = 0.08, delay = 0, type = "sine", gain = 0.45 }) {
  const audio = ensureAudio();
  if (!audio || !audioMaster) return;
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const envelope = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  envelope.gain.setValueAtTime(0.001, start);
  envelope.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(envelope);
  envelope.connect(audioMaster);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playNoise(duration = 0.08, gain = 0.18) {
  const audio = ensureAudio();
  if (!audio || !audioMaster) return;
  const buffer = audio.createBuffer(1, Math.max(1, Math.floor(audio.sampleRate * duration)), audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const source = audio.createBufferSource();
  const envelope = audio.createGain();
  source.buffer = buffer;
  envelope.gain.value = gain;
  source.connect(envelope);
  envelope.connect(audioMaster);
  source.start();
}

function playSound(name) {
  if (!ensureAudio()) return;
  playHaptic(name);
  const patterns = {
    select: () => playTone({ frequency: 520, duration: 0.045, type: "triangle", gain: 0.25 }),
    draw: () => playTone({ frequency: 330, duration: 0.055, type: "sine", gain: 0.18 }),
    discard: () => {
      playNoise(0.05, 0.14);
      playTone({ frequency: 180, duration: 0.05, type: "square", gain: 0.12 });
    },
    aiDiscard: () => playTone({ frequency: 150, duration: 0.035, type: "triangle", gain: 0.08 }),
    skill: () => [0, 0.045, 0.09].forEach((delay, i) => playTone({ frequency: 420 + i * 130, duration: 0.08, delay, type: "triangle", gain: 0.22 })),
    augment: () => [0, 0.06, 0.12].forEach((delay, i) => playTone({ frequency: 260 + i * 170, duration: 0.12, delay, type: "sine", gain: 0.25 })),
    stage: () => [0, 0.07].forEach((delay, i) => playTone({ frequency: 360 + i * 180, duration: 0.14, delay, type: "triangle", gain: 0.23 })),
    selectAugment: () => [0, 0.045, 0.09, 0.135].forEach((delay, i) => playTone({ frequency: 520 + i * 95, duration: 0.09, delay, type: "sine", gain: 0.22 })),
    start: () => [0, 0.05].forEach((delay, i) => playTone({ frequency: 260 + i * 220, duration: 0.11, delay, type: "triangle", gain: 0.22 })),
    tick: () => playTone({ frequency: 740, duration: 0.045, type: "square", gain: 0.12 }),
    win: () => [0, 0.06, 0.12, 0.2, 0.32, 0.44].forEach((delay, i) => playTone({ frequency: [420, 560, 700, 980, 1260, 1540][i], duration: i > 3 ? 0.22 : 0.16, delay, type: "triangle", gain: i > 3 ? 0.2 : 0.28 })),
    end: () => [0, 0.07].forEach((delay, i) => playTone({ frequency: 280 - i * 80, duration: 0.16, delay, type: "sine", gain: 0.18 })),
    error: () => [0, 0.055].forEach(delay => playTone({ frequency: 120, duration: 0.08, delay, type: "sawtooth", gain: 0.14 }))
  };
  patterns[name]?.();
}

function playHaptic(name) {
  if (!navigator.vibrate) return;
  const patterns = {
    select: 12,
    draw: 8,
    discard: 18,
    skill: [18, 24, 18],
    augment: [20, 30, 20],
    stage: [16, 24],
    selectAugment: [18, 22, 28],
    start: 22,
    tick: 10,
    win: [35, 45, 35, 60],
    end: [28, 40],
    error: [30, 30, 30]
  };
  const pattern = patterns[name];
  if (pattern) navigator.vibrate(pattern);
}

try {
  window.hexStartGame = requestStartGame;
} catch (error) {
  // Some embedded browser sandboxes make window non-extensible; DOM polling below still handles the button.
}
overlayConfirm.addEventListener("click", requestStartGame);
overlayConfirm.addEventListener("pointerup", requestStartGame);
document.addEventListener("click", requestStartGame);
setInterval(() => {
  const request = overlayConfirm.getAttribute("data-start-request");
  if (!request || request === overlayConfirm.dataset.handledStartRequest) return;
  overlayConfirm.dataset.handledStartRequest = request;
  requestStartGame();
}, 80);
canvas.addEventListener("pointerdown", handleCanvasPointer);
document.addEventListener("pointerdown", primeAudio, { once: true });
document.addEventListener("keydown", primeAudio, { once: true });
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", () => window.setTimeout(resizeCanvas, 120));

renderManual();
resizeCanvas();
showCitySelection();
