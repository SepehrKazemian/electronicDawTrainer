import music21

def midi_to_abc(midi_file_path):
    print(midi_file_path)
    # Load MIDI file into music21 stream
    midi_stream = music21.converter.parse(midi_file_path)

    # Get metadata from MIDI file
    metadata = midi_stream.metadata

    # Get time signature metadata if available
    if hasattr(metadata, "timeSignature") and metadata.timeSignature is not None:
        ts = metadata.timeSignature.ratioString
    else:
        ts = "4/4"

    # Get key signature metadata if available
    if hasattr(metadata, "keySignature") and metadata.keySignature is not None:
        ks = metadata.keySignature.asKey(mode='major').tonicPitchNameWithCase
    else:
        ks = "C"

    # Get tempo metadata if available
    metronome_marks = midi_stream.flat.getElementsByClass('MetronomeMark')
    if metronome_marks:
        tempo = metronome_marks[0].number
    else:
        tempo = 120

    # Check for additional information in the parts of the stream
    for part in midi_stream.parts:
        if part.timeSignature is not None:
            ts = part.timeSignature.ratioString
        if part.keySignature is not None:
            ks = part.keySignature.asKey(mode='major').tonicPitchNameWithCase
        if part.metronomeMarkBoundaries:
            tempo = part.metronomeMarkBoundaries()[0][2].number

    # Set ABC header
    header = f'X:1\nT:{metadata.title}\nM:{ts}\nK:{ks}\n'
    
    # Convert music21 stream to ABC notation
    notes = []
    for part in midi_stream.parts:
        for note_or_rest in part.flat.notesAndRests:
            if isinstance(note_or_rest, music21.note.Note):
                notes.append(note_or_rest.nameWithOctave)
            elif isinstance(note_or_rest, music21.note.Rest):
                notes.append("z")
        notes.append("|")
    abc_notation = " ".join(notes)

    # Concatenate ABC header and notation
    abc_string = header + abc_notation

    return abc_string