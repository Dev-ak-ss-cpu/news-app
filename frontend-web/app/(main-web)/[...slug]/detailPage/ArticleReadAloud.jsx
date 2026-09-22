"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, RotateCcw, Square } from "lucide-react";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

// Chrome drops long utterances after ~15s, so the article is spoken in small
// pieces. Each piece also gives us a fresh timing sample for the estimator.
const CHUNK_CHARS = 120;
const HARD_CHUNK_CHARS = 200;

// Rough Hindi speaking speed (characters per second at 1x). It is re-measured
// after every chunk, so the first sentence is the only guess we ever make.
const DEFAULT_CPS = 14;

const SENTENCE_END = /[।.!?;:]["')\]]*$/;

// Wrap every word of the given roots in its own <span> so a single word can be
// highlighted while it is being spoken.
function collectTokens(roots) {
    const tokens = [];

    roots.forEach((root) => {
        if (!root || !root.ownerDocument) return;

        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                if (parent.classList.contains("tts-word")) return NodeFilter.FILTER_REJECT;
                const tag = parent.tagName;
                if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
                if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            },
        });

        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) textNodes.push(node);

        textNodes.forEach((textNode) => {
            const fragment = document.createDocumentFragment();

            textNode.nodeValue.split(/(\s+)/).forEach((part) => {
                if (!part) return;
                if (!part.trim()) {
                    fragment.appendChild(document.createTextNode(part));
                    return;
                }
                const span = document.createElement("span");
                span.className = "tts-word";
                span.textContent = part;
                fragment.appendChild(span);
                tokens.push({ el: span, text: part });
            });

            textNode.parentNode?.replaceChild(fragment, textNode);
        });
    });

    return tokens;
}

// Group the words into utterance-sized chunks, remembering where each word
// starts inside the chunk text so a boundary event maps back to a word.
function buildChunks(tokens) {
    const chunks = [];
    let words = [];
    let offsets = [];
    let start = 0;
    let length = 0;

    const flush = () => {
        if (!words.length) return;
        chunks.push({ text: words.join(" "), offsets, start, count: words.length });
        words = [];
        offsets = [];
        length = 0;
    };

    tokens.forEach((token, index) => {
        if (!words.length) start = index;
        offsets.push(length);
        words.push(token.text);
        length += token.text.length + 1;

        if ((length >= CHUNK_CHARS && SENTENCE_END.test(token.text)) || length >= HARD_CHUNK_CHARS) flush();
    });

    flush();
    return chunks;
}

// Used when the voice engine dies mid chunk: speak what is left of it.
function chunkFromRange(tokens, start, end) {
    const words = [];
    const offsets = [];
    let length = 0;

    for (let index = start; index <= end; index += 1) {
        offsets.push(length);
        words.push(tokens[index].text);
        length += tokens[index].text.length + 1;
    }

    return { text: words.join(" "), offsets, start, count: words.length };
}

