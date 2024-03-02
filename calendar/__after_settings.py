import stat
import os
import platform
from pathlib import Path
import inspect

def after_settings(settings, config):

    if "RUN_CALENDAR" in settings.keys() and settings.get("RUN_CALENDAR", "") == "1":
        settings['RUN_CALENDAR_DB'] = "1"
