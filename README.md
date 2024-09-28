# Reader (code name: XP-Reader)

This is a test project to test ready-to-use ML models like: ollama-3.1, mistral-nemo, gemma-2

The key goal of this application is to get all you need to read a text on foreign language. There are two main features:

- Get voca nest for word/phrase.
- Get translation for part of sentence(s)/passage.

Fully free to use with pre-installed ollama model!

# How does it work?

1. Select your preferable language from the dropdown.
2. Write down text in the editor below.

![editor picture](https://github.com/FedirM/xp-reader/screenshots/editor.png)

3. Hit "Go reading" button.

![editor picture](https://github.com/FedirM/xp-reader/screenshots/reader.png)

- Click on word you'd like to translate.

![editor picture](https://github.com/FedirM/xp-reader/screenshots/tr_word.png)

- If you'd like to translate substring or sentence just press and hover your needs.

![editor picture](https://github.com/FedirM/xp-reader/screenshots/tr_phrase.png)

![editor picture](https://github.com/FedirM/xp-reader/screenshots/tr_phrase_2.png)

# Tech stack

_Back-end_: Rust (tauri, serde_json, ollama-rs, tokio, lazy_static)

_Front-end_: ReactJS (Adobe-spectrum, Adobe-aria, Tailwind)
