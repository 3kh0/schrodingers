export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export type RGB = [number, number, number];

export const COLORS: Record<string, RGB> = {
  bg: [10, 15, 10],
  crtGreen: [120, 200, 100],
  crtDim: [60, 100, 50],
  rust: [120, 70, 40],
  steel: [70, 75, 80],
  alive: [80, 220, 120],
  dead: [220, 70, 70],
  text: [190, 230, 170],
  textDim: [100, 130, 90],
  panel: [20, 30, 20],
  panelBorder: [50, 80, 45],
  button: [35, 55, 35],
  buttonHover: [50, 80, 45],
};
