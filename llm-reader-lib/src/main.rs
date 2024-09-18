use llm_reader_lib::{chatbot::get_phrasal_verb_list, error::Result, init_llm};

use std::env;
#[tokio::main]
async fn main() -> Result<()> {
    env::set_var("RUST_BACKTRACE", "1");
    let ollama = init_llm()?;

    let res = get_phrasal_verb_list(&ollama,
        "At its full phase, the moon’s intensity is about one millionth that of the sun, and it is possible to read a newspaper by the light of the moon. The full moon nearest the autumnal equinox in September is called the Harvest Moon. The Harvest Moon ushers in a period of several successive days when the moon rises in the northeast soon after sunset. This phenomenon gives farmers in temperate latitudes extra hours of light in which to harvest their crops before frost and winter come. The full moon following the Harvest Moon is called the Hunter’s Moon and is accompanied by a similar but less market phenomenon of early moonrise."
    ).await?;

    println!("RESULT: {:#?}", res);

    // let prompt: PromptTranslateRequest = serde_json::from_str(
    //     r#"
    //         {
    //             "preferred_language": "Ukrainian",
    //             "search_term": "每天",
    //             "passage": "小白是一只小猫。从小，小白就对外面的世界充满好奇。每天，他在村庄里玩耍，但总是渴望着更多的冒险。一天，他决定离开家，寻找属于自己的冒险之旅。小白沿着小溪走了很长时间，遇到了一条大蛇。大蛇向小白挑战说：“如果你能回答我一个问题，我就让你过去。”小白聪明地回答了问题，大蛇允许他通过了。"
    //         }
    //     "#,
    // )?;

    // let mut stream = ollama
    //     .send_chat_messages_stream(prompt.get_chat_message_request())
    //     .await?;

    // let mut stream = ollama
    //     .send_chat_messages_stream(get_phrasal_verb_list("At its full phase, the moon's intensity is about one millionth that of the sun, and it is possible to read a newspaper by the light of the moon. The full moon nearest the autumnal equinox in September is called the Harvest Moon. The Harvest Moon ushers in a period of several successive days when the moon rises in the northeast soon after sunset. This phenomenon gives farmers in temperate latitudes extra hours of light in which to harvest their crops before frost and winter come. The full moon following the Harvest Moon is called the Hunter's Moon and is accompanied by a similar but less market phenomenon of early moonrise."))
    //     .await?;

    // let mut responses: Vec<String> = Vec::default();

    // while let Some(res) = stream.next().await {
    //     let response = res.map_err(|_| "Stream.next() error!")?;

    //     if let Some(message) = response.message {
    //         responses.push(message.content.clone());
    //     }

    //     if let Some(_final) = response.final_data {
    //         println!("[DEBUG] Complete!");
    //     }
    // }

    // println!("[DEBUG-RESPONSE]: {}", responses.join(""));

    // let mut fh = std::fs::File::create(std::path::Path::new("./out.json"))?;
    // fh.write_all(responses.join("").as_bytes())?;

    // println!(
    //     "[DEBUG]: {:#?}",
    //     serde_json::from_str::<PromptResponse>(&responses.join(""))
    // );

    Ok(())
}
