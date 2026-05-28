'use client';

import { useEffect, useRef, useState } from 'react';

type UseTypingAnimationOptions = {
  question: string;
  answer: string;
  reduceMotion?: boolean;
  charDelayMs?: number;
  pauseAfterQuestionMs?: number;
  pauseAfterAnswerMs?: number;
  onCycleComplete?: () => void;
};

export function useTypingAnimation({
  question,
  answer,
  reduceMotion = false,
  charDelayMs = 16,
  pauseAfterQuestionMs = 280,
  pauseAfterAnswerMs = 1400,
  onCycleComplete,
}: UseTypingAnimationOptions) {
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [isTypingQuestion, setIsTypingQuestion] = useState(false);
  const [isTypingAnswer, setIsTypingAnswer] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const onCycleCompleteRef = useRef(onCycleComplete);

  onCycleCompleteRef.current = onCycleComplete;

  useEffect(() => {
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      });

    const typeText = async (
      text: string,
      onUpdate: (value: string) => void,
      delayMs: number
    ) => {
      for (let i = 1; i <= text.length; i++) {
        if (cancelled) return;
        onUpdate(text.slice(0, i));
        await wait(delayMs);
      }
    };

    const run = async () => {
      setQuestionText('');
      setAnswerText('');
      setShowAnswer(false);
      setIsTypingQuestion(false);
      setIsTypingAnswer(false);

      if (reduceMotion) {
        setQuestionText(question);
        setAnswerText(answer);
        setShowAnswer(true);
        await wait(pauseAfterAnswerMs);
        if (!cancelled) onCycleCompleteRef.current?.();
        return;
      }

      await wait(180);
      if (cancelled) return;

      setIsTypingQuestion(true);
      await typeText(question, setQuestionText, charDelayMs);
      if (cancelled) return;
      setIsTypingQuestion(false);

      await wait(pauseAfterQuestionMs);
      if (cancelled) return;

      setShowAnswer(true);
      setIsTypingAnswer(true);
      await typeText(answer, setAnswerText, charDelayMs * 0.8);
      if (cancelled) return;
      setIsTypingAnswer(false);

      await wait(pauseAfterAnswerMs);
      if (!cancelled) onCycleCompleteRef.current?.();
    };

    void run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [
    question,
    answer,
    reduceMotion,
    charDelayMs,
    pauseAfterQuestionMs,
    pauseAfterAnswerMs,
  ]);

  return {
    questionText,
    answerText,
    isTypingQuestion,
    isTypingAnswer,
    showAnswer,
  };
}
