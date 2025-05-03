import type { AWS } from '@serverless/typescript';

const config: AWS = {
  service: 'ms-appointment',
  plugins: ['serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    deploymentBucket: {
      name: 'ms-appointment-deployment'
    },
    environment: {
      SNS_TOPIC_ARN: {
        Ref: 'AppointmentTopic'
      },
      DYNAMO_TABLE_NAME: 'appointments',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'sns:*',
              'dynamodb:*',
              'sqs:*'
            ],
            Resource: '*'
          }
        ]
      }
    }
  },
  functions: {
    initalize: {
      handler: 'src/appointment/setup.CreateAppointmentHandler',
      events: [
        {
          http: {
            method: 'post',
            path: 'initalize',
          },
        },
      ],
    },
    updateStatus: {
      handler: 'src/appointment/setup.UpdateAppointmentStatusHandler',
      events: [
        {
          http: {
            method: 'post',
            path: 'update-status',
          },
        },
      ],
    },
    appointmentPE: {
      handler: 'src/appointment_pe/interfaces/sqs/handler.handler',
      events: [
        {
          sqs: {
            arn: {
              'Fn::GetAtt': ['SQSAppointmentPE', 'Arn']
            }
          }
        }
      ],
      environment: {
        MYSQL_HOST: 'mydbtest.c8vq2oe4eoyh.us-east-1.rds.amazonaws.com',
        MYSQL_USER: 'koki',
        MYSQL_PASSWORD: 'koki1212',
        MYSQL_DB: 'appointments',
        MYSQL_PORT: '3306',
      }
    }
  },
  resources: {
    Resources: {
      // SNS Topic
      AppointmentTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'AppointmentTopic'
        }
      },

      // SQS Queue
      SQSAppointmentPE: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'sqs_pe'
        }
      },

      // SNS → SQS Subscription
      SubscriptionPE: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          TopicArn: { Ref: 'AppointmentTopic' },
          Protocol: 'sqs',
          Endpoint: { 'Fn::GetAtt': ['SQSAppointmentPE', 'Arn'] },
          FilterPolicy: {
            countryISO: ['PE']
          },
          RawMessageDelivery: true
        }
      },

      // Allow SNS to send to SQS
      SQSPolicyPE: {
        Type: 'AWS::SQS::QueuePolicy',
        Properties: {
          Queues: [{ Ref: 'SQSAppointmentPE' }],
          PolicyDocument: {
            Statement: [
              {
                Effect: 'Allow',
                Principal: '*',
                Action: 'sqs:SendMessage',
                Resource: { 'Fn::GetAtt': ['SQSAppointmentPE', 'Arn'] },
                Condition: {
                  ArnEquals: {
                    'aws:SourceArn': { Ref: 'AppointmentTopic' }
                  }
                }
              }
            ]
          }
        }
      },
      // Code Deploy Bucket
      DeploymentBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: 'ms-appointment-deployment'
        }
      }
    }
  }
};

module.exports = config;
