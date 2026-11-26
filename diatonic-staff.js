const KEY_C_CHORD_OVERLAY_BY_SCALE = {
    "Major": {
        chords: ["C△7", "Dm7", "Em7", "F△7", "G7", "Am7", "Bm7(♭5)"],
        functions: ["T", "S.D. sub", "T sub", "S.D.", "D", "T sub", "D sub"]
    },
    "Melodic Minor": {
        chords: ["Cm△7", "Dm7", "E♭△7(#5)", "F7", "G7", "Am7(♭5)", "Bm7(♭5)"],
        functions: ["T", "S.D. sub", "T sub", "S.D.", "D", "T sub", "D sub"]
    },
    "Harmonic Minor": {
        chords: ["Cm△7", "Dm7(♭5)", "E♭△7(#5)", "Fm7", "G7", "A♭△7", "Bdim7"],
        functions: ["T", "S.D. sub", "T sub", "S.D.", "D", "S.D. sub", "D sub"]
    },
    "Natural Minor": {
        chords: ["Cm7", "Dm7(♭5)", "E♭△7", "Fm7", "Gm7", "A♭△7", "B♭7"],
        functions: ["T", "S.D. sub", "T sub", "S.D.", "D", "S.D. sub", "S.D. sub"]
    }
};

function computeAlignedStaveLayout(Stave, vexKey, totalWidth) {
    const staveX = 10;
    const staveWidth = Math.max(400, totalWidth - staveX - 14);
    const staveY = 32;

    const maxKeySigStave = new Stave(staveX, staveY, staveWidth);
    maxKeySigStave.addClef("treble");
    maxKeySigStave.addKeySignature("F#");
    const targetNoteStartX = maxKeySigStave.getNoteStartX();

    const stave = new Stave(staveX, staveY, staveWidth);
    stave.addClef("treble");
    stave.addKeySignature(vexKey);
    if (typeof stave.setNoteStartX === "function") {
        stave.setNoteStartX(targetNoteStartX);
    }

    const formatterWidth = Math.max(320, staveWidth - (targetNoteStartX - staveX) - 24);
    return { stave, formatterWidth, staveX, staveWidth, targetNoteStartX };
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

function getDegreeColumnLeftEdgesInSvg(container, svgWidth) {
    const headerCells = Array.from(document.querySelectorAll("table thead th"));
    if (headerCells.length < 8) return null;

    const degreeCells = headerCells.slice(1, 8);
    const containerRect = container.getBoundingClientRect();
    if (!containerRect.width) return null;

    const scaleX = svgWidth / containerRect.width;
    return degreeCells.map((th) => {
        const rect = th.getBoundingClientRect();
        const leftRelative = rect.left - containerRect.left;
        return leftRelative * scaleX;
    });
}

function alignChordNotesToTableLeftBorders(vfNotes, stave, container, svgWidth, layout) {
    const targetLeftEdges = getDegreeColumnLeftEdgesInSvg(container, svgWidth);
    if (!targetLeftEdges || targetLeftEdges.length !== vfNotes.length) return;

    const minAllowedX = layout.targetNoteStartX + 12;
    const maxAllowedX = layout.staveX + layout.staveWidth - 36;

    vfNotes.forEach((note, idx) => {
        note.setStave(stave);
        const rawTargetX = targetLeftEdges[idx] + 10;
        const desiredLeftX = Math.max(minAllowedX, Math.min(maxAllowedX, rawTargetX));

        const tickContext = typeof note.getTickContext === "function" ? note.getTickContext() : null;
        if (tickContext && typeof tickContext.setX === "function") {
            const currentNoteX = typeof note.getAbsoluteX === "function"
                ? note.getAbsoluteX()
                : tickContext.getX();
            const headOffset = currentNoteX - tickContext.getX();
            tickContext.setX(desiredLeftX - headOffset);
            return;
        }

        const currentX = typeof note.getAbsoluteX === "function"
            ? note.getAbsoluteX()
            : note.getNoteHeadBeginX();
        note.setXShift(desiredLeftX - currentX);
    });
}

function drawKeyCChordLabels(container, vfNotes, scaleName) {
    const overlay = KEY_C_CHORD_OVERLAY_BY_SCALE[scaleName];
    if (!overlay) return;

    const svg = container.querySelector("svg");
    if (!svg) return;

    const svgNs = "http://www.w3.org/2000/svg";
    const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

    vfNotes.forEach((note, idx) => {
        const chordName = overlay.chords[idx];
        const funcLabel = overlay.functions[idx];

        const noteLeftX = typeof note.getAbsoluteX === "function"
            ? note.getAbsoluteX()
            : note.getNoteHeadBeginX();
        const noteCenterX = noteLeftX + 7;

        if (chordName) {
            const chordEl = document.createElementNS(svgNs, "text");
            chordEl.setAttribute("x", String(noteCenterX));
            chordEl.setAttribute("y", "18");
            chordEl.setAttribute("text-anchor", "middle");
            chordEl.setAttribute("fill", "#1e293b");
            chordEl.setAttribute("font-size", "12");
            chordEl.setAttribute("font-weight", "600");
            chordEl.setAttribute("font-family", fontFamily);
            chordEl.textContent = chordName;
            svg.appendChild(chordEl);
        }

        if (funcLabel) {
            const funcEl = document.createElementNS(svgNs, "text");
            funcEl.setAttribute("x", String(noteCenterX));
            funcEl.setAttribute("y", "152");
            funcEl.setAttribute("text-anchor", "middle");
            funcEl.setAttribute("fill", "#1e293b");
            funcEl.setAttribute("font-size", "12");
            funcEl.setAttribute("font-weight", "600");
            funcEl.setAttribute("font-family", fontFamily);
            funcEl.textContent = funcLabel;
            svg.appendChild(funcEl);
        }
    });
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

function renderFourVoiceChordStaff(context, layout, container, svgWidth, selectedKey, scale, keySigInfo, VexFlow) {
    const { StaveNote, Accidental, Voice, Formatter } = VexFlow;
    const { stave, formatterWidth } = layout;
    const chords = buildFourVoiceChordSequence(selectedKey, scale);

    const currentStateByLetter = {};
    const vfNotes = chords.map((chord) => {
        const keys = chord.voices.map((v) => {
            const { letter, accidental } = parseNoteLabel(v.label);
            return `${letter}${accidental}/${v.octave}`;
        });

        const note = new StaveNote({ keys, duration: "w" });

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

    const voice = new Voice({ num_beats: chords.length, beat_value: 1 });
    voice.setStrict(false);
    voice.addTickables(vfNotes);

    const formatter = new Formatter();
    formatter.joinVoices([voice]).format([voice], formatterWidth);
    alignChordNotesToTableLeftBorders(vfNotes, stave, container, svgWidth, layout);
    voice.draw(context, stave);

    if (selectedKey === "C") {
        drawKeyCChordLabels(container, vfNotes, scale.name);
    }
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
    const height = 168;

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();

    const layout = computeAlignedStaveLayout(Stave, keySigInfo.vexKey, width);
    layout.stave.setContext(context).draw();

    if (activeMode === "chord") {
        renderFourVoiceChordStaff(context, layout, container, width, selectedKey, scale, keySigInfo, window.Vex.Flow);
    } else {
        renderScaleStaff(context, layout.stave, layout.formatterWidth, selectedKey, scale, keySigInfo, window.Vex.Flow);
    }

    makeSvgResponsive(container, width, height);
}
