#!/bin/bash
set -e
echo "BUILD START"
python3 -m pip install --target .packages -r requirements.txt
export PYTHONPATH="$(pwd)/.packages:${PYTHONPATH}"
python3 manage.py collectstatic --noinput --clear
echo "BUILD END"
