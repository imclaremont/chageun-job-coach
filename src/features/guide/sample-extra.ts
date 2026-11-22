import type { DraftStep } from "./schema";

export type SampleDefinition = {
  id: string;
  // 단계 식별자 앞부분
  stepPrefix: string;
  title: string;
  workplace: string;
  manual: string;
  steps: DraftStep[];
};

// 여러 일터의 기본 가이드, 전부 가상 일터의 가상 매뉴얼
export const EXTRA_SAMPLES: SampleDefinition[] = [
  {
    id: "g_sample_cafe_open",
    stepPrefix: "s_cafe_open",
    title: "매장 문 열 준비하기",
    workplace: "카페 차근",
    manual: `[카페 차근] 매장 문 열 준비하기

1. 매장 불을 모두 켠다.
2. 앞치마를 입고 손을 비누로 30초 동안 씻는다.
3. 젖은 행주로 테이블 6개를 닦는다.
4. 테이블 위에 올려 둔 의자를 바닥에 내린다.
5. 쓰레기통에 새 봉투를 끼운다.
6. 냅킨 통에 냅킨을 끝까지 채운다.
7. 문에 걸린 팻말을 '영업 중'으로 돌린다.`,
    steps: [
      {
        action: "매장 불을 켜요",
        detail: "불을 모두 켜요.",
        emoji: "💡",
        caution: null,
        doneCheck: "매장이 밝아졌어요",
        sourceQuote: "매장 불을 모두 켠다",
      },
      {
        action: "앞치마를 입어요",
        detail: "",
        emoji: "🥼",
        caution: null,
        doneCheck: "앞치마를 입었어요",
        sourceQuote: "앞치마를 입고",
      },
      {
        action: "손을 씻어요",
        detail: "비누로 30초 동안 씻어요.",
        emoji: "🧼",
        caution: null,
        doneCheck: "손을 깨끗이 씻었어요",
        sourceQuote: "손을 비누로 30초 동안 씻는다",
      },
      {
        action: "행주로 테이블을 닦아요",
        detail: "젖은 행주를 써요. 테이블 6개를 닦아요.",
        emoji: "🧽",
        caution: null,
        doneCheck: "테이블 6개를 다 닦았어요",
        sourceQuote: "젖은 행주로 테이블 6개를 닦는다",
      },
      {
        action: "의자를 바닥에 내려요",
        detail: "테이블 위의 의자를 내려요.",
        emoji: "🪑",
        caution: null,
        doneCheck: "의자가 모두 바닥에 있어요",
        sourceQuote: "테이블 위에 올려 둔 의자를 바닥에 내린다",
      },
      {
        action: "쓰레기통에 새 봉투를 끼워요",
        detail: "",
        emoji: "🗑️",
        caution: null,
        doneCheck: "봉투를 끼웠어요",
        sourceQuote: "쓰레기통에 새 봉투를 끼운다",
      },
      {
        action: "냅킨 통에 냅킨을 채워요",
        detail: "통 끝까지 채워요.",
        emoji: "🧻",
        caution: null,
        doneCheck: "냅킨이 통 끝까지 찼어요",
        sourceQuote: "냅킨 통에 냅킨을 끝까지 채운다",
      },
      {
        action: "문 팻말을 돌려요",
        detail: "'영업 중'으로 돌려요.",
        emoji: "🚪",
        caution: null,
        doneCheck: "'영업 중'이 보여요",
        sourceQuote: "문에 걸린 팻말을 '영업 중'으로 돌린다",
      },
    ],
  },
  {
    id: "g_sample_mail",
    stepPrefix: "s_mail",
    title: "우편물 나누기",
    workplace: "차근 사무실",
    manual: `[차근 사무실] 우편물 나누기

1. 오전 10시에 1층 우편함에서 우편물을 모두 꺼낸다.
2. 우편물을 바구니에 담아 3층 사무실로 가져온다.
3. 봉투에 적힌 부서 이름을 읽는다.
4. 부서 이름이 같은 칸에 우편물을 넣는다.
5. 부서 이름이 없는 우편물은 '확인 필요' 바구니에 넣는다.
6. 상자로 온 택배는 접수대 옆 선반에 올린다.
7. 다 나누면 담당자에게 끝났다고 말한다.`,
    steps: [
      {
        action: "우편함에서 우편물을 꺼내요",
        detail: "오전 10시에 1층 우편함으로 가요. 우편물을 모두 꺼내요.",
        emoji: "📬",
        caution: null,
        doneCheck: "우편함이 비었어요",
        sourceQuote: "1층 우편함에서 우편물을 모두 꺼낸다",
      },
      {
        action: "우편물을 바구니에 담아요",
        detail: "",
        emoji: "🧺",
        caution: null,
        doneCheck: "우편물을 모두 담았어요",
        sourceQuote: "우편물을 바구니에 담아",
      },
      {
        action: "바구니를 사무실로 가져와요",
        detail: "3층 사무실로 가요.",
        emoji: "🚶",
        caution: null,
        doneCheck: "3층 사무실에 왔어요",
        sourceQuote: "3층 사무실로 가져온다",
      },
      {
        action: "봉투의 부서 이름을 읽어요",
        detail: "봉투에 적힌 이름을 봐요.",
        emoji: "✉️",
        caution: null,
        doneCheck: "부서 이름을 읽었어요",
        sourceQuote: "봉투에 적힌 부서 이름을 읽는다",
      },
      {
        action: "같은 이름의 칸에 넣어요",
        detail: "부서 이름이 같은 칸을 찾아요.",
        emoji: "🗂️",
        caution: null,
        doneCheck: "우편물을 칸에 넣었어요",
        sourceQuote: "부서 이름이 같은 칸에 우편물을 넣는다",
      },
      {
        action: "이름이 없으면 '확인 필요' 바구니에 넣어요",
        detail: "부서 이름이 없는 우편물만 넣어요.",
        emoji: "❓",
        caution: null,
        doneCheck: "'확인 필요' 바구니에 넣었어요",
        sourceQuote: "부서 이름이 없는 우편물은 '확인 필요' 바구니에 넣는다",
      },
      {
        action: "택배는 선반에 올려요",
        detail: "접수대 옆 선반에 올려요.",
        emoji: "📦",
        caution: null,
        doneCheck: "택배를 선반에 올렸어요",
        sourceQuote: "상자로 온 택배는 접수대 옆 선반에 올린다",
      },
      {
        action: "담당자에게 알려요",
        detail: "다 나누었다고 말해요.",
        emoji: "🙋",
        caution: null,
        doneCheck: "담당자가 알았어요",
        sourceQuote: "다 나누면 담당자에게 끝났다고 말한다",
      },
    ],
  },
  {
    id: "g_sample_copy",
    stepPrefix: "s_copy",
    title: "문서 복사하기",
    workplace: "차근 사무실",
    manual: `[차근 사무실] 문서 복사하기

1. 복사기 화면이 켜져 있는지 본다.
2. 복사기 덮개를 위로 연다.
3. 종이의 글자가 아래로 가게 유리판에 놓는다. 유리판은 세게 누르지 않는다.
4. 종이를 유리판 왼쪽 위 모서리에 맞춘다.
5. 덮개를 천천히 닫는다.
6. 화면에서 복사할 장수를 누른다.
7. 초록색 시작 버튼을 누른다.
8. 복사된 종이를 받침대에서 꺼낸다.
9. 덮개를 열어 처음 종이를 꺼낸다.`,
    steps: [
      {
        action: "복사기 화면을 봐요",
        detail: "화면이 켜져 있는지 봐요.",
        emoji: "🖥️",
        caution: null,
        doneCheck: "화면이 켜져 있어요",
        sourceQuote: "복사기 화면이 켜져 있는지 본다",
      },
      {
        action: "덮개를 위로 열어요",
        detail: "",
        emoji: "📂",
        caution: null,
        doneCheck: "덮개가 열렸어요",
        sourceQuote: "복사기 덮개를 위로 연다",
      },
      {
        action: "종이를 유리판에 놓아요",
        detail: "글자가 아래로 가게 놓아요.",
        emoji: "📄",
        caution: "유리판을 세게 누르지 않아요.",
        doneCheck: "글자가 아래에 있어요",
        sourceQuote: "종이의 글자가 아래로 가게 유리판에 놓는다",
      },
      {
        action: "종이를 모서리에 맞춰요",
        detail: "왼쪽 위 모서리에 맞춰요.",
        emoji: "📐",
        caution: null,
        doneCheck: "종이가 모서리에 맞아요",
        sourceQuote: "왼쪽 위 모서리에 맞춘다",
      },
      {
        action: "덮개를 닫아요",
        detail: "천천히 닫아요.",
        emoji: "📕",
        caution: null,
        doneCheck: "덮개가 닫혔어요",
        sourceQuote: "덮개를 천천히 닫는다",
      },
      {
        action: "복사할 장수를 눌러요",
        detail: "화면에서 장수를 눌러요.",
        emoji: "🔢",
        caution: null,
        doneCheck: "장수가 화면에 보여요",
        sourceQuote: "화면에서 복사할 장수를 누른다",
      },
      {
        action: "초록색 시작 버튼을 눌러요",
        detail: "",
        emoji: "🟢",
        caution: null,
        doneCheck: "복사기가 움직여요",
        sourceQuote: "초록색 시작 버튼을 누른다",
      },
      {
        action: "복사된 종이를 꺼내요",
        detail: "받침대에서 꺼내요.",
        emoji: "📑",
        caution: null,
        doneCheck: "복사된 종이를 들었어요",
        sourceQuote: "복사된 종이를 받침대에서 꺼낸다",
      },
      {
        action: "처음 종이를 꺼내요",
        detail: "덮개를 열어서 꺼내요.",
        emoji: "📤",
        caution: null,
        doneCheck: "복사기 안이 비었어요",
        sourceQuote: "덮개를 열어 처음 종이를 꺼낸다",
      },
    ],
  },
  {
    id: "g_sample_shelf",
    stepPrefix: "s_shelf",
    title: "상품을 선반에 놓기",
    workplace: "차근 마트",
    manual: `[차근 마트] 상품을 선반에 놓기

1. 창고에서 상품 상자를 수레에 싣고 온다. 상자가 무거우면 동료와 같이 든다.
2. 상자의 테이프를 손으로 뜯어 연다.
3. 선반의 가격표와 상품 이름이 같은지 본다.
4. 선반에 있던 상품을 앞으로 당긴다.
5. 새 상품을 뒤쪽에 놓는다.
6. 상품 이름이 앞에서 보이게 돌린다.
7. 빈 상자는 납작하게 접어 수레에 모은다.`,
    steps: [
      {
        action: "창고에서 상자를 가져와요",
        detail: "상품 상자를 수레에 실어요.",
        emoji: "🛒",
        caution: "상자가 무거우면 동료와 같이 들어요.",
        doneCheck: "상자가 선반 앞에 있어요",
        sourceQuote: "창고에서 상품 상자를 수레에 싣고 온다",
      },
      {
        action: "상자의 테이프를 뜯어요",
        detail: "손으로 뜯어서 열어요.",
        emoji: "✋",
        caution: null,
        doneCheck: "상자가 열렸어요",
        sourceQuote: "상자의 테이프를 손으로 뜯어 연다",
      },
      {
        action: "가격표와 상품 이름을 봐요",
        detail: "이름이 같은지 봐요.",
        emoji: "🏷️",
        caution: null,
        doneCheck: "이름이 같아요",
        sourceQuote: "선반의 가격표와 상품 이름이 같은지 본다",
      },
      {
        action: "있던 상품을 앞으로 당겨요",
        detail: "",
        emoji: "👈",
        caution: null,
        doneCheck: "있던 상품이 앞에 있어요",
        sourceQuote: "선반에 있던 상품을 앞으로 당긴다",
      },
      {
        action: "새 상품을 뒤쪽에 놓아요",
        detail: "",
        emoji: "📦",
        caution: null,
        doneCheck: "새 상품이 뒤에 있어요",
        sourceQuote: "새 상품을 뒤쪽에 놓는다",
      },
      {
        action: "상품 이름이 보이게 돌려요",
        detail: "앞에서 이름이 보여야 해요.",
        emoji: "🔄",
        caution: null,
        doneCheck: "상품 이름이 앞에서 보여요",
        sourceQuote: "상품 이름이 앞에서 보이게 돌린다",
      },
      {
        action: "빈 상자를 납작하게 접어요",
        detail: "",
        emoji: "🗃️",
        caution: null,
        doneCheck: "상자가 납작해졌어요",
        sourceQuote: "빈 상자는 납작하게 접어",
      },
      {
        action: "접은 상자를 수레에 모아요",
        detail: "",
        emoji: "♻️",
        caution: null,
        doneCheck: "상자를 수레에 모았어요",
        sourceQuote: "접어 수레에 모은다",
      },
    ],
  },
  {
    id: "g_sample_books",
    stepPrefix: "s_books",
    title: "돌아온 책 꽂기",
    workplace: "차근 도서관",
    manual: `[차근 도서관] 돌아온 책 꽂기

1. 반납함의 책을 모두 수레에 담는다.
2. 책등에 붙은 번호표를 본다.
3. 번호가 작은 책부터 순서대로 수레에 세운다.
4. 번호표와 같은 번호가 적힌 책장을 찾는다.
5. 책장에서 앞 번호와 뒤 번호 사이에 책을 꽂는다.
6. 책등이 선반 앞 끝에 오게 맞춘다.
7. 찢어진 책은 꽂지 않고 '고칠 책' 바구니에 넣는다.`,
    steps: [
      {
        action: "반납함의 책을 수레에 담아요",
        detail: "책을 모두 담아요.",
        emoji: "📚",
        caution: null,
        doneCheck: "반납함이 비었어요",
        sourceQuote: "반납함의 책을 모두 수레에 담는다",
      },
      {
        action: "책등의 번호표를 봐요",
        detail: "책등에 붙은 번호표예요.",
        emoji: "🔖",
        caution: null,
        doneCheck: "번호를 읽었어요",
        sourceQuote: "책등에 붙은 번호표를 본다",
      },
      {
        action: "번호 순서대로 책을 세워요",
        detail: "번호가 작은 책부터 세워요.",
        emoji: "🔢",
        caution: null,
        doneCheck: "책이 번호 순서대로 있어요",
        sourceQuote: "번호가 작은 책부터 순서대로 수레에 세운다",
      },
      {
        action: "같은 번호의 책장을 찾아요",
        detail: "번호표와 같은 번호가 적힌 책장이에요.",
        emoji: "🔍",
        caution: null,
        doneCheck: "책장을 찾았어요",
        sourceQuote: "번호표와 같은 번호가 적힌 책장을 찾는다",
      },
      {
        action: "번호 사이에 책을 꽂아요",
        detail: "앞 번호와 뒤 번호 사이예요.",
        emoji: "📖",
        caution: null,
        doneCheck: "책이 번호 순서에 맞아요",
        sourceQuote: "앞 번호와 뒤 번호 사이에 책을 꽂는다",
      },
      {
        action: "책등을 선반 앞 끝에 맞춰요",
        detail: "",
        emoji: "📏",
        caution: null,
        doneCheck: "책등이 나란해요",
        sourceQuote: "책등이 선반 앞 끝에 오게 맞춘다",
      },
      {
        action: "찢어진 책은 바구니에 넣어요",
        detail: "'고칠 책' 바구니에 넣어요.",
        emoji: "🩹",
        caution: null,
        doneCheck: "찢어진 책을 바구니에 넣었어요",
        sourceQuote: "찢어진 책은 꽂지 않고 '고칠 책' 바구니에 넣는다",
      },
    ],
  },
  {
    id: "g_sample_packing",
    stepPrefix: "s_packing",
    title: "택배 상자 포장하기",
    workplace: "차근 물류센터",
    manual: `[차근 물류센터] 택배 상자 포장하기

1. 주문서에 적힌 물건을 선반에서 꺼낸다.
2. 물건 크기에 맞는 상자를 고른다.
3. 물건을 상자 가운데에 넣는다.
4. 빈 곳에 종이 뭉치를 채워 물건이 움직이지 않게 한다.
5. 상자 뚜껑을 닫고 테이프를 가운데에 한 줄 붙인다. 테이프 커터의 날이 날카로우니 손잡이만 잡는다.
6. 주소가 적힌 종이를 상자 윗면에 붙인다.
7. 상자를 수레에 올린다.`,
    steps: [
      {
        action: "주문서의 물건을 꺼내요",
        detail: "선반에서 꺼내요.",
        emoji: "📋",
        caution: null,
        doneCheck: "물건을 들었어요",
        sourceQuote: "주문서에 적힌 물건을 선반에서 꺼낸다",
      },
      {
        action: "크기에 맞는 상자를 골라요",
        detail: "물건 크기를 봐요.",
        emoji: "📦",
        caution: null,
        doneCheck: "상자를 골랐어요",
        sourceQuote: "물건 크기에 맞는 상자를 고른다",
      },
      {
        action: "물건을 상자 가운데에 넣어요",
        detail: "",
        emoji: "📥",
        caution: null,
        doneCheck: "물건이 상자 안에 있어요",
        sourceQuote: "물건을 상자 가운데에 넣는다",
      },
      {
        action: "빈 곳에 종이 뭉치를 채워요",
        detail: "물건이 움직이지 않게 채워요.",
        emoji: "🗞️",
        caution: null,
        doneCheck: "물건이 안 움직여요",
        sourceQuote: "빈 곳에 종이 뭉치를 채워",
      },
      {
        action: "상자 뚜껑을 닫아요",
        detail: "",
        emoji: "✅",
        caution: null,
        doneCheck: "뚜껑이 닫혔어요",
        sourceQuote: "상자 뚜껑을 닫고",
      },
      {
        action: "테이프를 한 줄 붙여요",
        detail: "가운데에 붙여요.",
        emoji: "✂️",
        caution: "테이프 커터의 날이 날카로워요. 손잡이만 잡아요.",
        doneCheck: "테이프가 붙었어요",
        sourceQuote: "테이프를 가운데에 한 줄 붙인다",
      },
      {
        action: "주소 종이를 상자에 붙여요",
        detail: "상자 윗면에 붙여요.",
        emoji: "🏷️",
        caution: null,
        doneCheck: "주소가 위에서 보여요",
        sourceQuote: "주소가 적힌 종이를 상자 윗면에 붙인다",
      },
      {
        action: "상자를 수레에 올려요",
        detail: "",
        emoji: "🛒",
        caution: null,
        doneCheck: "상자가 수레에 있어요",
        sourceQuote: "상자를 수레에 올린다",
      },
    ],
  },
  {
    id: "g_sample_towels",
    stepPrefix: "s_towels",
    title: "수건 개기",
    workplace: "차근 세탁실",
    manual: `[차근 세탁실] 수건 개기

1. 건조기가 멈추면 문을 열고 수건을 바구니에 꺼낸다. 수건이 뜨거울 수 있으니 1분 기다린다.
2. 수건을 작업대 위에 넓게 편다.
3. 수건을 반으로 접는다.
4. 한 번 더 반으로 접는다.
5. 접은 수건을 10장씩 쌓는다.
6. 쌓은 수건을 선반 맨 위 칸에 올린다.`,
    steps: [
      {
        action: "건조기 문을 열어요",
        detail: "건조기가 멈추면 열어요.",
        emoji: "🚪",
        caution: null,
        doneCheck: "문이 열렸어요",
        sourceQuote: "건조기가 멈추면 문을 열고",
      },
      {
        action: "수건을 바구니에 꺼내요",
        detail: "",
        emoji: "🧺",
        caution: "수건이 뜨거울 수 있어요. 1분 기다려요.",
        doneCheck: "수건이 바구니에 있어요",
        sourceQuote: "수건을 바구니에 꺼낸다",
      },
      {
        action: "수건을 넓게 펴요",
        detail: "작업대 위에 펴요.",
        emoji: "🤲",
        caution: null,
        doneCheck: "수건이 넓게 펴졌어요",
        sourceQuote: "수건을 작업대 위에 넓게 편다",
      },
      {
        action: "수건을 반으로 접어요",
        detail: "",
        emoji: "👐",
        caution: null,
        doneCheck: "수건이 반이 됐어요",
        sourceQuote: "수건을 반으로 접는다",
      },
      {
        action: "한 번 더 반으로 접어요",
        detail: "",
        emoji: "🙌",
        caution: null,
        doneCheck: "수건이 작아졌어요",
        sourceQuote: "한 번 더 반으로 접는다",
      },
      {
        action: "수건을 10장씩 쌓아요",
        detail: "접은 수건만 쌓아요.",
        emoji: "🔟",
        caution: null,
        doneCheck: "수건이 10장 쌓였어요",
        sourceQuote: "접은 수건을 10장씩 쌓는다",
      },
      {
        action: "수건을 선반에 올려요",
        detail: "선반 맨 위 칸에 올려요.",
        emoji: "🗄️",
        caution: null,
        doneCheck: "수건이 맨 위 칸에 있어요",
        sourceQuote: "쌓은 수건을 선반 맨 위 칸에 올린다",
      },
    ],
  },
];
