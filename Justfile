set dotenv-load

tag := 'grdw:local'
# For locally building and running
build:
  docker build -t {{tag}} .
run:
  docker run -p 8080:8080 -t {{tag}}
# For remote:
connect:
  ssh $SSH_USER@$SSH_HOST
publish:

