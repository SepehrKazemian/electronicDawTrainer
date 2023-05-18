from os.path import abspath, dirname
import sys

PROJ_DIR = dirname(abspath(__file__))
APP_DIR = dirname(dirname(abspath(__file__)))  + "/score_player/"
PARENT_DIR = dirname(dirname(abspath(__file__)))

sys.path.extend([APP_DIR, PARENT_DIR, PROJ_DIR])