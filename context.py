from flask import g

def build_context():
    return {
        'user': {
            'is_logged': g.user is None
        },
        'voting': {
            'round': 1,
            'themes': [
                {'name': 'asd', 'voted': None},
                {'name': 'qweqwweqwe wqe', 'voted': 'neutral'},
                {'name': 'aasd qwsd', 'voted': 'yes'},
                {'name': 'asd', 'voted': None},
                {'name': 'qweqwweqwe wqe', 'voted': 'neutral'},
                {'name': 'aasd qwsd', 'voted': 'yes'},
                {'name': 'asd', 'voted': None},
                {'name': 'qweqwweqwe wqe', 'voted': 'neutral'},
                {'name': 'aasd qwsd', 'voted': 'yes'},
                {'name': 'asd', 'voted': None},
                {'name': 'qweqwweqwe wqe', 'voted': 'neutral'},
                {'name': 'aasd qwsd', 'voted': 'yes'},
                {'name': 'asd', 'voted': None},
                {'name': 'qweqwweqwe wqe', 'voted': 'neutral'},
                {'name': 'aasd qwsd', 'voted': 'yes'},
            ]
        }
    }
