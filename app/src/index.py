from flask import render_template, request, jsonify, abort
from flask.views import MethodView

from .context import build_context, get_config
from .database import Database
from .authentication import force_login


class Index(MethodView):
    def get(self):
        return render_template('index.html', **build_context({"round": get_config("voting_round")}))
