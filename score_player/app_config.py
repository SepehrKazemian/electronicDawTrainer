from os.path import abspath, dirname
import sys

APP_DIR = dirname(abspath(__file__))
PARENT_DIR = dirname(dirname(abspath(__file__)))
PROJ_DIR = PARENT_DIR + "/" + PARENT_DIR.split("/")[-1]

sys.path.extend([APP_DIR, PARENT_DIR, PROJ_DIR])