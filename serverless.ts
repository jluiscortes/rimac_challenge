import type { AWS } from '@serverless/typescript';
import { 
  DYNAMO_TABLE_NAME,
  MYSQL_DB,MYSQL_HOST,
  MYSQL_PASSWORD,
  MYSQL_PORT,
  MYSQL_USER } from './config'

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
      SNS_TOPIC_ARN: {
        Ref: 'AppointmentTopic'
      },
      //SNS_TOPIC_ARN: 'arn:aws:sns:us-east-1:520411743437:AppointmentTopic',
      DYNAMO_TABLE_NAME: DYNAMO_TABLE_NAME
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
              'events:*'
            ],
            Resource: '*'
          }
        ]
      }
    }
  },
  functions: {
    create: {
      handler: 'src/appointment/setup.CreateAppointmentHandler',
      events: [
        {
          http: {
            method: 'post',
            path: 'appointments/create',
            cors: {
              origin: '*',
              headers: [
                'Content-Type',
                'X-Amz-Date',
                'Authorization',
                'X-Api-Key',
                'X-Amz-Security-Token',
                'X-Amz-User-Agent'
              ],
              allowCredentials: true,
            }
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
        MYSQL_HOST: MYSQL_HOST,
        MYSQL_USER: MYSQL_USER,
        MYSQL_PASSWORD: MYSQL_PASSWORD,
        MYSQL_DB: MYSQL_DB,
        MYSQL_PORT: MYSQL_PORT,
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
        MYSQL_HOST: MYSQL_HOST,
        MYSQL_USER: MYSQL_USER,
        MYSQL_PASSWORD: MYSQL_PASSWORD,
        MYSQL_DB: MYSQL_DB,
        MYSQL_PORT: MYSQL_PORT,
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
        DYNAMO_TABLE_NAME: DYNAMO_TABLE_NAME,
      },
      dependsOn: ['SQSConformityUpdate', 'SQSPolicyConformityUpdate']
    },
    appointments: {
      handler: 'src/appointment/setup.FindAllAppointmentHandler',
      events: [
        {
          http: {
            method: 'get',
            path: 'appointments',
            cors: {
              origin: '*',
              headers: [
                'Content-Type',
                'X-Amz-Date',
                'Authorization',
                'X-Api-Key',
                'X-Amz-Security-Token',
                'X-Amz-User-Agent'
              ],
              allowCredentials: true,
            }
          },
        },
      ],
    },
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
                Principal: '*', // Permitir cualquier servicio de AWS (incluido EventBridge)
                Action: 'sqs:SendMessage',
                Resource: { 'Fn::GetAtt': ['SQSConformityUpdate', 'Arn'] }
              }
            ]
          }
        }
      },

      // Event Rule for Appointment Created
      EventRuleAppointmentCreated: {
        Type: 'AWS::Events::Rule',
        Properties: {
          Name: 'AppointmentCreatedRule',
          Description: 'Regla para capturar eventos de AppointmentCreated',
          EventBusName: 'default',
          EventPattern: {
            source: ['ms.appointment'],
            'detail-type': ['AppointmentCreated']
          },
          State: 'ENABLED',
          Targets: [
            {
              Arn: { 'Fn::GetAtt': ['SQSConformityUpdate', 'Arn'] },
              Id: 'TargetSQSConformityUpdate'
            }
          ]
        }
      },
      // Permiso para que EventBridge pueda enviar a SQS
      EventBridgeToSQSPermission: {
        Type: 'AWS::Lambda::Permission',
        Properties: {
          Action: 'lambda:InvokeFunction',
          FunctionName: { 'Fn::GetAtt': ['UpdateStatusFromSQSLambdaFunction', 'Arn'] },
          Principal: 'events.amazonaws.com',
          SourceArn: { 'Fn::GetAtt': ['EventRuleAppointmentCreated', 'Arn'] }
        }
      }
    }
  }
};

module.exports = config;
