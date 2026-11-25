const DEGREES = ["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ"];
const MAJOR_DEGREE_SEMITONES = [0, 2, 4, 5, 7, 9, 11];
const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];

const PITCH_SPELLINGS = {
    0:  ["C", "B♯", "D♭♭"],
    1:  ["C♯", "D♭"],
    2:  ["D", "C♯♯", "E♭♭"],
    3:  ["E♭", "D♯", "F♭♭"],
    4:  ["E", "F♭", "D♯♯"],
    5:  ["F", "E♯", "G♭♭"],
    6:  ["F♯", "G♭"],
    7:  ["G", "F♯♯", "A♭♭"],
    8:  ["A♭", "G♯"],
    9:  ["A", "G♯♯", "B♭♭"],
    10: ["B♭", "A♯", "C♭♭"],
    11: ["B", "C♭", "A♯♯"]
};

const KEY_ROOT_PITCH = {
    "C": 0,
    "F": 5,
    "B♭": 10,
    "E♭": 3,
    "A♭ (G♯)": 8,
    "D♭ (C♯)": 1,
    "F♯ (G♭)": 6,
    "B": 11,
    "E": 4,
    "A": 9,
    "D": 2,
    "G": 7
};

const MAJOR_START_LETTER = {
    "C": "C",
    "F": "F",
    "B♭": "B",
    "E♭": "E",
    "A♭ (G♯)": "A",
    "D♭ (C♯)": "D",
    "F♯ (G♭)": "F",
    "B": "B",
    "E": "E",
    "A": "A",
    "D": "D",
    "G": "G"
};

const MINOR_START_LETTER = {
    "C":        "C",
    "F":        "F",
    "B♭":       "B",
    "E♭":       "E",
    "A♭ (G♯)": "G",
    "D♭ (C♯)": "C",
    "F♯ (G♭)": "F",
    "B":        "B",
    "E":        "E",
    "A":        "A",
    "D":        "D",
    "G":        "G"
};

// 統合表（コードネーム）で同主調ルート統一に使う開始音・フラット優先設定
const CHORD_TABLE_MINOR_START_LETTER = {
    "A♭ (G♯)": "A",
    "D♭ (C♯)": "D",
    "F♯ (G♭)": "F"
};

const CHORD_TABLE_PREFER_FLAT_KEYS = new Set([
    "F",
    "B♭",
    "E♭",
    "A♭ (G♯)",
    "D♭ (C♯)"
]);

const MAJOR_KEY_SIGNATURE_INFO = {
    "C":        { vexKey: "C",  accidentalsByLetter: {} },
    "G":        { vexKey: "G",  accidentalsByLetter: { f: "#" } },
    "D":        { vexKey: "D",  accidentalsByLetter: { f: "#", c: "#" } },
    "A":        { vexKey: "A",  accidentalsByLetter: { f: "#", c: "#", g: "#" } },
    "E":        { vexKey: "E",  accidentalsByLetter: { f: "#", c: "#", g: "#", d: "#" } },
    "B":        { vexKey: "B",  accidentalsByLetter: { f: "#", c: "#", g: "#", d: "#", a: "#" } },
    "F♯ (G♭)": { vexKey: "F#", accidentalsByLetter: { f: "#", c: "#", g: "#", d: "#", a: "#", e: "#" } },
    "F":        { vexKey: "F",  accidentalsByLetter: { b: "b" } },
    "B♭":       { vexKey: "Bb", accidentalsByLetter: { b: "b", e: "b" } },
    "E♭":       { vexKey: "Eb", accidentalsByLetter: { b: "b", e: "b", a: "b" } },
    "A♭ (G♯)": { vexKey: "Ab", accidentalsByLetter: { b: "b", e: "b", a: "b", d: "b" } },
    "D♭ (C♯)": { vexKey: "Db", accidentalsByLetter: { b: "b", e: "b", a: "b", d: "b", g: "b" } },
    "G♭":       { vexKey: "Gb", accidentalsByLetter: { b: "b", e: "b", a: "b", d: "b", g: "b", c: "b" } }
};

// マイナー系の調号基準：E♭ minor は ♭6（G♭）、A♭ (G♯) / D♭ (C♯) / F♯ (G♭) は # 側を軸に揃える
const RELATIVE_MAJOR_KEY_FOR_MINOR = {
    "C":        "E♭",
    "G":        "B♭",
    "D":        "F",
    "A":        "C",
    "E":        "G",
    "B":        "D",
    "F♯ (G♭)": "A",
    "F":        "A♭ (G♯)",
    "B♭":       "D♭ (C♯)",
    "E♭":       "G♭",
    "A♭ (G♯)": "B",
    "D♭ (C♯)": "E"
};

