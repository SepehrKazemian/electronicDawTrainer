import pickle
import os

if os.path.isfile("./note_to_instrument_mapping.pkl"):
    print("here")
    with open("./note_to_instrument_mapping.pkl", "rb") as f:
        DRUMS_INST_TO_FILE = pickle.load(f)
else:
    DRUMS_INST_TO_FILE = {
        "Crash": "Cymbal20iCrash.wav",
        "Ride": "Cymbal20iRide-HV1.wav",
        "Ride Bell": "Cymbal20iCup-5.wav",
        "Open hi-hat": "OpenHiHat-1.wav",
        "closed hi-hat": "ClosedHiHat-1.wav",
        "Tom 1": "MidTom-1.wav",
        "Tom 2": "MidTom-2.wav",
        "Snare": "SnareDrum1-HV2.wav",
        "Rim": "SideStick-1.wav",
        "Tom 3": "LowTom-1.wav",
        "Tom 4": "DoubleLowTom-2.wav",
        "Tom 5": "DoubleMidTom-1.wav",
        "Right Bass": "BassDrum-HV2.wav",
        "Left Bass": "BassDrum-LV2.wav",
        "Hi-Hat Pedal": "ClosedHiHat-1.wav",
        "Hi-Hat Splash": "Cymbal16iCup-1.wav",
    }
