Serverless SQS CloudWatch Alarms Plugin
=======================================

[![serverless][serverless-badge]][serverless-url]
[![NPM version][version-badge]][npm-url]
[![digitalmaas][dmaas-badge]][dmaas-url]
[![NPM downloads][downloads-badge]][npm-url]
[![CircleCI][circleci-badge]][circleci-url]

> A [Serverless][serverless-url] plugin that simplifies the setup of CloudWatch Alarms to monitor the visible messages in an SQS queue.

Installation
------------
From your target serverless project, run:
```bash
$ npm install --save-dev @digitalmaas/serverless-plugin-sqs-alarms
```

Add the plugin to your `serverless.yml`:
```yaml
plugins:
  - '@digitalmaas/serverless-plugin-sqs-alarms'
```

Configuration
-------------
Configure alarms in `serverless.yml`:
```yaml
custom:
  sqsAlarms:
    - name: your-alarm-name           # optional, unless your queue is a reference (e.g. `Ref`)
      queue: your-sqs-queue-name
      topic: your-sns-topic-name      # references can used, e.g. `Ref`, `Fn::ImportValue`
      treatMissingData: breaching     # optional, <ignore|missing|breaching|notBreaching>
      evaluationPeriods: 1            # optional, default 1
      period: 60                      # optional, default 60
      thresholds:
        - 1
        - 50
        - value: 500
          period: 300                 # optional, overrides upper level config
          evaluationPeriods: 1        # optional, overrides upper level config
          treatMissingData: ignore    # optional, overrides upper level config
```

The `treatMissingData` setting can be a string which is applied to all alarms, or an array to configure alarms individually. Valid types are `ignore, missing, breaching, notBreaching` ([more details in the AWS docs](http://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarms-and-missing-data)).

In the example above, your SNS topic would receive a message when there are more than 1, 50, and 500 visible in SQS.

More Info
---------
- [AWS::CloudWatch::Alarm documentation][aws-alarm-docs]
- [Available CloudWatch metrics for Amazon SQS][aws-sqs-metrics]

License
-------
MIT License.

This project has been forked from the original [serverless-sqs-alarms-plugin][original-plugin] and published under a different name, as the original has been abandoned.

For the complete information, please refer to the [license](./LICENSE) file.



[version-badge]: https://img.shields.io/npm/v/serverless-plugin-browserifier.svg?style=flat-square
[downloads-badge]: https://img.shields.io/npm/dm/serverless-plugin-browserifier.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@digitalmaas/serverless-plugin-sqs-alarms
[serverless-badge]: https://img.shields.io/badge/serverless-%E2%9A%A1-yellow.svg?colorB=555555&style=flat-square
[serverless-url]: http://www.serverless.com
[dmaas-badge]: https://img.shields.io/badge/sponsored%20by-digitalmaas-green.svg?colorB=00CD98&style=flat-square
[dmaas-url]: https://digitalmaas.com/
[circleci-badge]: https://img.shields.io/circleci/project/github/digitalmaas/serverless-plugin-sqs-alarms.svg?style=flat-square
[circleci-url]: https://circleci.com/gh/digitalmaas/serverless-plugin-sqs-alarms
[original-plugin]: https://github.com/sbstjn/serverless-sqs-alarms-plugin
[aws-alarm-docs]: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cw-alarm.html
[aws-sqs-metrics]: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-available-cloudwatch-metrics.html
