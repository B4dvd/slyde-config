// Usage: node merge-config.js
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import json2toml from 'json2toml';

const publicConfigPath = './config.' + process.env.NODE_ENV + '.public.json';
const privateConfigPath = './config.' + process.env.NODE_ENV + '.secret.json';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const combinedPath = process.env.ENV_DIRECTORY ? resolve(__dirname, process.env.ENV_DIRECTORY + process.env.NODE_ENV + '.json') : resolve(__dirname, './../config/' + process.env.NODE_ENV + '.json');
const tomlPath = process.env.ENV_DIRECTORY ? resolve(__dirname, process.env.ENV_DIRECTORY + '.env') : resolve(__dirname, './../.env');

const combineConfigs = async () => {
  console.log('combining configs', process.env.ENV_DIRECTORY, process.env.NODE_ENV, process.env.PROJECT_TARGET);

  const publicConfig = await import(publicConfigPath, { assert: { type: 'json' } });
  const privateConfig = await import (privateConfigPath, { assert: { type: 'json' } });

  const combinedConfig = {
    ...publicConfig.default,
    ...privateConfig.default
  };
  
  if (!process.env.PROJECT_TARGET || process.env.PROJECT_TARGET === 'typescript-grpc') {
    writeFileSync(combinedPath, JSON.stringify(combinedConfig, null, 2));
  }

  const viteCombinedConfig = {};
  const upperCaseConfig = {};
  for (let [key, value] of Object.entries(combinedConfig)) {
    viteCombinedConfig['VITE_' + camelToUnderscore(key)] = value;
    upperCaseConfig[camelToUnderscore(key)] = value;
  }
  if (!process.env.PROJECT_TARGET || process.env.PROJECT_TARGET === 'vite') {
    writeFileSync(combinedPath, JSON.stringify(viteCombinedConfig, null, 2));
    writeFileSync(tomlPath, json2toml(viteCombinedConfig));
  } else if (process.env.PROJECT_TARGET === 'rust') {
    writeFileSync(tomlPath, json2toml(upperCaseConfig));
  }
  
}

combineConfigs().then(() => {
  console.log('combined configs', combinedPath);
}).catch((err) => {
  console.log('failed to combine configs', err);
});

function camelToUnderscore(key) {
  var result = key.replace( /([A-Z])/g, " $1" );
  return result.split(' ').join('_').toUpperCase();
}