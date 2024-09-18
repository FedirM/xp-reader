use crate::constants::MODEL;
use crate::error::{CustomError, Result};
use ollama_rs::{
    generation::chat::{request::ChatMessageRequest, ChatMessage, MessageRole},
    Ollama,
};
use serde::{Deserialize, Serialize};
use std::fmt::Display;

pub const PHRASE_SEARCH_RULES: &str = r#"
Prepare a valid Array of strings of phrasal verbs according to next rules:
1. Select phrasal verbs from original text without any changes. DO NOT TRANSLATE THEM! Recheck if your matched phrasal verb is matching certain substing in text!
2. YOUR RESPONSE SHOULD BE THE VALID JSON STRING WITHOUT ANY WRAPPERS! (like ```json and so on)
"#;

pub const TRANSLATE_PROMPT_RULES: &str = r#"
1. Determine the passage language and remind it as a SOURCE_LANGUAGE.
2. Remind the language you need to translate to as a PREFERRED_LANGUAGE.
3. YOUR RESPONSE SHOULD BE THE VALID JSON STRING WITHOUT ANY WRAPPERS! (like ```json and so on)
4. JSON in response should include (For each property I set up language to use, if not - use SOURCE_LANGUAGE):
 - search_term - the string you asked to translate
 - source_language - SOURCE_LANGUAGE as a string (full name)
 - preferred_language - PREFERRED_LANGUAGE as a string (full name)
 - transcription - how to read "search_term" in SOURCE_LANGUAGE using the International Phonetic Alphabet, IPA
 - translation - translation of search_term in PREFERRED_LANGUAGE rely on passage below.
 - meaning_source - provide definition of the search term in SOURCE_LANGUAGE
 - meaning_preferred - translate "meaning_source" into PREFERRED_LANGUAGE

5. search_term and meaning_source - shouldn't be the same, if so - rephrase meaning_source in more simple way. (use SOURCE_LANGUAGE)
6. translation and meaning_preferred - shouldn't be the same, if so - rephrase meaning_source in more simple way. (use PREFERRED_LANGUAGE)
"#;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptTranslateRequest {
    pub preferred_language: String,
    pub passage: String,
    pub search_term: String,
}

impl Display for PromptTranslateRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            r#"Find in passage and translate "{}" into PREFERRED_LANGUAGE="{}", rely on this passage: {}"#,
            self.search_term, self.preferred_language, self.passage
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptTranslateResponse {
    pub search_term: String,
    pub source_language: String,
    pub preferred_language: String,
    pub transcription: String,
    pub translation: String,
    pub meaning_source: String,
    pub meaning_preferred: String,
}

// ####### Methods #########

pub async fn get_phrasal_verb_list(ollama: &Ollama, context: &str) -> Result<Vec<String>> {
    let msg = format!("{}\nText: {}", PHRASE_SEARCH_RULES, context);
    let req = ChatMessageRequest::new(
        MODEL.to_owned(),
        vec![ChatMessage::new(MessageRole::User, msg)],
    );

    let mut content = "[]".to_owned();
    if let Some(message) = (ollama.send_chat_messages(req).await?).message {
        content = message.content;
    }

    println!("[DEBUG]: {}", &content);

    let result = serde_json::from_str::<Vec<String>>(&content)?;

    Ok(result)
}

pub async fn get_translation(
    ollama: &Ollama,
    request: &PromptTranslateRequest,
) -> Result<PromptTranslateResponse> {
    let msg = format!("{}\n{}", TRANSLATE_PROMPT_RULES, request);
    let req = ChatMessageRequest::new(
        MODEL.to_owned(),
        vec![ChatMessage::new(MessageRole::User, msg)],
    );

    match (ollama.send_chat_messages(req).await?).message {
        Some(message) => match serde_json::from_str(&message.content) {
            Ok(res) => Ok(res),
            Err(e) => {
                eprintln!("[get_translation] serialization err: {e}");
                return Err(Box::new(CustomError::new("Incorrect LLM response!")));
            }
        },
        None => Err(Box::new(CustomError::new("Incorrect LLM response!"))),
    }
}

pub async fn translate(
    ollama: &Ollama,
    language: String,
    text: String,
    context: String,
) -> Result<String> {
    let msg = format!(
        // "Your task is to translate piece of text to {} language. Piece of text: {}",
        r#"JUST WRITE A TRANSLATION WHITHOUT ANYTHING ADDITIONAL INFO!
        Here is the context for translation passage below: "{}"
        Please translate into {} language: {}"#,
        context, language, text
    );
    let req = ChatMessageRequest::new(
        MODEL.to_owned(),
        vec![ChatMessage::new(MessageRole::User, msg)],
    );

    match (ollama.send_chat_messages(req).await?).message {
        Some(message) => Ok(message.content),
        None => Err(Box::new(CustomError::new("Incorrect LLM response!"))),
    }
}
