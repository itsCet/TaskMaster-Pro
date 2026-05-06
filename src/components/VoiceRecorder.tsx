import { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ai } from '../lib/gemini';
import { Priority } from '../types';

export interface TranscriptionResult {
    title: string;
    priority?: Priority;
    category?: string;
}

interface VoiceRecorderProps {
    onTranscription: (result: TranscriptionResult) => void;
}

export default function VoiceRecorder({ onTranscription }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            await transcribeAudio(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
    };

    const transcribeAudio = async (audioBlob: Blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-3.1-flash-lite-preview",
                    contents: {
                        parts: [
                            {
                                inlineData: {
                                    mimeType: "audio/webm",
                                    data: base64Audio,
                                }
                            },
                            {
                                text: "Transcribe the audio precisely. Extract: title (string), priority (low|medium|high|urgent, default medium), and category (string). Return ONLY valid JSON: {\"title\": \"...\", \"priority\": \"...\", \"category\": \"...\"}.",
                            }
                        ]
                    },
                });
                if (response.text) {
                    try {
                        const jsonStart = response.text.indexOf('{');
                        const jsonEnd = response.text.lastIndexOf('}');
                        const jsonString = response.text.substring(jsonStart, jsonEnd + 1);
                        const result: TranscriptionResult = JSON.parse(jsonString);
                        onTranscription(result);
                    } catch (e) {
                         onTranscription({ title: response.text });
                    }
                }
            } catch (error) {
                console.error("Transcription error:", error);
            }
        };
    };

    return (
        <motion.button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors border ${isRecording ? 'bg-red-500 border-red-600 text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}
        >
            {isRecording && (
                <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-xl bg-red-400 opacity-20"
                />
            )}
            <AnimatePresence mode="wait">
                {isRecording ? (
                    <motion.div key="stop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Square className="w-4 h-4" />
                    </motion.div>
                ) : (
                    <motion.div key="mic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Mic className="w-4 h-4" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
