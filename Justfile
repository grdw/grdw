set dotenv-load

tag := 'grdw:local'

# Prints all available options
default:
  just --list

# Locally runs jekyll
run:
  bundle exec jekyll serve

# Locally builds a Dockerfile with the current nginx configuration
build-docker:
  docker build -t {{tag}} .

# Runs the Dockerfile with nginx for testing
run-docker:
  docker run -p 8080:8080 -t {{tag}}

# SSH's into the remote box
connect:
  ssh $SSH_USER@$SSH_HOST

# Publishes the static website to the box
publish:
  rsync -av _site/ $SSH_USER@$SSH_HOST:/usr/share/nginx/html/

# Just puts the new config to the user folder
publish-nginx:
  scp nginx.conf $SSH_USER@$SSH_HOST:~
