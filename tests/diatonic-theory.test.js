const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
    KEY_ROOT_PITCH,
    KEY_TO_PARAM,
    PARAM_TO_KEY,
    SCALES,
    spellScaleNotes,
    buildScalePitchSequence,
    buildFourVoiceChordSequence,
    getKeylessDegreeLabel,
    getScaleKeySignatureInfo,
    shouldPreferFlat
} = require("../diatonic-theory.js");

describe("diatonic-theory pure logic", () => {
    it("全12キー×全スケールで7ディグリー分の4声和音と機能ラベルが生成される", () => {
        const keys = Object.keys(KEY_ROOT_PITCH);
        assert.equal(keys.length, 12);

        for (const key of keys) {
            for (const scale of SCALES) {
                const chords = buildFourVoiceChordSequence(key, scale);
                assert.equal(chords.length, 7, `${key} / ${scale.name} のディグリー数が7ではない`);

                for (const chord of chords) {
                    assert.equal(
                        chord.voices.length,
                        4,
                        `${key} / ${scale.name} / ${chord.degree} の声部数が4ではない`
                    );
                    assert.ok(
                        typeof chord.chordText === "string" && chord.chordText.length > 0,
                        `${key} / ${scale.name} / ${chord.degree} の chordText が空`
                    );
                    assert.ok(
                        typeof chord.functionLabel === "string" && chord.functionLabel.length > 0,
                        `${key} / ${scale.name} / ${chord.degree} の functionLabel が空`
                    );
                }
            }
        }
    });

    it("全12キー×全スケールで上行・下行スケール音列が生成される", () => {
        const keys = Object.keys(KEY_ROOT_PITCH);

        for (const key of keys) {
            for (const scale of SCALES) {
                const notes = buildScalePitchSequence(key, scale);
                // 上行8音（ルート〜オクターブ上ルート）＋ 下行8音（オクターブ上ルート〜ルート）= 16音
                assert.equal(notes.length, 16, `${key} / ${scale.name} の音列長が16ではない`);
            }
        }
    });

    it("C Major のスケール構成音とディグリー表記が期待通りになる", () => {
        const major = SCALES.find((s) => s.name === "Major");
        assert.deepEqual(
            spellScaleNotes("C", major.intervals, major),
            ["C", "D", "E", "F", "G", "A", "B"]
        );
        assert.equal(getKeylessDegreeLabel(0, 0), "Ⅰ");
        assert.equal(getKeylessDegreeLabel(6, 10), "♭Ⅶ");
    });

    it("Melodic Minor の上行・下行で第6音・第7音の変化が反映される", () => {
        const melodicMinor = SCALES.find((s) => s.name === "Melodic Minor");
        const seq = buildScalePitchSequence("A", melodicMinor);
        // A melodic minor 上行: A B C D E F♯ G♯ A(オクターブ上)
        assert.deepEqual(
            seq.slice(0, 8).map((n) => n.label),
            ["A", "B", "C", "D", "E", "F♯", "G♯", "A"]
        );
        // 下行（先頭はトップのA）: A G F E D C B A
        assert.deepEqual(
            seq.slice(8).map((n) => n.label),
            ["A", "G", "F", "E", "D", "C", "B", "A"]
        );
    });

    it("異名同音キーとマイナー調号基準のスペル・フラット優先が意図通りになる", () => {
        const major = SCALES.find((s) => s.name === "Major");
        const minor = SCALES.find((s) => s.name === "Natural Minor");

        // Major でのフラット優先判定
        assert.equal(shouldPreferFlat("F", major), true);
        assert.equal(shouldPreferFlat("D", major), false);
        assert.equal(shouldPreferFlat("F♯ (G♭)", major), false);

        // Minor でのシャープ優先判定（A♭ (G♯), D♭ (C♯), F♯ (G♭), B, E, A はシャープ優先）
        assert.equal(shouldPreferFlat("A♭ (G♯)", minor), false);
        assert.equal(shouldPreferFlat("D♭ (C♯)", minor), false);
        assert.equal(shouldPreferFlat("F♯ (G♭)", minor), false);
        assert.equal(shouldPreferFlat("C", minor), true);

        // マイナー調号の基準（E♭ minor は G♭ major 調号、D♭ (C♯) minor は E major 調号）
        assert.equal(getScaleKeySignatureInfo("E♭", minor).vexKey, "Gb");
        assert.equal(getScaleKeySignatureInfo("D♭ (C♯)", minor).vexKey, "E");
    });

    it("4声和音の構成音とコードテキスト（maj7 / 7 / m7(♭5) / dim7）が期待通りになる", () => {
        const major = SCALES.find((s) => s.name === "Major");
        const cMajorChords = buildFourVoiceChordSequence("C", major);
        assert.equal(cMajorChords[0].chordText, "C△7");
        assert.deepEqual(
            cMajorChords[0].voices.map((v) => v.label),
            ["C", "E", "G", "B"]
        );
        assert.equal(cMajorChords[4].chordText, "G7");
        assert.deepEqual(
            cMajorChords[4].voices.map((v) => v.label),
            ["G", "B", "D", "F"]
        );

        const harmonicMinor = SCALES.find((s) => s.name === "Harmonic Minor");
        const aHarmonicChords = buildFourVoiceChordSequence("A", harmonicMinor);
        assert.equal(aHarmonicChords[1].chordText, "Bm7(♭5)");
        assert.equal(aHarmonicChords[6].chordText, "G♯dim7");
    });

    it("URLクエリパラメータの変換マッピングが整合している", () => {
        assert.equal(PARAM_TO_KEY["bb"], "B♭");
        assert.equal(PARAM_TO_KEY["gs"], "A♭ (G♯)");
        assert.equal(PARAM_TO_KEY["cs"], "D♭ (C♯)");
        assert.equal(PARAM_TO_KEY["gb"], "F♯ (G♭)");
        assert.equal(PARAM_TO_KEY[KEY_TO_PARAM["F♯ (G♭)"].toLowerCase()], "F♯ (G♭)");
    });
});