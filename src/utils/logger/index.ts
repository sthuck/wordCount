import debugFactory from 'debug';
const BASE_NAMESPACE = 'WC';

const ErrorNamespace = BASE_NAMESPACE + ':' + 'Error';
const defaultEnabledNamespaces = (process.env.DEBUG ? process.env.DEBUG + ' ' : '') + ErrorNamespace;

debugFactory.enable(defaultEnabledNamespaces);
export const errorLogger = debugFactory(ErrorNamespace);

export const loggerFactory = (namespace: string) => debugFactory(BASE_NAMESPACE + ':' + namespace);
