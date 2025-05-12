<<<<<<< HEAD
# 프리매칭 - 프리랜서 용차 매칭 플랫폼

중개 수수료 없는 1:1 프리랜서 용차 매칭 플랫폼으로 기업과 프리랜서를 직접 연결합니다.

## 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 시작
npm run dev
```

## 환경 변수 설정

프로젝트 실행을 위해 다음 환경 변수가 필요합니다. `.env.local` 파일을 프로젝트 루트에 생성하고 아래 변수를 설정해주세요.

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

환경 변수가 올바르게 설정되었는지 확인하려면 다음 명령어를 실행하세요:

```bash
npm run check-env
```

## Supabase API 사용 가이드

Supabase API를 사용할 때는 다음 가이드라인을 따라주세요:

### 권장: Supabase JS 클라이언트 사용

가능한 한 Supabase JS 클라이언트를 사용하세요. 이 방법은 인증 헤더를 자동으로 처리합니다:

```javascript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// 컴포넌트/페이지 내에서
const supabase = createClientComponentClient();
const { data, error } = await supabase
  .from('your_table')
  .select('*');
```

### 직접 REST API 호출 (권장하지 않음)

직접 REST API 호출이 필요한 경우, 반드시 `apikey` 헤더를 포함해야 합니다:

```javascript
// 권장하지 않지만 참고용으로 제공
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/your_table`,
  {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  }
);
```

더 자세한 정보는 `SUPABASE.md` 파일을 참조하세요.

## Supabase 설정

1. [Supabase](https://supabase.com/)에 가입하고 새 프로젝트를 생성합니다.
2. Authentication > Providers에서 원하는 소셜 로그인 제공자(Google, Kakao, Naver)를 활성화합니다.
3. 프로젝트 설정에서 URL 및 anon key를 복사하여 `.env.local` 파일에 붙여넣습니다.
4. Redirect URLs을 설정합니다: `http://localhost:3000/auth/callback` (개발 환경)

## 소셜 로그인 설정

### Google 로그인 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 OAuth 클라이언트 ID를 생성합니다.
2. Authorized redirect URIs에 `https://[YOUR_SUPABASE_PROJECT].supabase.co/auth/v1/callback`을 추가합니다.
3. 클라이언트 ID와 시크릿을 Supabase 대시보드의 Authentication > Providers > Google에 입력합니다.

### Kakao 로그인 설정

1. [Kakao Developers](https://developers.kakao.com/)에서 애플리케이션을 생성합니다.
2. 플랫폼 > Web에 사이트 도메인을 추가합니다.
3. 카카오 로그인 > Redirect URI에 `https://[YOUR_SUPABASE_PROJECT].supabase.co/auth/v1/callback`을 추가합니다.
4. 앱 키와 시크릿을 Supabase 대시보드의 Authentication > Providers > Kakao에 입력합니다.

### Naver 로그인 설정

1. [Naver Developers](https://developers.naver.com/)에서 애플리케이션을 생성합니다.
2. 로그인 API 서비스 환경의 서비스 URL에 사이트 도메인을 추가합니다.
3. Callback URL에 `https://[YOUR_SUPABASE_PROJECT].supabase.co/auth/v1/callback`을 추가합니다.
4. 클라이언트 ID와 시크릿을 Supabase 대시보드의 Authentication > Providers > Naver에 입력합니다.
=======
# transportation-service
>>>>>>> dd7d61fe720ce06b86a2dc5a5c310587ddb42f46
