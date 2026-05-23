import feedbackJson from "@/data/feedback.json";

type FeedbackPool = {
  correct: string[];
  wrong_close: string[];
  wrong_far: string[];
};

const pool = feedbackJson as FeedbackPool;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getCorrectMessage(): string {
  return pick(pool.correct);
}

export function getWrongMessage(kgOff: number): string {
  if (kgOff < 50) return pick(pool.wrong_close);
  return pick(pool.wrong_far);
}
