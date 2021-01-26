import Knex from 'knex';

const optionMap: OptionParseMap = {
  host: ['DB_HOST'],
  port: ['DB_PORT', (s) => parseInt(s, 10)],
  database: ['DB_NAME'],
  user: ['DB_USER'],
  password: ['DB_PASSWORD'],
  debug: ['DB_DEBUG', (s) => !!s],
};

export const mysqlSettingsFromEnv = (): Knex.MySql2ConnectionConfig => {
  const defaults: Knex.MySql2ConnectionConfig = {
    host: 'localhost',
    port: 3306,
    database: 'defaultDb',
    user: 'user',
    password: 'sa',
  };

  const envConf = Object.keys(optionMap).reduce((conf, key) => {
    const [envKey, parseFn] = (optionMap as Record<string, [string, Function]>)[key];
    const value = process.env[envKey];
    if (value) {
      const parsedValue = parseFn ? parseFn(value) : value;
      conf[key as keyof MySqlEnvOptions] = parsedValue;
    }
    return conf;
  }, {} as Partial<MySqlEnvOptions>);

  return { ...defaults, ...envConf };
};

type PrimitiveOptions<T> = {
  [K in keyof T as T[K] extends undefined | string | boolean | number ? K : never]-?: T[K];
};
type MySqlEnvOptions = PrimitiveOptions<Knex.MySql2ConnectionConfig>;
type OptionParseMap = Partial<
  {
    [K in keyof MySqlEnvOptions]: [string, ((arg: string) => NonNullable<MySqlEnvOptions[K]>)?];
  }
>;
