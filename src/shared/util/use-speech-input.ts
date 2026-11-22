"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// 브라우저 내장 음성 인식(Web Speech API) 중 쓰는 부분만 정의, 표준 DOM 타입에 없음
export type RecognitionEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionConstructor = new () => Recognition;

// denied: 마이크 사용 불가, silent: 들린 말 없음, failed: 그 밖의 실패
export type SpeechInputError = "denied" | "silent" | "failed";

function findRecognition(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const source = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return source.SpeechRecognition ?? source.webkitSpeechRecognition ?? null;
}

// 인식 오류 코드를 안내 종류로 분류, 직접 멈춘 경우는 안내 없음
export function toSpeechInputError(code: string): SpeechInputError | null {
  if (code === "aborted") return null;
  if (code === "not-allowed" || code === "service-not-allowed") return "denied";
  if (code === "no-speech") return "silent";
  return "failed";
}

export function readTranscript(event: RecognitionEvent): string {
  return Array.from(event.results, (result) => result[0]?.transcript ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

const subscribeNothing = () => () => {};

// 말로 입력받는 훅, 한 번 누르면 한 문장을 듣고 onResult로 전달
export function useSpeechInput(onResult: (text: string) => void) {
  // 서버 렌더링과 첫 화면에서는 미지원으로 취급
  const supported = useSyncExternalStore(
    subscribeNothing,
    () => findRecognition() !== null,
    () => false,
  );
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<SpeechInputError | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // 화면을 벗어나면 듣기 중단
  useEffect(
    () => () => {
      const recognition = recognitionRef.current;
      if (!recognition) return;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    },
    [],
  );

  const start = useCallback(() => {
    const Recognition = findRecognition();
    if (!Recognition || recognitionRef.current) return;

    const recognition = new Recognition();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const text = readTranscript(event);
      if (text) onResultRef.current(text);
    };
    recognition.onerror = (event) => setError(toSpeechInputError(event.error));
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };

    recognitionRef.current = recognition;
    setError(null);
    setListening(true);
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setError("failed");
    }
  }, []);

  const stop = useCallback(() => recognitionRef.current?.stop(), []);

  return { supported, listening, error, start, stop };
}
