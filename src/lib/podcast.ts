import { OpenAI } from 'openai';
import { Post } from './posts';

export type PodcastEpisode = {
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  transcript: string;
};

export async function generatePodcast(post: Post): Promise<PodcastEpisode> {
  const openai = new OpenAI();

  try {
    // 1. 生成优化后的播客脚本
    const scriptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "你是一个专业的技术播客编剧。请将以下博客文章改写成适合口述的播客脚本，要求：1. 保持技术准确性 2. 使用更口语化的表达 3. 添加适当的过渡语句"
        },
        {
          role: "user",
          content: post.content
        }
      ]
    });

    const script = scriptResponse.choices[0].message.content;

    // 2. 使用 OpenAI TTS API 生成语音
    const speechResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: script || "",
    });

    // 3. 保存音频文件（这里需要实现具体的存储逻辑）
    const audioUrl = await saveAudioFile(speechResponse);

    return {
      title: `${post.title} - 播客版`,
      description: post.description,
      audioUrl,
      duration: calculateAudioDuration(script || ""),
      transcript: script || "",
    };
  } catch (error) {
    console.error('Error generating podcast:', error);
    throw error;
  }
}

// 辅助函数：保存音频文件
async function saveAudioFile(audioResponse: any): Promise<string> {
  // TODO: 实现音频文件存储逻辑
  // 可以存储到本地文件系统或云存储服务
  return "audio_url_placeholder";
}

// 辅助函数：计算音频时长
function calculateAudioDuration(script: string): number {
  // 简单估算：假设每个字符读一个字需要0.2秒
  return Math.ceil(script.length * 0.2);
} 