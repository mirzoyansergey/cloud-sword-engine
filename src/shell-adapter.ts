import { AdapterInterface } from './adapter-interface';
import { Configuration } from './configuration';
import { exec, ExecException } from 'child_process';

export class ShellAdapter implements AdapterInterface {
  private readonly custodian: string;

  constructor(custodian: string) {
    this.custodian = custodian;
  }

  findAllEC2Instances(config: Configuration, tag: string) {
    // add temp policy file
    exec(
      " echo 'policies:\n" +
        '  - name: my-first-policy\n' +
        '    resource: aws.ec2\n' +
        '    filters:\n' +
        `      - \"tag:application\": ${tag}' > test.yaml `,
    );

    // execute
    exec(
      `AWS_DEFAULT_REGION=${config.region} AWS_ACCESS_KEY_ID=${config.accessKeyId} AWS_SECRET_ACCESS_KEY=${config.secretAccessKey} ${this.custodian} run --output-dir=.  test.yaml`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      },
    );
  }
}
