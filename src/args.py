import argparse

parser = argparse.ArgumentParser(description='Start server.')
parser.add_argument('--fake-user', default=False, action='store_true')
parser.add_argument('--debug', default=False, action='store_true')

args = parser.parse_args()
