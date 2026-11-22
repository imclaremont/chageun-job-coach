"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// 브라우저 내장 음성 인식(Web Speech API) 중 쓰는 부분만 정의, 표준 DOM 타입에 없음
export type RecognitionEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>;
};
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

// 마지막 결과의 확정 여부
export function isFinalResult(event: RecognitionEvent): boolean {
  return event.results[event.results.length - 1]?.isFinal === true;
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
  // 듣는 동안 지금까지 들린 말
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<Recognition | null>(null);
  const onResultRef = useRef(onResult);
  // 사용자가 직접 멈췄는지 여부
  const stoppedRef = useRef(false);

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
    recognition.interimResults = true;
    recognition.continuous = false;
    // 가장 최근에 들린 말, 브라우저가 확정 결과 없이 인식을 끝내는 경우 대비
    let heard = "";
    let delivered = false;
    let failed = false;
    const deliver = () => {
      if (delivered || !heard) return;
      delivered = true;
      setInterim("");
      setError(null);
      onResultRef.current(heard);
    };
    recognition.onresult = (event) => {
      const text = readTranscript(event);
      if (!text) return;
      heard = text;
      if (isFinalResult(event)) deliver();
      else setInterim(text);
    };
    recognition.onerror = (event) => {
      failed = true;
      setError(toSpeechInputError(event.error));
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      setInterim("");
      if (heard) deliver();
      // 들린 말도 오류도 없이 끝난 경우 다시 누르도록 안내, 직접 멈춘 경우는 제외
      else if (!failed && !stoppedRef.current) setError("silent");
    };

    recognitionRef.current = recognition;
    stoppedRef.current = false;
    setError(null);
    setInterim("");
    setListening(true);
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setError("failed");
    }
  }, []);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    recognitionRef.current?.stop();
  }, []);

  return { supported, listening, interim, error, start, stop };
}
