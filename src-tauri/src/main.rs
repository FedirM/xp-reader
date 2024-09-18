// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use lazy_static::lazy_static;
use llm_reader_lib::{
    chatbot::{
        get_phrasal_verb_list, get_translation, translate, PromptTranslateRequest,
        PromptTranslateResponse,
    },
    init_llm,
};
use ollama_rs::Ollama;

lazy_static! {
    static ref OllamaInstance: Ollama = init_llm().unwrap();
}

#[tauri::command]
async fn parse_text(text: String) -> Vec<String> {
    match get_phrasal_verb_list(&OllamaInstance, &text).await {
        Ok(pv) => return pv,
        Err(e) => {
            eprint!("{e}");
            return vec![];
        }
    }
}

#[tauri::command]
async fn translate_with_context(
    options: PromptTranslateRequest,
) -> Result<PromptTranslateResponse, String> {
    match get_translation(&OllamaInstance, &options).await {
        Ok(res) => Ok(res),
        Err(e) => Err(format!("{e}")),
    }
}

#[tauri::command]
async fn simple_translate(
    language: String,
    text: String,
    context: String,
) -> Result<String, String> {
    match translate(&OllamaInstance, language, text, context).await {
        Ok(tr) => Ok(tr),
        Err(e) => Err(format!("{e}")),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            parse_text,
            translate_with_context,
            simple_translate
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
