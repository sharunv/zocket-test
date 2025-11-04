Create Task Tracker Application in Node.Js
*******************************************
Create following files in task-tracker app folder:

        * index.js
        * db.js
        * package.json


Write a Dockerfile for the Node.js application
**********************************************

        FROM node:18-alpine
        WORKDIR /usr/src/app
        COPY package*.json ./
        RUN npm ci --only=production
        COPY . .
        ENV PORT=3000
        EXPOSE 3000
        CMD ["node", "index.js"]


This will creates a new Docker image includes:

        * Node.js runtime
        * App source code
        * All production dependencies
        * Environment configuration PORT=3000




Provisioning infrastructure using Terraform
********************************************


Set Access key and Secret key for an IAM user:

        export AWS_ACCESS_KEY_ID="xxxxxxxxxxxxxxxxxxx"
        export AWS_SECRET_ACCESS_KEY="yyyyyyyyyyyyyyyyyyyyyyyyy"
        export AWS_DEFAULT_REGION="us-east-1"


Terraform Commands:

        *terraform init
        *terraform validate 
        *terraform plan
        *terraform apply


This will creates:

        * 1 VPC
        * 1 Public Subnet
        * Internet Gateway
        * Route Table allowing Internet access
        * 1 EC2 Instance with public IP
        * Security group

Output shows:

        * EC2 instance Public IP
        * VPC/Subnet ID




Set up a CI-CD pipeline using Githubaction:
******************************************
  * Define secret variables for AWS Access Key and Secret Access key in Github
***************************************************************
 name: CI/CD to AWS EC2 from ECR
 on:
  push:
    branches: [ main ]
 env:
  AWS_REGION: ${{ secrets.AWS_REGION }}
  ECR_REPOSITORY: ${{ secrets.ECR_REPOSITORY }}
  AWS_ACCOUNT_ID: ${{ secrets.AWS_ACCOUNT_ID }}
  IMAGE_TAG: latest
 jobs:
  build-test-push-deploy:
    runs-on: ubuntu-latest

    steps:
      # Checkout repo
      - name: Checkout code
        uses: actions/checkout@v4

      # Set up Node.js & run tests
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          cd app
          npm ci

      - name: Run tests
        run: |
          cd app
          npm test

      # Configure AWS and login to ECR
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      
      # Build and Push Docker Image
      - name: Build, tag, and push image to ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        run: |
          cd app
          docker build -t $ECR_REGISTRY/${{ env.ECR_REPOSITORY }}:${{ env.IMAGE_TAG }} ./task-tracker
          docker push $ECR_REGISTRY/${{ env.ECR_REPOSITORY }}:${{ env.IMAGE_TAG }}

      # Deploy to EC2 via SSH
      - name: Deploy on EC2
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        run: |  
          chmod 400 instance-key.pem

          ssh -o StrictHostKeyChecking=no -i instance_key.pem ${{ secrets.EC2_USER }}@${{ secrets.EC2_HOST }} << 'EOF'
            set -e
            sudo apt update -y
            sudo apt install -y docker.io awscli
            sudo systemctl enable --now docker

            aws ecr get-login-password --region ${{ secrets.AWS_REGION }} | \
              sudo docker login --username AWS --password-stdin ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com

            sudo docker pull ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/${{ secrets.ECR_REPOSITORY }}:${{ env.IMAGE_TAG }}

            # Run new container
            sudo docker run -d --name task-tracker -p 80:3000 \
              ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/${{ secrets.ECR_REPOSITORY }}:${{ env.IMAGE_TAG }}
          EOF
**************************************************************************************************


The above pipeline will:


        * Configure AWS
        * Login to ECR repository
        * Build and push Dockerimage to ECR
        * Deploy Docker image to EC2 instance




Monitoring using Grafana Agent:
*******************************

Install Grafana Agent on EC2 instance:

SSH to EC2 Instance:
        ssh -i instance-key.pem ubuntu@30.21.39.17

Download and Install Grafana Agent:
    curl -fsSL https://raw.githubusercontent.com/grafana/agent/main/scripts/install.sh | sudo bash

Configure Grafana Agent:

sudo nano /etc/grafana-agent.yaml
*******************************************
metrics:
  global:
    scrape_interval: 15s
  configs:
    - name: local
      scrape_configs:
        - job_name: "app"
          static_configs:
            - targets: ["localhost:3000"] 
*******************************************


Start and Enable the services:

        sudo systemctl enable grafana-agent
        sudo systemctl start grafana-agent
        sudo systemctl status grafana-agent


Check metrics collection locally:

        curl http://localhost:12345/metrics








