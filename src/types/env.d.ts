declare namespace NodeJS {
  interface ProcessEnv {
    APP_API_BASE_URL: string;
    APP_SWAGGER_URL?: string;
    APP_FEATURE_TAG?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};

declare module "*.css";
declare module "*.scss";
declare module "*.sass";

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.module.scss" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.module.sass" {
  const classes: Record<string, string>;
  export default classes;
}
