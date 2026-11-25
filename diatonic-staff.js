function computeAlignedStaveLayout(Stave, vexKey, totalWidth) {
    const staveX = 10;
    const staveWidth = Math.max(400, totalWidth - staveX - 14);

    const maxKeySigStave = new Stave(staveX, 24, staveWidth);
    maxKeySigStave.addClef("treble");
    maxKeySigStave.addKeySignature("F#");
    const targetNoteStartX = maxKeySigStave.getNoteStartX();

    const stave = new Stave(staveX, 24, staveWidth);
    stave.addClef("treble");
    stave.addKeySignature(vexKey);
    if (typeof stave.setNoteStartX === "function") {
        stave.setNoteStartX(targetNoteStartX);
    }

    const formatterWidth = Math.max(320, staveWidth - (targetNoteStartX - staveX) - 24);
    return { stave, formatterWidth };
}

function makeSvgResponsive(container, width, height) {
    const svg = container.querySelector("svg");
    if (!svg) return;
    if (!svg.getAttribute("viewBox")) {
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.style.width = "100%";
    svg.style.maxWidth = "100%";
    svg.style.height = "auto";
    svg.style.display = "block";
}

function renderScaleStaff(context, stave, formatterWidth, selectedKey, scale, keySigInfo, VexFlow) {
    const { StaveNote, Accidental, Voice, Formatter, Beam } = VexFlow;
    const notes = buildScalePitchSequence(selectedKey, scale);

    const currentStateByLetter = {};
    const vfNotes = notes.map((item) => {
        const { letter, accidental } = parseNoteLabel(item.label);
        const vexKey = `${letter}${accidental}/${item.octave}`;
        const note = new StaveNote({ keys: [vexKey], duration: "8" });

        const neededAccidental = resolveNoteAccidental(
            letter,
            accidental,
            keySigInfo.accidentalsByLetter,
            currentStateByLetter
        );
        if (neededAccidental) {
            note.addModifier(new Accidental(neededAccidental));
        }
        return note;
    });

    const beams = [];
    for (let i = 0; i + 3 < vfNotes.length; i += 4) {
        beams.push(new Beam(vfNotes.slice(i, i + 4)));
    }

    const voice = new Voice({ num_beats: notes.length, beat_value: 8 });
    voice.setStrict(false);
    voice.addTickables(vfNotes);

    new Formatter().joinVoices([voice]).format([voice], formatterWidth);
    voice.draw(context, stave);

    beams.forEach((beam) => {
        beam.setContext(context).draw();
    });
}

function renderFourVoiceChordStaff(context, stave, formatterWidth, selectedKey, scale, keySigInfo, VexFlow) {
    const { StaveNote, Accidental, Voice, Formatter, Beam } = VexFlow;
    const chords = buildFourVoiceChordSequence(selectedKey, scale);

    const currentStateByLetter = {};
    const vfNotes = chords.map((chord) => {
        const keys = chord.voices.map((v) => {
            const { letter, accidental } = parseNoteLabel(v.label);
            return `${letter}${accidental}/${v.octave}`;
        });

        const note = new StaveNote({ keys, duration: "8" });

        chord.voices.forEach((v, index) => {
            const { letter, accidental } = parseNoteLabel(v.label);
            const neededAccidental = resolveNoteAccidental(
                letter,
                accidental,
                keySigInfo.accidentalsByLetter,
                currentStateByLetter
            );
            if (neededAccidental) {
                note.addModifier(new Accidental(neededAccidental), index);
            }
        });

        return note;
    });

    // Scale と同様に4つずつ連桁でつなぐ
    const beams = [];
    for (let i = 0; i + 3 < vfNotes.length; i += 4) {
        beams.push(new Beam(vfNotes.slice(i, i + 4)));
    }

    const voice = new Voice({ num_beats: chords.length, beat_value: 8 });
    voice.setStrict(false);
    voice.addTickables(vfNotes);

    new Formatter().joinVoices([voice]).format([voice], formatterWidth);
    voice.draw(context, stave);

    beams.forEach((beam) => {
        beam.setContext(context).draw();
    });
}

function renderStaffForScale(selectedKey, scale, displayMode = "scale") {
    const container = document.getElementById(scale.canvasId);
    if (!container) return;

    container.innerHTML = "";

    const activeMode = selectedKey === "C" ? displayMode : "scale";
    const keySigInfo = getScaleKeySignatureInfo(selectedKey, scale);

    if (!window.Vex || !window.Vex.Flow) {
        if (activeMode === "chord") {
            const chords = buildFourVoiceChordSequence(selectedKey, scale);
            container.textContent = chords
                .map((c) => `${c.degree}: [${c.voices.map((v) => v.label).join(" ")}]`)
                .join(" / ");
        } else {
            const notes = buildScalePitchSequence(selectedKey, scale);
            container.textContent = notes.map((n) => n.label).join(" - ");
        }
        return;
    }

    const { Renderer, Stave } = window.Vex.Flow;
    const availableWidth = container.clientWidth || 760;
    const width = availableWidth < 820 ? 860 : availableWidth;
    const height = activeMode === "chord" ? 186 : 156;

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();

    const { stave, formatterWidth } = computeAlignedStaveLayout(Stave, keySigInfo.vexKey, width);
    stave.setContext(context).draw();

    if (activeMode === "chord") {
        renderFourVoiceChordStaff(context, stave, formatterWidth, selectedKey, scale, keySigInfo, window.Vex.Flow);
    } else {
        renderScaleStaff(context, stave, formatterWidth, selectedKey, scale, keySigInfo, window.Vex.Flow);
    }

    makeSvgResponsive(container, width, height);
}