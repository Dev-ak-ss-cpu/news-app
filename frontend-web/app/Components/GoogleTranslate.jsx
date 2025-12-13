"use client";
import { useEffect, useState } from "react";

const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
];

export default function GoogleTranslateDropdown() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const scriptId = "google-translate-script";
        if (document.getElementById(scriptId)) {
            setLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.id = scriptId;
        script.src =
            "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;

        // Global init callback (required by Google)
        window.googleTranslateElementInit = () => {
            /* eslint-disable no-undef */
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "hi", // your base language
                    // include the same languages as in LANGUAGES
                    includedLanguages: LANGUAGES.map(l => l.code).join(","),
                    autoDisplay: false,
                },
                "google_translate_element"
            );
            setLoaded(true);
        };

        document.body.appendChild(script);
    }, []);

    const handleChange = (e) => {
        const value = e.target.value;
        const combo = document.querySelector(".goog-te-combo");
        if (!combo) return;
        combo.value = value;
        combo.dispatchEvent(new Event("change"));
    };

    return (
        <div className="flex items-center gap-2">
            {/* Hidden original Google element */}
            <div
                id="google_translate_element"
                style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
            />

            {/* Your visible dropdown */}
            <select
                onChange={handleChange}
                disabled={!loaded}
                className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white text-gray-800"
                defaultValue=""
            >
                <option value="" disabled>
                    भाषा चुनें
                </option>
                {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
