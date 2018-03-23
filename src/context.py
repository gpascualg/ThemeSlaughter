from flask import g

from .database import Database
from .args import args


def build_context(data={}):
    context = {
        'user': {
            'is_logged': g.user is not None
        },
        **data
    }

    if args.debug:
        print(context)

    return context

def get_config(key=None, default=None):
    config = Database.theme_slaughter.config.find()
    if key is not None:
        for cfg in config:
            if cfg['_id'] == key:
                return cfg['value']

        return default

    return {cfg['_id']: cfg['value'] for cfg in config}
