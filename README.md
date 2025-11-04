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