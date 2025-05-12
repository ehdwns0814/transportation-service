# Gemini API 설정 가이드

이 프로젝트는 Google의 Gemini API를 사용하여 AI 기반 질문-답변 기능을 제공합니다.

## 필요한 패키지 설치

```bash
npm install @google/generative-ai
```

## 환경 변수 설정

1. 프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```
# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

2. `your_gemini_api_key`를 실제 Gemini API 키로 대체하세요.

## Gemini API 키 얻는 방법

1. [Google AI Studio](https://ai.google.dev/) 웹사이트 방문
2. Google 계정으로 로그인
3. 'Get API key' 버튼 클릭
4. 새 API 키 생성 또는 기존 키 조회
5. 생성된 API 키를 복사하여 `.env.local` 파일에 붙여넣기

## 주의사항

- API 키를 소스 코드에 직접 포함하거나 공개 저장소에 업로드하지 마세요.
- `GEMINI_API_KEY`는 서버 측 코드에서 사용되며, `NEXT_PUBLIC_GEMINI_API_KEY`는 클라이언트 측 코드에서 사용할 수 있습니다. 보안을 위해 두 키 모두 설정하는 것이 좋습니다.
- 환경 변수 설정 후 개발 서버를 재시작해야 적용됩니다.
- 운영 환경에서는 환경 변수 관리 시스템을 통해 API 키를 안전하게 관리하세요.

## API 사용량 및 제한

- Gemini API는 요청량에 따라 비용이 발생할 수 있습니다.
- Google Cloud Console에서 API 사용량과 비용을 모니터링하세요.
- 필요한 경우 할당량 제한을 설정하여 의도치 않은 사용량 증가를 방지하세요.

## 사용 예시

API는 다음과 같이 사용됩니다:

```javascript
const response = await fetch('/api/ai/gemini', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ question: '운송 서비스에 대해 알려주세요' }),
});

const data = await response.json();
console.log(data.answer);
```

## 오류 해결

### 환경 변수 관련 오류

다음 명령어로 개발 서버를 재시작하여 환경 변수를 새로 불러올 수 있습니다:

```bash
npm run dev
``` 