function wordIndexForChar(chunk, charIndex) {
    const { offsets } = chunk;
    let low = 0;
    let high = offsets.length - 1;
    let found = 0;

    while (low <= high) {
        const mid = (low + high) >> 1;
        if (offsets[mid] <= charIndex) {
            found = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    return found;
}

export default function ArticleReadAloud({ sources = [], resetKey }) {
    const [supported, setSupported] = useState(false);
    const [status, setStatus] = useState("idle"); // idle | playing | paused
    const [rate, setRate] = useState(1);
    const [progress, setProgress] = useState({ spoken: 0, total: 0 });

    const tokensRef = useRef(null);
    const chunksRef = useRef([]);
    const chunkIndexRef = useRef(0);
    const wordIndexRef = useRef(-1);
    const statusRef = useRef("idle");
    const rateRef = useRef(1);
    const voiceRef = useRef(null);
    const cpsRef = useRef(DEFAULT_CPS);
    const generationRef = useRef(0);
    const utteranceRef = useRef(null);
    const tickerRef = useRef(null);
    const watchdogRef = useRef(null);
    const silentSinceRef = useRef(0);
    const recoveriesRef = useRef(0);
    const startTimerRef = useRef(null);
    const resumeTimerRef = useRef(null);
    const chunkStartedRef = useRef(0);
    const pausedAtRef = useRef(0);
    const lastScrollRef = useRef(0);
    const aliveRef = useRef(true);

    const applyStatus = (next) => {
        statusRef.current = next;
        setStatus(next);
    };

    const stopTicker = () => {
        if (tickerRef.current) {
            clearInterval(tickerRef.current);
            tickerRef.current = null;
        }
    };

    const clearTimers = () => {
        stopTicker();
        if (watchdogRef.current) {
            clearInterval(watchdogRef.current);
            watchdogRef.current = null;
        }
        clearTimeout(startTimerRef.current);
        clearTimeout(resumeTimerRef.current);
    };

    const keepVisible = (el) => {
        const now = performance.now();
        if (now - lastScrollRef.current < 500) return;

        const rect = el.getBoundingClientRect();
        if (rect.top >= 110 && rect.bottom <= window.innerHeight - 120) return;

        lastScrollRef.current = now;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const highlight = (index) => {
        const tokens = tokensRef.current;
        if (!tokens || !tokens.length) return;

        const next = Math.min(Math.max(index, 0), tokens.length - 1);
        if (next === wordIndexRef.current) return;

        const previous = tokens[wordIndexRef.current];
        if (previous) previous.el.classList.remove("tts-speaking");

        tokens[next].el.classList.add("tts-speaking");
        wordIndexRef.current = next;
        setProgress((prev) => (prev.spoken === next + 1 ? prev : { ...prev, spoken: next + 1 }));
        keepVisible(tokens[next].el);
    };

    const clearHighlight = () => {
        const tokens = tokensRef.current;
        const current = tokens && tokens[wordIndexRef.current];
        if (current) current.el.classList.remove("tts-speaking");
        wordIndexRef.current = -1;
    };

    // Fallback used while a voice does not report word boundaries (most of the
    // network voices on Chrome). It walks the words at the measured speed and
    // is re-synced at the end of every chunk.
    const startTicker = (chunk, generation) => {
        stopTicker();
        tickerRef.current = setInterval(() => {
            if (generation !== generationRef.current || statusRef.current !== "playing") return;

            const elapsed = (performance.now() - chunkStartedRef.current) / 1000;
            const spokenChars = elapsed * cpsRef.current * (rateRef.current || 1);

            let index = 0;
            while (index + 1 < chunk.count && chunk.offsets[index + 1] <= spokenChars) index += 1;
            highlight(chunk.start + index);
        }, 90);
    };

    const calibrate = (chunk) => {
        const elapsed = (performance.now() - chunkStartedRef.current) / 1000;
        if (elapsed < 0.4 || chunk.text.length < 20) return;

        const observed = chunk.text.length / elapsed / (rateRef.current || 1);
        if (!Number.isFinite(observed) || observed < 4 || observed > 40) return;

        cpsRef.current = cpsRef.current * 0.65 + observed * 0.35;
    };

    const finish = () => {
        clearTimers();
        clearHighlight();
        applyStatus("idle");
        setProgress((prev) => ({ ...prev, spoken: prev.total }));
    };

    function speakChunk(index, generation, override) {
        if (!aliveRef.current || generation !== generationRef.current) return;

        const chunk = override || chunksRef.current[index];
        if (!chunk) {
            finish();
            return;
        }

        chunkIndexRef.current = index;

        const utterance = new SpeechSynthesisUtterance(chunk.text);
        if (voiceRef.current) utterance.voice = voiceRef.current;
        utterance.lang = voiceRef.current?.lang || "hi-IN";
        utterance.rate = rateRef.current;

        utterance.onstart = () => {
            if (generation !== generationRef.current) return;
            chunkStartedRef.current = performance.now();
            recoveriesRef.current = 0;
            highlight(chunk.start);
            startTicker(chunk, generation);
        };

        utterance.onboundary = (event) => {
            if (generation !== generationRef.current) return;
            if (event.name && event.name !== "word") return;
            stopTicker(); // the voice reports real boundaries, drop the estimate
            highlight(chunk.start + wordIndexForChar(chunk, event.charIndex));
        };

        utterance.onend = () => {
            if (generation !== generationRef.current) return;
            stopTicker();
            calibrate(chunk);
            highlight(chunk.start + chunk.count - 1);
            speakChunk(index + 1, generation);
        };

        utterance.onerror = (event) => {
            if (generation !== generationRef.current) return;
            stopTicker();
            if (event?.error === "interrupted" || event?.error === "canceled") return;
            speakChunk(index + 1, generation);
        };

        utteranceRef.current = utterance; // keep a reference alive for Chrome
        window.speechSynthesis.speak(utterance);
    }

    const prepare = () => {
        if (tokensRef.current) return tokensRef.current;

        const roots = sources
            .map((source) => (source && typeof source === "object" && "current" in source ? source.current : source))
            .filter(Boolean);

        const tokens = collectTokens(roots);
        tokensRef.current = tokens;
        chunksRef.current = buildChunks(tokens);
        setProgress({ spoken: 0, total: tokens.length });
        return tokens;
    };

    const startFrom = (index) => {
        const generation = (generationRef.current += 1);
        clearTimers();
        window.speechSynthesis.cancel();
        chunkIndexRef.current = index;
        silentSinceRef.current = 0;
        recoveriesRef.current = 0;
        applyStatus("playing");
        startWatchdog();
        if (index === 0) setProgress((prev) => ({ ...prev, spoken: 0 }));

        // Chrome ignores speak() fired in the same tick as cancel().
        startTimerRef.current = setTimeout(() => {
            if (aliveRef.current && generation === generationRef.current) speakChunk(index, generation);
        }, 60);
    };

    // Chrome and most Android browsers sometimes drop an utterance without
    // firing onend. Detect the silence and carry on from the last spoken word.
    const startWatchdog = () => {
        if (watchdogRef.current) clearInterval(watchdogRef.current);

        watchdogRef.current = setInterval(() => {
            const synth = window.speechSynthesis;
            if (statusRef.current !== "playing") return;

            if (synth.speaking || synth.pending) {
                silentSinceRef.current = 0;
                return;
            }

            const now = performance.now();
            if (!silentSinceRef.current) {
                silentSinceRef.current = now;
                return;
            }
            if (now - silentSinceRef.current < 1200) return;

            silentSinceRef.current = 0;
            recoveriesRef.current += 1;
            if (recoveriesRef.current > 3) {
                finish();
                return;
            }

            const tokens = tokensRef.current;
            const chunk = chunksRef.current[chunkIndexRef.current];
            if (!tokens || !chunk) return;

            const generation = (generationRef.current += 1);
            const last = chunk.start + chunk.count - 1;
            const from = Math.max(wordIndexRef.current + 1, chunk.start);

            if (from > last) speakChunk(chunkIndexRef.current + 1, generation);
            else speakChunk(chunkIndexRef.current, generation, chunkFromRange(tokens, from, last));
        }, 600);
    };

    const pause = () => {
        stopTicker();
        pausedAtRef.current = performance.now();
        window.speechSynthesis.pause();
        applyStatus("paused");
    };

    const resume = () => {
        const synth = window.speechSynthesis;
        chunkStartedRef.current += performance.now() - pausedAtRef.current;
        applyStatus("playing");
        synth.resume();

        // Some mobile browsers ignore resume() - replay the chunk instead.
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = setTimeout(() => {
            if (aliveRef.current && statusRef.current === "playing" && !synth.speaking) {
                startFrom(chunkIndexRef.current);
            }
        }, 350);
    };

    const stop = () => {
        generationRef.current += 1;
        clearTimers();
        window.speechSynthesis.cancel();
        clearHighlight();
        chunkIndexRef.current = 0;
        applyStatus("idle");
        setProgress((prev) => ({ ...prev, spoken: 0 }));
    };

    const toggle = () => {
        if (statusRef.current === "playing") {
            pause();
            return;
        }
        if (statusRef.current === "paused") {
            resume();
            return;
        }
        if (!prepare().length) return;
        startFrom(0);
    };

    const restart = () => {
        if (!prepare().length) return;
        clearHighlight();
        setProgress((prev) => ({ ...prev, spoken: 0 }));
        startFrom(0);
    };

    const changeRate = (value) => {
        rateRef.current = value;
        setRate(value);
        // A rate change only applies to a new utterance, so replay the chunk.
        if (statusRef.current === "playing") startFrom(chunkIndexRef.current);
    };

    useEffect(() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;

        const synth = window.speechSynthesis;
        aliveRef.current = true;
        setSupported(true);

        const pickVoice = () => {
            const voices = synth.getVoices() || [];
            const hindi = voices.filter((voice) => /^hi([-_]|$)/i.test(voice.lang || ""));
            const pool = hindi.length ? hindi : voices.filter((voice) => /^en[-_]IN/i.test(voice.lang || ""));
            // Local voices report word boundaries, network voices usually do not.
            voiceRef.current = pool.find((voice) => voice.localService) || pool[0] || null;
        };

        pickVoice();
        synth.addEventListener?.("voiceschanged", pickVoice);

        return () => {
            aliveRef.current = false;
            generationRef.current += 1;
            synth.removeEventListener?.("voiceschanged", pickVoice);
            clearTimers();
            synth.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // A different article was rendered into the same page - start over.
    useEffect(() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

        generationRef.current += 1;
        clearTimers();
        window.speechSynthesis.cancel();
        tokensRef.current = null;
        chunksRef.current = [];
        chunkIndexRef.current = 0;
        wordIndexRef.current = -1;
        applyStatus("idle");
        setProgress({ spoken: 0, total: 0 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetKey]);

    if (!supported) return null;

    const percent = progress.total ? Math.round((progress.spoken / progress.total) * 100) : 0;
    const label = status === "playing" ? "रोकें" : status === "paused" ? "जारी रखें" : "खबर सुनें";
    const statusText =
        status === "playing" ? "ऑडियो चल रहा है" : status === "paused" ? "ऑडियो रुका है" : "शब्द-दर-शब्द सुनें";

    return (
        <div className="mt-4 sm:mt-5 pt-4 border-t border-gray-200 print:hidden">
            <div className="rounded-xl sm:rounded-2xl border-l-4 border-red-600 bg-gray-900 text-white shadow-md px-3 py-3 sm:px-4 sm:py-3.5">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={toggle}
                        aria-label={label}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors duration-200"
                    >
                        {status === "playing" ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
                        {label}
                    </button>

                    <button
                        type="button"
                        onClick={restart}
                        aria-label="शुरुआत से सुनें"
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-700 hover:bg-gray-600 px-3 py-2 text-xs sm:text-sm font-medium transition-colors duration-200"
                    >
                        <RotateCcw size={14} />
                        शुरुआत से
                    </button>

                    {status !== "idle" && (
                        <button
                            type="button"
                            onClick={stop}
                            aria-label="ऑडियो बंद करें"
                            title="बंद करें"
                            className="inline-flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 w-9 h-9 transition-colors duration-200"
                        >
                            <Square size={13} fill="currentColor" />
                        </button>
                    )}

                    <label className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                        गति
                        <select
                            value={rate}
                            onChange={(event) => changeRate(Number(event.target.value))}
                            aria-label="पढ़ने की गति"
                            className="rounded-lg bg-gray-800 border border-gray-600 px-2 py-1.5 text-xs sm:text-sm text-white outline-none focus:border-red-500"
                        >
                            {SPEEDS.map((speed) => (
                                <option key={speed} value={speed}>
                                    {speed}x
                                </option>
                            ))}
                        </select>
                    </label>

                    <span className="ml-auto flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                        <Headphones size={14} className="text-red-400" />
                        {statusText}
                    </span>
                </div>

                {progress.total > 0 && (
                    <div className="mt-2.5 flex items-center gap-2 sm:gap-3">
                        <div className="h-1 flex-1 rounded-full bg-gray-700 overflow-hidden">
                            <div
                                className="h-full bg-red-500 rounded-full transition-[width] duration-200 ease-linear"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                        <span className="text-[11px] text-gray-400 tabular-nums whitespace-nowrap">
                            {progress.spoken}/{progress.total} शब्द
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
