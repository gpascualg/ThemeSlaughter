from flask import render_template, request, jsonify, abort
from flask.views import MethodView

from .context import build_context
from .database import Database
from .authentication import force_login


class Propose(MethodView):
    decorators = [force_login]

    def get(self):
        return render_template('propose.html', **build_context())
    

    def post(self):
        data = request.get_json(force=True)
        if not all(x in data for x in ('theme',)):
            return abort(400)

        theme = data['theme'].strip()
        if not theme:
            return jsonify({'result': 'duplicated'})

        try:
            Database.theme_slaughter.themes.insert(
                { 
                    '_id': theme,
                    'active': True,
                    'votes': []
                }
            )

            return jsonify({'result': 'ok'})
        except:
            return jsonify({'result': 'duplicated'})
