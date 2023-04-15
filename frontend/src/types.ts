export type T_UserInfo = {
  username: string;
};

export type T_Prop_HomePage = {
  username?: string;
}

export type T_GameInfo = {
  WPM: number;
  elapsedTime: number;
};

export type T_UserBenchmark = T_GameInfo & {
  completed: string;
};
