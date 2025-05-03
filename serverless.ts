import type { AWS } from '@serverless/typescript';

const config: AWS = {
  service: 'ms-appointment',
  plugins: ['serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    //deploymentBucket: {
    //  name: 'ms-appointment-deployment'
    //},
    environment: {
      //SNS_TOPIC_ARN: {
      //  Ref: 'AppointmentTopic'
      //},
      SNS_TOPIC_ARN: 'arn:aws:sns:us-east-1:520411743437:AppointmentTopic',
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
              'sqs:*',
              'events:PutEvents'
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
        MYSQL_HOST: 'database-1.c8vq2oe4eoyh.us-east-1.rds.amazonaws.com',
        MYSQL_USER: 'admin',
        MYSQL_PASSWORD: 'qBZiZ5lUZm7KGNNbp3Ra',
        MYSQL_DB: 'Agendamiento',
        MYSQL_PORT: '3306',
      }
    },
    appointmentCL: {
      handler: 'src/appointment_cl/interfaces/sqs/handler.handler',
      events: [
        {
          sqs: {
            arn: {
              'Fn::GetAtt': ['SQSAppointmentCL', 'Arn']
            }
          }
        }
      ],
      environment: {
        MYSQL_HOST: 'database-1.c8vq2oe4eoyh.us-east-1.rds.amazonaws.com',
        MYSQL_USER: 'admin',
        MYSQL_PASSWORD: 'qBZiZ5lUZm7KGNNbp3Ra',
        MYSQL_DB: 'Agendamiento',
        MYSQL_PORT: '3306',
      }
    },
    updateStatusFromSQS: {
      handler: 'src/appointment/setup.SqsToUpdateStatus',
      events: [
        {
          sqs: {
            arn: {
              'Fn::GetAtt': ['SQSConformityUpdate', 'Arn']
            }
          }
        }
      ],
      environment: {
        DYNAMO_TABLE_NAME: 'appointments'
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

      // SNS to SQS Subscription
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

      // SQS Queue for CL
      SQSAppointmentCL: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'sqs_cl'
        }
      },
      
      // SNS to SQS Subscription
      SubscriptionCL: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          TopicArn: { Ref: 'AppointmentTopic' },
          Protocol: 'sqs',
          Endpoint: { 'Fn::GetAtt': ['SQSAppointmentCL', 'Arn'] },
          FilterPolicy: {
            countryISO: ['CL']
          },
          RawMessageDelivery: true
        }
      },
      
      // Allow SNS to send to SQS for CL
      SQSPolicyCL: {
        Type: 'AWS::SQS::QueuePolicy',
        Properties: {
          Queues: [{ Ref: 'SQSAppointmentCL' }],
          PolicyDocument: {
            Statement: [
              {
                Effect: 'Allow',
                Principal: '*',
                Action: 'sqs:SendMessage',
                Resource: { 'Fn::GetAtt': ['SQSAppointmentCL', 'Arn'] },
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

      // Event Rule for Appointment Created
      SQSConformityUpdate: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'sqs_conformity_update'
        }
      },

      // Event Rule
      SQSPolicyConformityUpdate: {
        Type: 'AWS::SQS::QueuePolicy',
        Properties: {
          Queues: [{ Ref: 'SQSConformityUpdate' }],
          PolicyDocument: {
            Statement: [
              {
                Effect: 'Allow',
                Principal: '*',
                Action: 'sqs:SendMessage',
                Resource: { 'Fn::GetAtt': ['SQSConformityUpdate', 'Arn'] },
                Condition: {
                  ArnEquals: {
                    'aws:SourceArn': {
                      'Fn::Sub': 'arn:aws:events:${AWS::Region}:${AWS::AccountId}:event-bus/default'
                    }
                  }
                }
              }
            ]
          }
        }
      },
      
      
      // Event Rule for Appointment Created
      EventRuleAppointmentCreated: {
        Type: 'AWS::Events::Rule',
        Properties: {
          EventBusName: 'default',
          EventPattern: {
            source: ['ms.appointment'],
            detailType: ['AppointmentCreated']
          },
          Targets: [
            {
              Arn: { 'Fn::GetAtt': ['SQSConformityUpdate', 'Arn'] },
              Id: 'TargetSQSConformityUpdate'
            }
          ]
        }
      },
    
      // Code Deploy Bucket
      //DeploymentBucket: {
      //  Type: 'AWS::S3::Bucket',
      //  Properties: {
      //    BucketName: 'ms-appointment-deployment'
      //  }
      //}
    }
  }
};

module.exports = config;
