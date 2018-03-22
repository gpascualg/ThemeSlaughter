from flask import g

def build_context(data={}):
    return {
        'user': {
            'is_logged': g.user is None
        },
        **data
    }
