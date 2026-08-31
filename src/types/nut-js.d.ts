declare module '@nut-tree-fork/nut-js' {
  export enum Key {
    Enter = 0,
    Tab = 1,
    Space = 2,
    Escape = 3,
    LeftControl = 4,
    RightControl = 5,
    LeftShift = 6,
    RightShift = 7,
    LeftAlt = 8,
    RightAlt = 9,
    F1 = 10,
    F2 = 11,
    F3 = 12,
    F4 = 13,
    F5 = 14,
    F6 = 15,
    F7 = 16,
    F8 = 17,
    F9 = 18,
    F10 = 19,
    F11 = 20,
    F12 = 21,
  }

  export interface KeyboardConfig {
    autoDelayMs: number;
  }

  export interface Keyboard {
    config: KeyboardConfig;
    type(input: string | Key | any, ...keys: any[]): Promise<any>;
    pressKey(...keys: Key[]): Promise<any>;
    releaseKey(...keys: Key[]): Promise<any>;
  }

  export const keyboard: Keyboard;
}
