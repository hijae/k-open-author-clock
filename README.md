# Open Author Clock ⏰

[Author Clock](https://www.authorclock.com) 킥스타터 프로젝트를 웹 브라우저에서 그대로 구현한 오픈소스 프로젝트입니다.

## ✨ 작동 화면 ✨

문학의 언어를 굳이 책 속에만 가둬 둘 이유가 있을까요? 이 프로젝트는 하루의 매 분마다 문학 속 한 구절을 불러와 옛 작가들의 문장으로 지금 이 순간의 시각을 알려줍니다.

<p align="center">
<img src="example-photo.jpg" height="400">

한번 사용해 보세요: [__라이브 데모 사이트 🖥️__](https://hijae.github.io/k-open-author-clock/)

### 원작에 감사드리며

이 저장소는 [Amber Caravalho](https://github.com/ambercaravalho)님이 만든 [open-author-clock](https://github.com/ambercaravalho/open-author-clock)을 포크해 한국어 번역과 몇 가지 기능을 더한 것입니다. 코드를 오픈소스로 공개해 주신 덕분에 이런 작업이 가능했습니다. 진심으로 감사드립니다.

### 영감을 준 프로젝트들

이 프로젝트는 다음 두 프로젝트에서 영감을 받았습니다.

- [The Author Clock](https://www.authorclock.com): 매 분마다 새로 고른 문학 구절로 시간을 알려주는 전용 기기.
- [elegantalchemist](https://github.com/elegantalchemist)님의 [literaryclock 저장소](https://github.com/elegantalchemist/literaryclock): 킨들 키보드에서 파이썬으로 문학 시계를 이미 구현해 낸 아이디어.

## 이번 포크에서 추가한 것

- **한국어 번역** (`data.ko.json`): 원본 영어 인용문 전체를 한국어로 옮기고, 한국에서 주로 쓰는 12시간제에 맞춰 "3시 15분 전", "자정" 같은 자연스러운 한국어 시각 표현으로 다듬었습니다.
- **한국 근대문학 인용구 추가**: 저작권이 만료된 한국 근대문학(이상, 김동인, 채만식, 이광수, 나도향, 현진건, 심훈, 계용묵)에서 시각이 명시된 문장을 찾아 함께 실었습니다.
- **언어 전환**: 주소 끝에 `?lang=ko` 또는 `?lang=en`을 붙이면 한국어/영어 데이터셋을 바로 전환해서 볼 수 있습니다. 기본값은 `config.js`의 `language` 값을 따릅니다.
- **화면에 맞춰 자동으로 조정되는 글자 크기**: 글자 수를 어림잡아 크기를 정하던 방식 대신, 실제로 렌더링된 인용문의 높이를 재서 화면을 벗어나지 않을 때까지 자동으로 줄이거나 키웁니다. 창 크기를 바꾸거나 화면을 돌려도 다시 맞춰집니다.
- **더 눈에 띄는 시각 강조 표시**: 인용문 속에서 시각을 가리키는 부분을 굵게 표시하는 데 그치지 않고 형광펜으로 칠한 듯한 배경색을 더해 한눈에 들어오도록 했습니다.

## 설정

`config.js` 파일을 수정해서 시계의 동작을 바꿀 수 있습니다.

- **언어**: 기본 언어(`language`)와 언어별 데이터 파일 경로(`dataUrls`)
- **업데이트 주기**: 인용문이 갱신되는 간격
- **페이드 지속 시간**: 인용문이 바뀔 때 전환 속도
- **글자 크기**: 인용문이 화면에 맞춰 커지거나 작아지는 범위(`minPx`, `maxPx`)와 채우는 비율(`heightRatio`)
- **화면 꺼짐 방지**: 화면을 보는 동안 꺼지지 않게 유지
- **UTC 시간대**: UTC를 쓰는 기기를 위한 자동 보정

## 인용문 추가하기

시각에 딱 들어맞는 인용문을 발견했다면 언제든 추가해 주세요!

### 인용문 형식

각 인용문은 `data.json`(영어) 또는 `data.ko.json`(한국어) 파일 안에 다음과 같은 JSON 객체로 넣습니다.

```json
{
  "time": "14:45",
  "timeString": "quarter to three",
  "quote": "The full sentence from the book where the time is mentioned.",
  "title": "Book Title",
  "author": "Author Name"
}
```

- **time**: 인용문이 나타내는 시각. 24시간제로 표기합니다(예: `14:45`).
- **timeString**: 인용문 안에서 시각을 가리키는 표현으로, 화면에서 강조되는 부분입니다(예: `quarter to three`).
- **quote**: 시각이 언급된 책 속 문장 전체.
- **title**: 인용문이 나온 책의 제목.
- **author**: 그 책의 작가.

한국어 데이터셋 예시:

```json
{
  "time": "00:00",
  "timeString": "자정",
  "quote": "그것은 자정에 시작된다.",
  "title": "캣칭 파이어",
  "author": "수잔 콜린스"
}
```

`timeString`은 반드시 `quote` 문자열 안에 그대로 포함되어 있어야 합니다. 화면에서 강조 표시를 할 때 이 값을 문자열 그대로 찾아서 표시하기 때문입니다.

### 인용문을 추가하는 방법

1. `data.json` 또는 `data.ko.json` 파일을 엽니다.
2. 시각 순서대로 정렬되어 있으니, 알맞은 위치를 찾습니다.
3. 새 인용문 객체를 배열에 추가합니다.
4. JSON 형식이 올바른지 확인합니다(객체 사이에 쉼표를 빠뜨리지 않도록 주의하세요!).

## 더 알아보기

### 알려진 문제

이 저장소의 [이슈](https://github.com/hijae/k-open-author-clock/issues) 페이지에서 알려진 문제를 확인하고, 프로젝트를 더 좋게 만드는 데 힘을 보탤 수 있습니다.

### 라이선스 안내

이 프로젝트의 영어 인용문은 GNU General Public License v3.0에 따라 [literaryclock](https://github.com/elegantalchemist/literaryclock) 저장소에서 가져왔습니다. 한국어 인용문 중 근대문학 작품은 저작권이 만료되어 퍼블릭 도메인에 속한 원문을 바탕으로 삼았습니다.

이 포크 자체도 [Amber Caravalho](https://github.com/ambercaravalho)님의 [open-author-clock](https://github.com/ambercaravalho/open-author-clock)이 GPL-3.0으로 공개되어 있었기에 존재할 수 있었습니다. 원저작자와 라이선스에 다시 한번 감사드립니다.
