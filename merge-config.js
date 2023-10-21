import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import json2toml from 'json2toml';

const publicConfigPath = './config.' + process.env.NODE_ENV + '.public.json';
const privateConfigPath = './config.' + process.env.NODE_ENV + '.secret.json';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const combinedPath = resolve(__dirname, './../config/' + process.env.NODE_ENV + '.json');
const tomlPath = resolve(__dirname, './../.env');

const combineConfigs = async () => {
  const publicConfig = await import(publicConfigPath, { assert: { type: 'json' } });
  const privateConfig = await import (privateConfigPath, { assert: { type: 'json' } });

  const combinedConfig = {
    ...publicConfig.default,
    ...privateConfig.default
  };
  
  writeFileSync(combinedPath, JSON.stringify(combinedConfig, null, 2));

  const viteCombinedConfig = {};
  for (let [key, value] of Object.entries(combinedConfig)) {
    viteCombinedConfig['VITE_' + camelToUnderscore(key)] = value;
  }

  writeFileSync(tomlPath, json2toml(viteCombinedConfig));
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