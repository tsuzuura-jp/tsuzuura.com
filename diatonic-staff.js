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

function renderStaffForScale(selectedKey, scale) {
    const container = document.getElementById(scale.canvasId);
    if (!container) return;

    container.innerHTML = "";

    const notes = buildScalePitchSequence(selectedKey, scale);
    const keySigInfo = getScaleKeySignatureInfo(selectedKey, scale);

    if (!window.Vex || !window.Vex.Flow) {
        container.textContent = notes.map((n) => n.label).join(" - ");
        return;
    }

    const { Renderer, Stave, StaveNote, Accidental, Voice, Formatter, Beam } = window.Vex.Flow;
    const availableWidth = container.clientWidth || 760;
    const width = availableWidth < 820 ? 860 : availableWidth;
    const height = 156;

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();

    const { stave, formatterWidth } = computeAlignedStaveLayout(Stave, keySigInfo.vexKey, width);
    stave.setContext(context).draw();

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

    makeSvgResponsive(container, width, height);
}