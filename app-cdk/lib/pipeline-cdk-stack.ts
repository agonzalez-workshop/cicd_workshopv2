import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class MyPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Recupera el secreto de GitHub
    const githubSecret = secretsmanager.Secret.fromSecretNameV2(this, 'GitHubSecret', 'github/personal_access_token2');

    // Crea un proyecto de CodeBuild
    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
    });

    // Define los artefactos
    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    // Define el pipeline
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'MyPipeline',
    });

    // Agrega la etapa de origen con GitHub
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipeline_actions.CodeStarConnectionsSourceAction({
          actionName: 'CheckOut',
          owner: 'agonzalez-workshop', // Nombre de la organización
          repo: 'cicd_workshopv2',
          output: sourceOutput,
          branch: 'main', // o la rama que prefieras
          connectionArn: "arn:aws:secretsmanager:us-east-1:928159460500:secret:github/personal_access_token2-zKRk0G"
        }),
      ],
    });

    // Agrega la etapa de construcción
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Build',
          project: buildProject,
          input: sourceOutput,
          outputs: [buildOutput],
        }),
      ],
    });
  }
}