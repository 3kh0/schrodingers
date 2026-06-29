import kaplay from "kaplay";
import { initAudioSettings } from "./game/audio";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "./game/config";
import { registerActIntroScene } from "./game/scenes/actIntro";
import { registerEndScene } from "./game/scenes/end";
import { registerMenuScene } from "./game/scenes/menu";
import { registerPlayScene } from "./game/scenes/play";
import { registerRevealScene } from "./game/scenes/reveal";

initAudioSettings();

const k = kaplay({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  background: [...COLORS.bg],
  crisp: true,
  letterbox: true,
  global: false,
});

k.loadRoot("./");

registerMenuScene(k);
registerActIntroScene(k);
registerPlayScene(k);
registerRevealScene(k);
registerEndScene(k);

k.go("menu");
