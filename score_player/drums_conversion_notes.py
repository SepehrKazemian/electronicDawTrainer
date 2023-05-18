drums_music_notes = [
    "Db3",
    "Eb3",
    "Db4",
    "Ab2",
    "Gb2",
    "D3",
    "E3",
    "C3",
    "E2",
    "Gb3",
    "Ab3",
    "Bb3",
    "C2",
    "Eb2",
    "G2",
    "F2",
]

drums_instruments = [
    "Crash",
    "Ride",
    "Ride Bell",
    "Open hi-hat",
    "closed hi-hat",
    "Tom 1",
    "Tom 2",
    "Snare",
    "Rim",
    "Tom 3",
    "Tom 4",
    "Tom 5",
    "Right Bass",
    "Left Bass",
    "Hi-Hat Pedal",
    "Hi-Hat Splash",
]

if len(drums_music_notes) == len(drums_instruments):
    NOTE_TO_INST_DICT = {
        drums_music_notes[i]: drums_instruments[i]
        for i in range(len(drums_instruments))
    }
else:
    raise ValueError("The list notations are not same length")
