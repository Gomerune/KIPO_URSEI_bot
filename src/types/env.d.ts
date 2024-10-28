// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    TOKEN: string;
    GROUP_ID: string;
    DB_PATH: string;
  }
}