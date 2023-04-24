import { z } from 'zod';

export type T_CreateBenchmark = {
  username: string;
  elapsedTime: number;
  WPM: number;
};

export type T_UserSession = {
  username: string;
};

export const RegisterGetReqBodySchema = z.object({
  username: z.string()
    .min(4, 'Minimum username characters: 4')
    .max(16, 'Max username characters: 16')
    .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain alphanumeric characters.'),
  password: z.string()
    .min(4, 'Minimum # of password characters: 4')
    .max(32, 'Maximum # of password characters: 32')
    .regex(/^[a-zA-Z0-9!@#$%^&*]+$/, 'Password can only contain alphanumeric and/or special (!,@,#,$,%,^,&,*) characters.'),
});

export type T_RegisterGetReqBody = z.infer<typeof RegisterGetReqBodySchema>;
