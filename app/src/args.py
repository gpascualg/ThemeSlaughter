import argparse

parser = argparse.ArgumentParser(description='Start server.')
parser.add_argument('--fake-user', default=False, action='store_true')
parser.add_argument('--debug', default=False, action='store_true')
parser.add_argument('--mongo-host', default=None)
parser.add_argument('--host', default='127.0.0.1')
parser.add_argument('--port', default=5000)
parser.add_argument('--workers', default=1)

args = parser.parse_args()