// 五線譜のマイナー系スケールで # ベース（シャープ優先）でスペルするキー
const SHARP_MINOR_KEYS = new Set([
    "A♭ (G♯)",
    "D♭ (C♯)",
    "F♯ (G♭)",
    "B",
    "E",
    "A"
]);

const KEY_TO_PARAM = {
    "C": "C",
    "F": "F",
    "B♭": "Bb",
    "E♭": "Eb",
    "A♭ (G♯)": "Ab",
    "D♭ (C♯)": "Db",
    "F♯ (G♭)": "Fs",
    "B": "B",
    "E": "E",
    "A": "A",
    "D": "D",
    "G": "G"
};

const PARAM_TO_KEY = {
    ...Object.fromEntries(
        Object.entries(KEY_TO_PARAM).map(([keyLabel, param]) => [param.toLowerCase(), keyLabel])
    ),
    "gs": "A♭ (G♯)",
    "cs": "D♭ (C♯)",
    "gb": "F♯ (G♭)"
};

const HIGH_OCTAVE_KEYS = new Set(["A", "A♭ (G♯)", "G"]);

const PREFER_FLAT_MAJOR_KEYS = new Set(["F", "B♭", "E♭", "A♭ (G♯)", "D♭ (C♯)"]);

const QUALITY_CHORD_INTERVALS = {
    "maj7":    [0, 4, 7, 11],
    "m7":      [0, 3, 7, 10],
    "7":       [0, 4, 7, 10],
    "m7b5":    [0, 3, 6, 10],
    "mmaj7":   [0, 3, 7, 11],
    "augmaj7": [0, 4, 8, 11],
    "dim7":    [0, 3, 6, 9]
};

const NATURAL_MINOR_QUALITIES = ["m7", "m7b5", "maj7", "m7", "m7", "maj7", "7"];

const SCALES = [
    {
        name: "Major",
        keySigMode: "major",
        targetId: "staff-major",
        canvasId: "canvas-major",
        intervals: [0, 2, 4, 5, 7, 9, 11],
        qualities: ["maj7", "m7", "m7", "maj7", "7", "m7", "m7b5"]
    },
    {
        name: "Melodic Minor",
        keySigMode: "minor",
        targetId: "staff-melodic-minor",
        canvasId: "canvas-melodic-minor",
        intervals: [0, 2, 3, 5, 7, 9, 11],
        descendingIntervals: [0, 2, 3, 5, 7, 8, 10],
        descendingQualities: NATURAL_MINOR_QUALITIES,
        qualities: ["mmaj7", "m7", "augmaj7", "7", "7", "m7b5", "m7b5"]
    },
    {
        name: "Harmonic Minor",
        keySigMode: "minor",
        targetId: "staff-harmonic-minor",
        canvasId: "canvas-harmonic-minor",
        intervals: [0, 2, 3, 5, 7, 8, 11],
        qualities: ["mmaj7", "m7b5", "augmaj7", "m7", "7", "maj7", "dim7"]
    },
    {
        name: "Natural Minor",
        keySigMode: "minor",
        targetId: "staff-natural-minor",
        canvasId: "canvas-natural-minor",
        intervals: [0, 2, 3, 5, 7, 8, 10],
        qualities: NATURAL_MINOR_QUALITIES
    }
];

function isMinorScale(scale) {
    return Boolean(scale && scale.keySigMode === "minor");
}

function shouldPreferFlat(selectedKey, scale, options = {}) {
    if (options.forChordTable) {
        return CHORD_TABLE_PREFER_FLAT_KEYS.has(selectedKey);
    }
    if (isMinorScale(scale)) {
        return !SHARP_MINOR_KEYS.has(selectedKey);
    }
    return PREFER_FLAT_MAJOR_KEYS.has(selectedKey);
}

function getStartLetter(selectedKey, scale, options = {}) {
    if (isMinorScale(scale)) {
        if (options.forChordTable && CHORD_TABLE_MINOR_START_LETTER[selectedKey]) {
            return CHORD_TABLE_MINOR_START_LETTER[selectedKey];
        }
        return MINOR_START_LETTER[selectedKey];
    }
    return MAJOR_START_LETTER[selectedKey];
}

