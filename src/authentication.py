from flask import render_template, request, url_for, session, redirect, flash, g
from flask.views import MethodView
from bson.objectid import ObjectId

from .context import build_context
from .database import Database
from .args import args


class AuthenticationHandler(MethodView):
    def get(self, oauth_token):
        next_url = request.args.get('next') or url_for('index')
        if oauth_token is None:
            flash("Authorization failed.")
            return redirect(next_url)

        db = Database.theme_slaughter
        ses = db.sessions.find_one({'github_access_token': oauth_token})
        if ses is None:
            res = db.insert_one({'github_access_token': oauth_token})
            session['ses_id'] = str(res.inserted_id)
        else:
            session['ses_id'] = str(ses['_id'])

        return redirect(next_url)

def AuthenticationToken(github):
    @github.access_token_getter
    def get_token():
        user = g.user
        if user is not None:
            return user['github_access_token']
        return None

    return get_token

def AuthenticationBefore(app):
    @app.before_request
    def do_before():
        g.user = None
        if args.fake_user:
            g.user = {
                '_id': 'FakeUser'
            }
        elif 'ses_id' in session:
            db = Database.theme_slaughter
            g.user = db.sessions.find_one({'_id': ObjectId(session['ses_id'])})
            # TODO: Build user context


def force_login(f):
    def decorator(*args, **kwargs):
        if g.user:
            return f(*args, **kwargs)
        else:
            return redirect(url_for('login'))
    return decorator
