#!/bin/sh
crond -l 2 -f > /dev/stdout 2> /dev/stderr &
nodemon -L
