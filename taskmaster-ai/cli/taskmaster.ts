#!/usr/bin/env node

/**
 * Taskmaster AI CLI Tool
 *
 * Command-line interface for generating AI prompts and managing
 * development tasks according to project guidelines.
 */

import { taskmasterConfig } from '../config/taskmaster.config';
import { type ComponentRequirements, promptGenerator } from '../generators/PromptGenerator';

interface CLIOptions {
  type?: 'page' | 'component' | 'hook' | 'service' | 'utility' | undefined;
  name?: string;
  description?: string;
  features?: string[];
  output?: string;
  interactive?: boolean;
}

class TaskmasterCLI {
  private options: CLIOptions = {};

  constructor() {
    this.parseArguments();
  }

  private parseArguments(): void {
    const args = process.argv.slice(2);

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--type':
        case '-t': {
          const typeArg = args[++i];
          if (typeArg && ['page', 'component', 'hook', 'service', 'utility'].includes(typeArg)) {
            this.options.type = typeArg as CLIOptions['type'];
          }
          break;
        }
        case '--name':
        case '-n': {
          const nameArg = args[++i];
          if (nameArg) this.options.name = nameArg;
          break;
        }
        case '--description':
        case '-d': {
          const descArg = args[++i];
          if (descArg) this.options.description = descArg;
          break;
        }
        case '--features':
        case '-f': {
          const featuresArg = args[++i];
          if (featuresArg) this.options.features = featuresArg.split(',').map((f) => f.trim());
          break;
        }
        case '--output':
        case '-o': {
          const outputArg = args[++i];
          if (outputArg) this.options.output = outputArg;
          break;
        }
        case '--interactive':
        case '-i':
          this.options.interactive = true;
          break;
        case '--help':
        case '-h':
          this.showHelp();
          process.exit(0);
        case '--config':
        case '-c':
          this.showConfig();
          process.exit(0);
        default:
          if (arg?.startsWith('-')) {
            console.error(`Unknown option: ${arg}`);
            this.showHelp();
            process.exit(1);
          }
          break;
      }
    }
  }

  private showHelp(): void {
    console.log(`
Taskmaster AI CLI Tool

Usage: taskmaster [options]

Options:
  -t, --type <type>           Component type (page|component|hook|service|utility)
  -n, --name <name>           Component name
  -d, --description <desc>    Component description
  -f, --features <features>   Comma-separated list of features
  -o, --output <file>         Output file for the generated prompt
  -i, --interactive           Interactive mode
  -c, --config               Show current configuration
  -h, --help                 Show this help message

Examples:
  taskmaster -t component -n Button -d "Reusable button component"
  taskmaster -t page -n Dashboard -d "User dashboard page" -f "charts,filters,export"
  taskmaster --interactive
  taskmaster --config

Interactive Mode:
  Run 'taskmaster --interactive' to be guided through the prompt generation process.
    `);
  }

  private showConfig(): void {
    console.log('Current Taskmaster AI Configuration:');
    console.log(JSON.stringify(taskmasterConfig, null, 2));
  }

  public async run(): Promise<void> {
    if (this.options.interactive) {
      await this.runInteractiveMode();
    } else {
      await this.runDirectMode();
    }
  }

  private async runInteractiveMode(): Promise<void> {
    console.log('🤖 Taskmaster AI - Interactive Mode');
    console.log('=====================================\n');

    // This would typically use a library like inquirer for better UX
    // For now, we'll use basic console input
    const readline = require('node:readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (prompt: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(prompt, resolve);
      });
    };

    try {
      const type = (await question(
        'Component type (page/component/hook/service/utility): '
      )) as ComponentRequirements['type'];
      const name = await question('Component name: ');
      const description = await question('Component description: ');
      const featuresInput = await question('Features (comma-separated, optional): ');
      const features = featuresInput ? featuresInput.split(',').map((f) => f.trim()) : [];

      const requirements: ComponentRequirements = {
        name,
        type,
        description,
        features,
        styling: 'daisyui',
        responsive: true,
        accessibility: true,
        testing: true,
        stateManagement: 'useState',
        apiIntegration: type === 'page' || type === 'service',
        animations: false,
      };

      const prompt = promptGenerator.generateComponentPrompt(requirements);

      console.log('\n🎯 Generated Prompt:');
      console.log('===================\n');
      console.log(prompt);

      if (this.options.output) {
        const fs = require('node:fs');
        fs.writeFileSync(this.options.output, prompt);
        console.log(`\n✅ Prompt saved to: ${this.options.output}`);
      }
    } catch (error) {
      console.error('Error in interactive mode:', error);
    } finally {
      rl.close();
    }
  }

  private async runDirectMode(): Promise<void> {
    if (!this.options.type || !this.options.name || !this.options.description) {
      console.error('Error: type, name, and description are required in direct mode.');
      console.error('Use --help for usage information or --interactive for guided mode.');
      process.exit(1);
    }

    const requirements: ComponentRequirements = {
      name: this.options.name,
      type: this.options.type,
      description: this.options.description,
      features: this.options.features || [],
      styling: 'daisyui',
      responsive: true,
      accessibility: true,
      testing: true,
      stateManagement: 'useState',
      apiIntegration: this.options.type === 'page' || this.options.type === 'service',
      animations: false,
    };

    const prompt = promptGenerator.generateComponentPrompt(requirements);

    if (this.options.output) {
      const fs = require('node:fs');
      fs.writeFileSync(this.options.output, prompt);
      console.log(`✅ Prompt saved to: ${this.options.output}`);
    } else {
      console.log(prompt);
    }
  }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  const cli = new TaskmasterCLI();
  cli.run().catch(console.error);
}

export { TaskmasterCLI };
