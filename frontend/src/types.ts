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

export type T_UserBenchmark_HomePage = T_UserBenchmark & T_UserInfo;

export type T_BenchmarkReformat = T_UserBenchmark | T_UserBenchmark_HomePage;
