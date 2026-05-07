#!/usr/bin/env bash
set -o errexit

gunicorn main:app --bind 0.0.0.0:$PORT