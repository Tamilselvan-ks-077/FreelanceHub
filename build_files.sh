#!/bin/bash
echo "BUILD START"
python3 -m pip install --target .packages -r requirements.txt
export PYTHONPATH=.packages
python3 manage.py collectstatic --noinput
echo "BUILD END"