function getScaleKeySignatureInfo(selectedKey, scale) {
    if (isMinorScale(scale)) {
        const relMajor = RELATIVE_MAJOR_KEY_FOR_MINOR[selectedKey] || selectedKey;
        return MAJOR_KEY_SIGNATURE_INFO[relMajor] || { vexKey: "C", accidentalsByLetter: {} };
    }
    return MAJOR_KEY_SIGNATURE_INFO[selectedKey] || { vexKey: "C", accidentalsByLetter: {} };
}

function formatChord(rootLabel, quality) {
    let body = `${rootLabel}`;
    switch (quality) {
        case "maj7":
            body = `${rootLabel}<sub>△7</sub>`;
            break;
        case "m7":
            body = `${rootLabel}<sub>m7</sub>`;
            break;
        case "7":
            body = `${rootLabel}<sub>7</sub>`;
            break;
        case "m7b5":
            body = `${rootLabel}<sub>m7</sub><sup>(♭5)</sup>`;
            break;
        case "mmaj7":
            body = `${rootLabel}<sub>m△7</sub>`;
            break;
        case "augmaj7":
            body = `${rootLabel}<sub>aug△7</sub>`;
            break;
        case "dim7":
            body = `${rootLabel}<sub>dim7</sub>`;
            break;
        default:
            body = `${rootLabel}`;
            break;
    }
    return `<span class="chord-item">${body}</span>`;
}

function getKeylessDegreeLabel(degreeIndex, scaleInterval) {
    const baseDegree = DEGREES[degreeIndex];
    const majorSemitone = MAJOR_DEGREE_SEMITONES[degreeIndex];
    const diff = (scaleInterval - majorSemitone + 12) % 12;

    if (diff === 11) {
        return `♭${baseDegree}`;
    }
    return baseDegree;
}

function spellPitchForLetter(pitch, targetLetter, preferFlat) {
    const normalizedPitch = ((pitch % 12) + 12) % 12;
    const candidates = PITCH_SPELLINGS[normalizedPitch];

    const matchingLetter = candidates.filter((name) => name.startsWith(targetLetter));
    if (matchingLetter.length > 0) {
        const preferred = matchingLetter.find((name) =>
            preferFlat ? name.includes("♭") : !name.includes("♭")
        );
        return preferred || matchingLetter[0];
    }

    const fallback = candidates.find((name) =>
        preferFlat ? name.includes("♭") : !name.includes("♭")
    );
    return fallback || candidates[0];
}

function spellScaleNotes(selectedKey, intervals, scale = null, options = {}) {
    const tonicPitch = KEY_ROOT_PITCH[selectedKey];
    const startLetter = getStartLetter(selectedKey, scale, options);
    const startLetterIndex = LETTERS.indexOf(startLetter);
    const preferFlat = shouldPreferFlat(selectedKey, scale, options);

    return intervals.map((interval, idx) => {
        const pitch = (tonicPitch + interval) % 12;
        const targetLetter = LETTERS[(startLetterIndex + idx) % 7];
        return spellPitchForLetter(pitch, targetLetter, preferFlat);
    });
}

function parseNoteLabel(noteLabel) {
    const letter = noteLabel[0].toLowerCase();
    let accidental = "";
    if (noteLabel.includes("♭♭")) accidental = "bb";
    else if (noteLabel.includes("♯♯")) accidental = "##";
    else if (noteLabel.includes("♭")) accidental = "b";
    else if (noteLabel.includes("♯")) accidental = "#";

    return { letter, accidental };
}

function resolveNoteAccidental(letter, accidental, keySigAccidentals, currentStateByLetter) {
    const sigAcc = keySigAccidentals[letter] || "";
    const prevAcc = currentStateByLetter[letter] !== undefined
        ? currentStateByLetter[letter]
        : sigAcc;

    if (accidental === prevAcc) {
        return null;
    }

    currentStateByLetter[letter] = accidental;

    if (accidental === "") {
        return "n";
    }

    return accidental;
}

function mapSpelledToOctaves(spelled7, baseOctave) {
    const rootNote = spelled7[0];
    const baseLetterIdx = LETTERS.indexOf(rootNote[0]);

    return spelled7.map((noteLabel) => {
        const currentLetterIdx = LETTERS.indexOf(noteLabel[0]);
        const letterWrapped = currentLetterIdx < baseLetterIdx ? 1 : 0;
        return {
            label: noteLabel,
            octave: baseOctave + letterWrapped
        };
    });
}

