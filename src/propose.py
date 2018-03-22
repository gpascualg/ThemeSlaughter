from flask import render_template
from flask.views import MethodView

from .context import build_context

class Propose(MethodView):
    def get(self):
        return render_template('propose.html', **build_context())
    
