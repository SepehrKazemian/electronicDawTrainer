from django.shortcuts import render
from django.http import (
    HttpResponse,
    StreamingHttpResponse,
    HttpResponseNotFound,
    FileResponse,
)
import random
import json
import time
import mido
import midi_to_abc as m2a
from pathlib import Path
from django.conf import settings
import os
import drums_conversion_notes as dcn
import user_instrument_confi as uic
import json
import pickle

PAR_DIR = Path(__file__).resolve().parent


class drum_notation:
    def __init__(self) -> None:
        self.drum_note_to_instrument = {}


def index(request):
    print("hi1")
    instrument = "percussion"
    file_path = os.path.join(settings.STATIC_DIR, "sample_url", instrument)
    print(file_path)
    files = [i.split(".")[0] for i in os.listdir(file_path)]
    print(files)
    context = {"files": files}
    return render(request, "soundfonts.html", context)


def index2(request):
    print("hi1")
    return render(request, "index2.html")


def stream_data(request):
    def data():
        inport = mido.open_input("TD-25:TD-25 MIDI 1 28:0")
        while True:
            msg = inport.receive()
            if msg.type == "note_on":
                value = msg.velocity
            else:
                continue
            # value = random.randint(0, 100)
            # value = 40
            data_dict = {
                "value1": value,
                "value2": value,
                "value3": value,
                "value4": value,
                "value5": value,
            }
            # time.sleep(1)
            yield f"data: {json.dumps(data_dict)} \n\n"

    response = StreamingHttpResponse(data(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    # response['Connection'] = 'keep-alive'
    return response


def abcjs_view(request):
    print("hi111111")
    context = {
        "abc_notation": f"{m2a.midi_to_abc(f'{PAR_DIR}/midi_folders/example.mid')}"
        # 'X:1\nT:Test tune\nM:4/4\nK:C\nCDEF G2AB|c2cd efge|a2ag f2fe|d2dc B2AG:|'
    }
    return render(request, "index.html", context)


def hello(request):
    return HttpResponse("Hello, World!")


# Create your views here.


def serve_mp3(_, instrument, note_name):
    print("here  ", note_name)
    instrument_name = dcn.NOTE_TO_INST_DICT[note_name.split(".")[0]]
    file_name = uic.DRUMS_INST_TO_FILE[instrument_name]
    mp3_path = os.path.join(
        settings.STATIC_DIR,
        "sample_url",
        instrument,
        file_name,
    )
    print(mp3_path)

    if not os.path.exists(mp3_path):
        print("123")
        return HttpResponseNotFound()

    # Open the mp3 file in binary mode
    mp3_file = open(mp3_path, "rb")

    # Create a FileResponse object with the mp3 file as the content
    response = FileResponse(mp3_file, content_type="audio/mpeg")
    print("response is:", response)

    # Set the Content-Disposition header to inline
    response["Content-Disposition"] = "inline"

    return response


def sf_player(_, instrument, sf_filename):
    print(sf_filename)
    sf_path = os.path.join(
        settings.STATIC_DIR,
        "sample_url",
        instrument,
        sf_filename,
    )
    if not os.path.exists(sf_path):
        print("123")
        return HttpResponseNotFound()
    sf_file = open(sf_path, "rb")

    # Create a FileResponse object with the mp3 file as the content
    response = FileResponse(sf_file, content_type="audio/mpeg")
    print("response is:", response)

    # Set the Content-Disposition header to inline
    response["Content-Disposition"] = "inline"

    return response


def save_sound(_, note_name, sf_filename):
    print("heeeerrrrr", sf_filename)

    note_to_save = uic.DRUMS_INST_TO_FILE
    note_to_save[note_name] = sf_filename + ".wav"
    print(note_to_save)
    with open("note_to_instrument_mapping.pkl", "wb") as f:
        pickle.dump(note_to_save, f)

    return HttpResponse(status=204)


def getting_notes(request, param):
    print("here")
    print(json.loads(param))


def soundfont_list(request):
    instrument = "percussion"
    file_path = os.path.join(settings.STATIC_DIR, "sample_url", instrument)
    # print(file_path)
    sf_files = os.listdir(file_path)
    files = [f'{sf_files[i].split(".")[0]}' for i in range(len(sf_files))]
    # print(files)
    default_drums_mapping, first_8_notes, second_8_notes = default_notes()
    print(default_drums_mapping)
    context = {
        "files": sorted(files),
        "default_drum_notes": default_drums_mapping,
        "first_8_notes": first_8_notes,
        "second_8_notes": second_8_notes,
    }
    return render(request, "index.html", context)


def default_notes():
    default_drums_mapping = uic.DRUMS_INST_TO_FILE
    default_drums_mapping = {
        key: val.split(".")[0] for key, val in default_drums_mapping.items()
    }
    first_8_notes = dict(list(default_drums_mapping.items())[:8])
    second_8_notes = dict(list(default_drums_mapping.items())[8:])

    return default_drums_mapping, first_8_notes, second_8_notes


# def abc_to_note_time():