function getBaseOctaveForKey(selectedKey) {
    const tonicPitch = KEY_ROOT_PITCH[selectedKey];
    let baseOctave = tonicPitch >= 7 ? 3 : 4;
    if (HIGH_OCTAVE_KEYS.has(selectedKey)) {
        baseOctave += 1;
    }
    return baseOctave;
}

function buildScalePitchSequence(selectedKey, scale) {
    const baseOctave = getBaseOctaveForKey(selectedKey);
    const topOctave = baseOctave + 1;

    const ascSpelled7 = spellScaleNotes(selectedKey, scale.intervals, scale);
    const ascSeven = mapSpelledToOctaves(ascSpelled7, baseOctave);
    const topRoot = { label: ascSpelled7[0], octave: topOctave };

    const ascendingNotes = [...ascSeven, topRoot];

    const descIntervals = scale.descendingIntervals || scale.intervals;
    const descSpelled7 = spellScaleNotes(selectedKey, descIntervals, scale);
    const descSevenReversed = mapSpelledToOctaves(descSpelled7, baseOctave).reverse();
    const descendingNotes = [topRoot, ...descSevenReversed];

    return [...ascendingNotes, ...descendingNotes];
}

function buildSevenDegreeChords(selectedKey, scale, intervals, qualities, baseOctave) {
    const tonicPitch = KEY_ROOT_PITCH[selectedKey];
    const startLetter = getStartLetter(selectedKey, scale);
    const startLetterIndex = LETTERS.indexOf(startLetter);
    const preferFlat = shouldPreferFlat(selectedKey, scale);
    const chordLetterOffsets = [0, 2, 4, 6];

    return intervals.map((degreeInterval, degreeIdx) => {
        const quality = qualities[degreeIdx];
        const chordSemitones = QUALITY_CHORD_INTERVALS[quality] || [0, 4, 7, 11];
        const chordRootPitch = (tonicPitch + degreeInterval) % 12;
        const chordRootLetterIdx = (startLetterIndex + degreeIdx) % 7;
        const chordRootLetter = LETTERS[chordRootLetterIdx];

        const rootOctave = baseOctave + (chordRootLetterIdx < startLetterIndex ? 1 : 0);
        const rootLabel = spellPitchForLetter(chordRootPitch, chordRootLetter, preferFlat);

        const voices = chordSemitones.map((semitoneOffset, voiceIdx) => {
            const pitch = (chordRootPitch + semitoneOffset) % 12;
            const letterOffset = chordLetterOffsets[voiceIdx];
            const targetLetterIdx = (chordRootLetterIdx + letterOffset) % 7;
            const targetLetter = LETTERS[targetLetterIdx];
            const octaveWrap = targetLetterIdx < chordRootLetterIdx ? 1 : 0;

            return {
                label: spellPitchForLetter(pitch, targetLetter, preferFlat),
                octave: rootOctave + octaveWrap
            };
        });

        return {
            degree: DEGREES[degreeIdx],
            rootLabel,
            quality,
            voices
        };
    });
}

function shiftChordOctave(chord, octaveOffset) {
    return {
        ...chord,
        voices: chord.voices.map((v) => ({
            ...v,
            octave: v.octave + octaveOffset
        }))
    };
}

// Scale と同じ上行（Ⅰ〜Ⅶ＋オクターブ上Ⅰ）・下行（オクターブ上Ⅰ＋Ⅶ〜Ⅰ）の16和音を生成
// Melodic Minor の下行時は descendingIntervals / descendingQualities（Natural Minor コード）を使用
function buildFourVoiceChordSequence(selectedKey, scale) {
    const baseOctave = getBaseOctaveForKey(selectedKey);

    const ascSeven = buildSevenDegreeChords(
        selectedKey,
        scale,
        scale.intervals,
        scale.qualities,
        baseOctave
    );
    const ascTopRoot = shiftChordOctave(ascSeven[0], 1);
    const ascendingChords = [...ascSeven, ascTopRoot];

    const descIntervals = scale.descendingIntervals || scale.intervals;
    const descQualities = scale.descendingQualities || scale.qualities;
    const descSeven = buildSevenDegreeChords(
        selectedKey,
        scale,
        descIntervals,
        descQualities,
        baseOctave
    );
    const descTopRoot = shiftChordOctave(descSeven[0], 1);
    const descendingChords = [descTopRoot, ...descSeven.slice().reverse()];

    return [...ascendingChords, ...descendingChords];
}