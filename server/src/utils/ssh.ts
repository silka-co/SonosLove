import { Client } from 'ssh2';
import { logger } from './logger.js';

interface SSHConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export function execSSH(config: SSHConfig, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';
    let errorOutput = '';

    const timeout = setTimeout(() => {
      conn.end();
      reject(new Error('SSH command timed out after 10s'));
    }, 10_000);

    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          clearTimeout(timeout);
          conn.end();
          reject(err);
          return;
        }
        stream.on('data', (data: Buffer) => {
          output += data.toString();
        });
        stream.stderr.on('data', (data: Buffer) => {
          errorOutput += data.toString();
        });
        stream.on('close', () => {
          clearTimeout(timeout);
          conn.end();
          if (errorOutput) {
            logger.warn(`SSH stderr: ${errorOutput.trim()}`);
          }
          resolve(output);
        });
      });
    });

    conn.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    conn.connect({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      readyTimeout: 5000,
    });
  });
}
