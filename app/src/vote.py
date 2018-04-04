from flask import render_template, request, jsonify, g, abort
from flask.views import MethodView

from .context import build_context, get_config
from .database import Database
from .authentication import force_login


def theme(t):
    return {
        'name': t['_id'], 
        'voted': {v['user']: v['vote'] for v in t['votes']}.get(g.user['username'])
    }

class Vote(MethodView):
    decorators = [force_login]

    def get_themes(self):
        themes = Database.theme_slaughter.themes.find({'active': True})
        themes = map(theme, themes)
        return list(themes)

    def get(self):
        data = {
            'voting': {
                'round': get_config('voting_round'),
                'enabled': get_config('voting_enabled'),
                'themes': self.get_themes()
            }
        }
        return render_template('vote.html', **build_context(data))
    
    def post(self):
        data = request.get_json(force=True)
        if not all(x in data for x in ('id', 'cast')):
            return abort(400)

        if not data['cast'] in ('yes', 'neutral', 'no'):
            return abort(400)

        if not get_config('voting_enabled'):
            return jsonify({'result': 'disabled'})

        # PULL
        Database.theme_slaughter.themes.update(
            { '_id': data['id'] },
            { 
                '$pull': {
                    'votes': {
                        'user': g.user['username']
                    }
                }
            }
        )

        # PUSH
        Database.theme_slaughter.themes.update(
            { '_id': data['id'] },
            { 
                '$push': {
                    'votes': {
                        'user': g.user['username'],
                        'vote': data['cast']
                    }
                }
            }
        )
        
        return jsonify({'result': 'ok'})
    