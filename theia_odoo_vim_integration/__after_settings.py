
import stat
import os
import platform
from pathlib import Path
import inspect

def after_settings(settings, config):
    from wodoo import odoo_config

    # disable theia on live system
    if settings['DEVMODE'] != "1":
        settings['RUN_THEIA_ODOO_VIM'] = '0'
        settings['RUN_THEIA_ODOO_VIM_INTEGRATION'] = '0'