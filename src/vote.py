from flask import render_template, request, jsonify, g, abort
from flask.views import MethodView

from .context import build_context
from .database import Database


class Vote(MethodView):
    def get_themes(self):
        themes = Database.theme_slaughter.themes.find({ 'active': True })
        themes = map(lambda t: {
            'name': t['_id'], 
            'voted': {k:v for k,v in t['votes']}.get(g.user['_id'])
        }, themes)

        return themes

    def get(self):
        data = {
            'voting': {
                'round': 1,
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

        # PULL
        Database.theme_slaughter.themes.update(
            { '_id': data['id'] },
            { 
                '$pull': {
                    'votes': {
                        'user': g.user['_id']
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
                        'user': g.user['_id'],
                        'vote': data['cast']
                    }
                }
            }
        )
        
        return jsonify({'result': 'ok'})
    