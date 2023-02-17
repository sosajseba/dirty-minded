ssh -p5491 root@168.197.49.85

docker run -dp 80:80 -e REACT_APP_INVITE_URL=http://168.197.49.85?room= -e REACT_APP_SOCKET_URL=http://168.197.49.85:5000 -e REACT_APP_MAX_PLAYERS=3 -e REACT_APP_MIN_PLAYERS=2 -e REACT_APP_CARDS_PER_PLAYER=5  sosajseba/dirty-minded:v1

docker run -dp 5000:5000 -e CORS_ORIGINS=http://168.197.49.85 -e PORT=5000 -e MAX_PLAYERS_PER_ROOM=3 sosajseba/dirty-minded-socket:v1