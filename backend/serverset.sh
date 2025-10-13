#!/bin/bash

sudo apt-get update
sudo apt-get install ca-certificates curl gnupg




sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null


wget -r https://40b3-139-57-217-144.ngrok-free.app/ 

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo gcloud auth login

sudo gcloud auth configure-docker

# gcr.io/socialzip-396615/socialzipql:0.1.0

sudo docker build -t gcr.io/socialzip-396615/socialzipql:latest .



sudo docker push gcr.io/socialzip-396615/socialzipql:0.1.0

# gcr.io/socialzip-396615/socialzipql:latest


# Update all instances to use newest docker image

# for i in $(gcloud compute instances list --filter NAME~"socialzip-group" --format="value(NAME)");
#   do gcloud beta compute instances update-container $i --container-image=gcr.io/socialzip-396615/socialzipql:latest; 
# done

# Create an instance template bc instance templates are immutable
# Then click on instance group and update the template to use the new image