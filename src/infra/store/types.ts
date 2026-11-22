// 저장소 드라이버 공통 인터페이스, 키는 "컬렉션:아이디" 형식
export interface KeyValueStore {
  readonly driver: "redis" | "file" | "memory";
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  // 접두어로 시작하는 모든 값 조회
  list<T>(prefix: string): Promise<T[]>;
}
