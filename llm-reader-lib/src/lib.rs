// use chatbot::PromptRequest;
use constants::{OLLAMA_HOST, OLLAMA_PORT};
use error::Result;
use ollama_rs::Ollama;

pub mod chatbot;
pub mod constants;
pub mod error;

pub fn init_llm() -> Result<Ollama> {
    return Ok(Ollama::try_new(format!("{}:{}", OLLAMA_HOST, OLLAMA_PORT))?);
}
